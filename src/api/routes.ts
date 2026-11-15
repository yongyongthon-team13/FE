// src/api/routes.ts
// 병원까지 경로 찾기: POST /api/v1/route-plans/search, GET /api/v1/route-plans/{id}
import { ensureElderId } from "@/api/elderProfile";
import { apiData, apiRequest } from "@/lib/api";
import { getHomePoint } from "./homeLocation";

const SEARCH_MODE = "TRANSIT"; // 검색: WALK | TRANSIT
const isWalk = (mode?: string) => mode === "WALK"; // 구간: WALK | BUS | SUBWAY

/** 화면에서 쓰는 경로 */
export type RoutePlan = {
  id: string;
  buses: string[];
  walkMeters: number;
  transfers: number;
  minutes: number;
  recommended?: boolean;
  hasSubway?: boolean; // 지하철 구간이 있으면 제목에 '저상버스'를 붙이지 않음
};

export type RouteStep = {
  type: "walk" | "bus";
  title: string;
  summary: string;
};

// ── 서버 응답
type Point = { name: string; latitude?: number; longitude?: number };
type Leg = {
  sequence: number;
  mode: string;
  start: Point;
  end: Point;
  durationSeconds: number;
  distanceMeters: number;
  route?: { routeName?: string } | null;
  stops?: { name: string }[] | null;
  geometry?: number[][] | null; // 지나가는 선 좌표
};
type ServerRoutePlan = {
  routePlanId: string;
  summary: { durationSeconds: number; transferCount: number };
  legs: Leg[];
};

const busName = (leg: Leg) => {
  const name = leg.route?.routeName ?? "버스";
  return /^\d+$/.test(name) ? `${name}번` : name;
};
const minutes = (sec: number) => Math.max(1, Math.round(sec / 60));

function toRoutePlan(p: ServerRoutePlan, i: number): RoutePlan {
  return {
    id: p.routePlanId,
    buses: p.legs.filter((l) => !isWalk(l.mode)).map(busName),
    walkMeters: p.legs
      .filter((l) => isWalk(l.mode))
      .reduce((sum, l) => sum + (l.distanceMeters ?? 0), 0),
    transfers: p.summary?.transferCount ?? 0,
    minutes: minutes(p.summary?.durationSeconds ?? 0),
    recommended: i === 0,
    hasSubway: p.legs.some((l) => l.mode === "SUBWAY"),
  };
}

/** 응답 안에서 위도·경도가 있는 첫 장소 찾기 (응답 모양이 명세에 확실하지 않아 넓게 찾음) */
function firstCoords(o: unknown): { latitude: number; longitude: number } | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const lat = r.latitude ?? r.lat;
  const lon = r.longitude ?? r.lon ?? r.lng;
  if (typeof lat === "number" && typeof lon === "number")
    return { latitude: lat, longitude: lon };
  for (const v of Array.isArray(o) ? o : Object.values(r)) {
    const found = firstCoords(v);
    if (found) return found;
  }
  return null;
}

/** 병원 좌표가 없으면(문자·직접 입력 일정) 병원 이름으로 장소 검색 → 일정에도 저장 */
async function findClinicCoords(
  appointmentId: string,
  clinicName: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (clinicName.trim().length < 2) return null;
  try {
    const res = await apiRequest<unknown>(
      `/api/v1/places?q=${encodeURIComponent(clinicName.trim())}&limit=1`,
    );
    const coords = firstCoords(res);
    if (!coords) return null;
    // 다음부터는 바로 쓰도록 일정에 좌표 저장 (실패해도 길찾기는 계속)
    apiRequest(`/api/v1/appointments/${appointmentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        clinicLat: coords.latitude,
        clinicLon: coords.longitude,
      }),
    }).catch(() => {});
    return coords;
  } catch (e) {
    console.warn("병원 위치 찾기 실패", e);
    return null;
  }
}

// ── 시연용 목업 경로
/** true: 서버 길찾기를 부르지 않고 항상 시연용 경로 / false: 서버 경로 (실패·0개면 시연용) */
const ALWAYS_DEMO_ROUTES = true;
const DEMO_PREFIX = "demo-";
const isDemo = (id: string) => id.startsWith(DEMO_PREFIX);
const DEMO_HOME: [number, number] = [37.2342, 127.2017]; // 처인구청 부근
const DEMO_HOSPITAL: [number, number] = [37.271, 127.126]; // 용인착한마디의원 (기흥구 강남로 3)
const DEMO_HOSPITAL_STOP: [number, number] = [37.2707, 127.1256]; // 강남대역.강남대입구 정류장

type DemoPlan = RoutePlan & { steps: RouteStep[]; path: [number, number][] };
const DEMO_PLANS: DemoPlan[] = [
  {
    id: "demo-1",
    buses: ["10번"],
    walkMeters: 180,
    transfers: 0,
    minutes: 35,
    recommended: true,
    steps: [
      { type: "walk", title: "집 → 처인구청 정류장", summary: "걸어서 120m · 2분" },
      { type: "bus", title: "10번 저상버스", summary: "6개의 정거장 · 28분" },
      { type: "walk", title: "강남대역 정류장 → 용인착한마디의원", summary: "걸어서 60m · 1분" },
    ],
    path: [DEMO_HOME, [37.2365, 127.1935], [37.241, 127.1776], [37.252, 127.16], [37.264, 127.142], [37.269, 127.13], DEMO_HOSPITAL_STOP, DEMO_HOSPITAL],
  },
  {
    id: "demo-2",
    buses: ["66번", "10번"],
    walkMeters: 90,
    transfers: 1,
    minutes: 42,
    steps: [
      { type: "walk", title: "집 → 김량장동 정류장", summary: "걸어서 50m · 1분" },
      { type: "bus", title: "66번 저상버스", summary: "3개의 정거장 · 12분" },
      { type: "bus", title: "10번 저상버스", summary: "4개의 정거장 · 25분" },
      { type: "walk", title: "강남대역 정류장 → 용인착한마디의원", summary: "걸어서 40m · 1분" },
    ],
    path: [DEMO_HOME, [37.2348, 127.1985], [37.2395, 127.182], [37.2495, 127.164], [37.2615, 127.145], [37.2685, 127.1315], DEMO_HOSPITAL_STOP, DEMO_HOSPITAL],
  },
  {
    id: "demo-3",
    buses: ["5번"],
    walkMeters: 250,
    transfers: 0,
    minutes: 45,
    steps: [
      { type: "walk", title: "집 → 용인중앙시장 정류장", summary: "걸어서 200m · 4분" },
      { type: "bus", title: "5번 저상버스", summary: "8개의 정거장 · 38분" },
      { type: "walk", title: "강남대역 정류장 → 용인착한마디의원", summary: "걸어서 50m · 1분" },
    ],
    path: [DEMO_HOME, [37.2372, 127.1995], [37.2455, 127.1845], [37.2555, 127.1625], [37.2665, 127.1405], [37.2698, 127.1285], DEMO_HOSPITAL_STOP, DEMO_HOSPITAL],
  },
];
const toLatLngPoint = ([latitude, longitude]: [number, number]) => ({ latitude, longitude });

/** 시연용 목적지 (길 안내 화면의 병원 이름·위치) */
export const DEMO_DESTINATION = {
  name: "용인착한마디의원",
  stopName: "강남대역.강남대입구 정류장",
  latitude: DEMO_HOSPITAL[0],
  longitude: DEMO_HOSPITAL[1],
};
/** 지금 시연용 경로를 쓰는 중인지 */
export const usingDemoRoutes = () => ALWAYS_DEMO_ROUTES;

/** 보호자 연동용: 서버에 이동 기록(trip)을 만들려면 실제 경로 id가 필요해서
 *  시연 경로와 같은 출발(집)·도착(시연 병원)으로 서버 경로를 하나 받아 둠 (실패하면 null) */
export async function findServerRoutePlanId(): Promise<string | null> {
  const home = await getHomePoint();
  const res = await apiData<{ alternatives: ServerRoutePlan[] }>(
    "/api/v1/route-plans/search",
    {
      method: "POST",
      body: JSON.stringify({
        origin: { name: "집", ...home },
        destination: {
          name: DEMO_DESTINATION.name,
          latitude: DEMO_DESTINATION.latitude,
          longitude: DEMO_DESTINATION.longitude,
        },
        mode: SEARCH_MODE,
        count: 1,
      }),
    },
  );
  return res.alternatives?.[0]?.routePlanId ?? null;
}

// 한 번에 5개 받아 두고 '다른 길 추천하기'는 그 안에서 3개씩 보여주기 (서버에 제외 기능 없음)
let cache: { appointmentId: string; plans: RoutePlan[] } | null = null;

async function fetchPlans(appointmentId: string): Promise<RoutePlan[]> {
  const appt = await apiRequest<{
    clinicName?: string | null;
    clinicLat?: number | null;
    clinicLon?: number | null;
  }>(`/api/v1/appointments/${appointmentId}`);

  const home = await getHomePoint(); // 등록한 집 위치 (없으면 처인구청)
  const clinic =
    appt.clinicLat != null && appt.clinicLon != null
      ? { latitude: appt.clinicLat, longitude: appt.clinicLon }
      : await findClinicCoords(appointmentId, appt.clinicName ?? "");
  const routeSearch = {
    origin: { name: "집", ...home },
    destination: {
      name: appt.clinicName ?? "병원",
      ...(clinic ?? {}),
    },
    mode: SEARCH_MODE,
    count: 5,
  };

  // 1) AI 추천: POST /api/v1/route-plans/recommendations (어르신 몸 상태 반영)
  const elderId = await ensureElderId();
  if (elderId) {
    try {
      const rec = await apiData<{
        recommendedRoutePlanId?: string | null;
        routeSearch?: { alternatives: ServerRoutePlan[] } | null;
      }>("/api/v1/route-plans/recommendations", {
        method: "POST",
        body: JSON.stringify({ elderId, routeSearch }),
      });
      const list = rec.routeSearch?.alternatives ?? [];
      if (list.length > 0) {
        // 추천 경로를 맨 앞으로
        const sorted = [...list].sort(
          (a, b) =>
            Number(b.routePlanId === rec.recommendedRoutePlanId) -
            Number(a.routePlanId === rec.recommendedRoutePlanId),
        );
        return sorted.map((p, i) => ({
          ...toRoutePlan(p, i),
          recommended: p.routePlanId === rec.recommendedRoutePlanId,
        }));
      }
    } catch {
      // AI 실패 → 아래 일반 검색으로
    }
  }

  // 2) 일반 검색: POST /api/v1/route-plans/search (첫 번째를 추천으로)
  const res = await apiData<{ alternatives: ServerRoutePlan[] }>(
    "/api/v1/route-plans/search",
    {
      method: "POST",
      body: JSON.stringify(routeSearch),
    },
  );
  return (res.alternatives ?? []).map(toRoutePlan);
}
/** 경로 3개 (이미 본 id는 빼고) */
export async function searchRoutePlans(
  appointmentId: string,
  excludeIds: string[] = [],
): Promise<RoutePlan[]> {
  if (cache?.appointmentId !== appointmentId) {
    let plans: RoutePlan[] = [];
    if (!ALWAYS_DEMO_ROUTES) {
      try {
        plans = await fetchPlans(appointmentId);
      } catch (e) {
        console.warn("길 찾기 실패 → 시연용 경로 사용", e);
      }
    }
    // 서버에서 못 받으면 시연용 목업 경로
    if (plans.length === 0) plans = DEMO_PLANS.map(({ steps, path, ...p }) => p);
    cache = { appointmentId, plans };
  }
  return cache.plans.filter((p) => !excludeIds.includes(p.id)).slice(0, 3);
}

/** 경로 상세: 단계별 카드 */
type LatLng = { latitude: number; longitude: number };

/** 좌표 한 점 → [위도, 경도] (경도·위도 순서로 와도 맞춰 줌: 위도는 90을 넘지 않음) */
const toLatLng = (pt: number[]): [number, number] =>
  Math.abs(pt[0]) > 90 ? [pt[1], pt[0]] : [pt[0], pt[1]];
const toPoint = (pt?: Point | null): LatLng | null =>
  pt?.latitude != null && pt?.longitude != null
    ? { latitude: pt.latitude, longitude: pt.longitude }
    : null;

export async function getRoutePlan(id: string): Promise<
  | (RoutePlan & {
      steps: RouteStep[];
      path: [number, number][]; // 지도에 그릴 경로 선
      start: LatLng | null; // 출발 (집)
      end: LatLng | null; // 도착 (병원)
    })
  | null
> {
  if (isDemo(id)) {
    const demoPlan = DEMO_PLANS.find((d) => d.id === id);
    if (!demoPlan) return null;
    return {
      ...demoPlan,
      start: toLatLngPoint(DEMO_HOME),
      end: toLatLngPoint(DEMO_HOSPITAL),
    };
  }
  const p = await apiData<ServerRoutePlan>(`/api/v1/route-plans/${id}`);
  if (!p) return null;
  const legs = [...p.legs].sort((a, b) => a.sequence - b.sequence);
  const steps: RouteStep[] = legs.map((leg) =>
    isWalk(leg.mode)
      ? {
          type: "walk",
          title: `${leg.start.name} → ${leg.end.name}`,
          summary: `걸어서 ${leg.distanceMeters}m · ${minutes(leg.durationSeconds)}분`,
        }
      : {
          type: "bus",
          title:
            leg.mode === "SUBWAY"
              ? `${leg.route?.routeName ?? "지하철"} 지하철`
              : `${busName(leg)} 저상버스`,
          summary: `${Math.max((leg.stops?.length ?? 1) - 1, 1)}개의 정거장 · ${minutes(leg.durationSeconds)}분`,
        },
  );
  return {
    ...toRoutePlan(p, 0),
    steps,
    path: legs.flatMap((l) =>
      (l.geometry ?? []).filter((pt) => pt.length >= 2).map(toLatLng),
    ),
    start: toPoint(legs[0]?.start),
    end: toPoint(legs[legs.length - 1]?.end),
  };
}

export type DeparturePlan = {
  date: string; // 병원 가는 날 'YYYY-MM-DD'
  departAt: string; // 화면용 출발 시각, 예: '오전 8:45'
  arriveAt: string; // 화면용 병원 도착 예상, 예: '9:28'
  departDate: Date; // 알림 시각 계산용
  hospital: string;
  appointmentTime: string; // 진료 시각, 예: '오전 10:00'
};

/** 진료 시각보다 이만큼 먼저 병원에 도착하도록 (접수 여유) */
const ARRIVE_EARLY_MIN = 15;

const pad2 = (n: number) => String(n).padStart(2, "0");
const ampmLabel = (d: Date) =>
  `${d.getHours() < 12 ? "오전" : "오후"} ${d.getHours() % 12 || 12}:${pad2(d.getMinutes())}`;

/** 진료 시각 - 15분 - 경로 소요시간 = 출발 시각 */
export async function getDeparturePlan(
  routeId: string,
  appointmentId: string,
): Promise<DeparturePlan> {
  const demoPlan = DEMO_PLANS.find((d) => d.id === routeId);
  const [plan, appt] = await Promise.all([
    demoPlan
      ? Promise.resolve({ summary: { durationSeconds: demoPlan.minutes * 60 } })
      : apiData<ServerRoutePlan>(`/api/v1/route-plans/${routeId}`),
    apiRequest<{ clinicName?: string | null; appointmentAt?: string | null }>(
      `/api/v1/appointments/${appointmentId}`,
    ),
  ]);
  if (!appt.appointmentAt) throw new Error("진료 시간이 없어요");

  const at = new Date(appt.appointmentAt);
  const arrive = new Date(at.getTime() - ARRIVE_EARLY_MIN * 60_000);
  const depart = new Date(
    arrive.getTime() - (plan.summary?.durationSeconds ?? 0) * 1000,
  );
  return {
    date: `${at.getFullYear()}-${pad2(at.getMonth() + 1)}-${pad2(at.getDate())}`,
    departAt: ampmLabel(depart),
    arriveAt: `${arrive.getHours()}:${pad2(arrive.getMinutes())}`,
    departDate: depart,
    hospital: appt.clinicName ?? "병원",
    appointmentTime: ampmLabel(at),
  };
}
