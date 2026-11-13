// src/api/routes.ts
// 병원까지 경로 찾기: POST /api/v1/route-plans/search, GET /api/v1/route-plans/{id}
import { apiData, apiRequest } from "@/lib/api";
import { getElderId } from "@/lib/tokenStorage";
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

// 한 번에 5개 받아 두고 '다른 길 추천하기'는 그 안에서 3개씩 보여주기 (서버에 제외 기능 없음)
let cache: { appointmentId: string; plans: RoutePlan[] } | null = null;

async function fetchPlans(appointmentId: string): Promise<RoutePlan[]> {
  const appt = await apiRequest<{
    clinicName?: string | null;
    clinicLat?: number | null;
    clinicLon?: number | null;
  }>(`/api/v1/appointments/${appointmentId}`);

  const home = await getHomePoint(); // 등록한 집 위치 (없으면 처인구청)
  const routeSearch = {
    origin: { name: "집", ...home },
    destination: {
      name: appt.clinicName ?? "병원",
      ...(appt.clinicLat != null && appt.clinicLon != null
        ? { latitude: appt.clinicLat, longitude: appt.clinicLon }
        : {}),
    },
    mode: SEARCH_MODE,
    count: 5,
  };

  // 1) AI 추천: POST /api/v1/route-plans/recommendations (어르신 몸 상태 반영)
  const elderId = await getElderId();
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
    cache = { appointmentId, plans: await fetchPlans(appointmentId) };
  }
  return cache.plans.filter((p) => !excludeIds.includes(p.id)).slice(0, 3);
}

/** 경로 상세: 단계별 카드 */
export async function getRoutePlan(
  id: string,
): Promise<(RoutePlan & { steps: RouteStep[] }) | null> {
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
  return { ...toRoutePlan(p, 0), steps };
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
  const [plan, appt] = await Promise.all([
    apiData<ServerRoutePlan>(`/api/v1/route-plans/${routeId}`),
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
