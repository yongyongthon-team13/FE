// src/api/trips.ts
// 이동 기록: 길 안내 시작(POST /trips) + 탑승·하차·도착·도움 요청 이벤트 + 체크인
import * as Location from "expo-location";

import { apiData, apiRequest } from "@/lib/api";
import { SIZE_LABEL } from "./clinics";
import type { Direction, GuideSession, GuideStep, OnBusStep, WaitBusStep } from "./guide";
import { searchRoutePlans } from "./routes";

export type TripEvent =
  | "BOARDED"
  | "ALIGHTED"
  | "ARRIVED"
  | "HELP_REQUESTED"
  | "CANCELLED"
  | "ABORTED";

/** 서버 연결 실패로 목업 안내 중이면 서버에 안 보냄 */
const isMockTrip = (tripId: string) => tripId.startsWith("mock");

/** POST /api/v1/trips/{tripId}/events */
export async function sendTripEvent(
  tripId: string,
  eventType: TripEvent,
  detailCode?: string,
): Promise<void> {
  if (isMockTrip(tripId)) return;
  await apiData(`/api/v1/trips/${tripId}/events`, {
    method: "POST",
    body: JSON.stringify({ eventType, ...(detailCode ? { detailCode } : {}) }),
  });
}

/** POST /api/v1/trips/{tripId}/check-ins ('괜찮아요' = OK, 도움 필요 = NEED_HELP) */
export async function sendCheckIn(
  tripId: string,
  response: "OK" | "NEED_HELP",
): Promise<void> {
  if (isMockTrip(tripId)) return;
  await apiData(`/api/v1/trips/${tripId}/check-ins`, {
    method: "POST",
    body: JSON.stringify({ response }),
  });
}

// ── 서버 응답
type Point = { name: string; latitude?: number; longitude?: number };
type Leg = {
  sequence: number;
  mode: "WALK" | "BUS" | "SUBWAY";
  start: Point;
  end: Point;
  durationSeconds: number;
  distanceMeters: number;
  steps?: { instruction?: string; distanceMeters?: number }[] | null;
  route?: { routeName?: string } | null;
  stops?: { name: string; latitude?: number; longitude?: number }[] | null;
};
type ServerRoutePlan = {
  summary?: { durationSeconds?: number } | null;
  legs: Leg[];
  stopArrivals?:
    | {
        stopName?: string;
        routeName?: string;
        arrivals?: { estimatedArrivalSeconds?: number; vehicleType?: string }[];
      }[]
    | null;
};
type Started = { tripId: string; estimatedArrivalAt?: string | null };
type Appointment = {
  clinicName?: string | null;
  clinicSize?: string | null;
  department?: string | null;
  appointmentDate?: string | null;
  appointmentAt?: string | null;
  clinicLat?: number | null;
  clinicLon?: number | null;
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const minutes = (sec: number) => Math.max(1, Math.round(sec / 60));
const routeName = (leg: Leg) => {
  const name =
    leg.route?.routeName ?? (leg.mode === "SUBWAY" ? "지하철" : "버스");
  return /^\d+$/.test(name) ? `${name}번` : name;
};

/** 안내 문구에서 방향 읽기 ('왼쪽으로', '우회전' 등) */
function directionOf(text?: string | null): Direction {
  if (!text) return "straight";
  if (/왼쪽|좌회전|좌측/.test(text)) return "left";
  if (/오른쪽|우회전|우측/.test(text)) return "right";
  return "straight";
}

/** 서버 경로 구간 → 이동 단계 (걷기 / 버스 기다리기 → 타는 중 → 내리기) */
function legsToSteps(plan: ServerRoutePlan): GuideStep[] {
  const steps: GuideStep[] = [];
  [...plan.legs]
    .sort((a, b) => a.sequence - b.sequence)
    .forEach((leg, i) => {
      if (leg.mode === "WALK") {
        steps.push({
          id: `walk-${i}`,
          type: "walk",
          title: `${leg.end.name}까지`,
          direction: directionOf(leg.steps?.[0]?.instruction),
          distanceM: leg.steps?.[0]?.distanceMeters ?? leg.distanceMeters,
          instruction: leg.steps?.[0]?.instruction ?? "",
          remainingM: leg.distanceMeters,
          remainingMin: minutes(leg.durationSeconds),
        });
        return;
      }
      const arrival = plan.stopArrivals?.find(
        (a) =>
          a.stopName === leg.start.name &&
          (!a.routeName || a.routeName === leg.route?.routeName),
      )?.arrivals?.[0];
      steps.push(
        {
          id: `wait-${i}`,
          type: "waitBus",
          stopName: leg.start.name,
          busNo: routeName(leg),
          routeName: leg.route?.routeName ?? undefined,
          arrivalMin:
            arrival?.estimatedArrivalSeconds != null
              ? Math.ceil(arrival.estimatedArrivalSeconds / 60)
              : 0,
          lowFloor: arrival?.vehicleType
            ? /LOW|저상/i.test(arrival.vehicleType)
            : true,
        },
        {
          id: `bus-${i}`,
          type: "onBus",
          alightStop: leg.end.name,
          stopsLeft: Math.max((leg.stops?.length ?? 2) - 1, 1),
          stops: (leg.stops ?? [])
            .filter((st) => st.latitude != null && st.longitude != null)
            .map((st) => ({ latitude: st.latitude!, longitude: st.longitude! })),
        },
        { id: `alight-${i}`, type: "alight" },
      );
    });
  return steps;
}

/** 서버 경로 → 안내 단계 (이동 단계 + 도착 / 창구) */
function toSteps(
  plan: ServerRoutePlan,
  appt: Appointment | null,
  userName: string,
): GuideStep[] {
  const steps: GuideStep[] = legsToSteps(plan);

  const at = appt?.appointmentAt ? new Date(appt.appointmentAt) : null;
  const day =
    at ??
    (appt?.appointmentDate
      ? new Date(`${appt.appointmentDate}T00:00:00`)
      : null);
  steps.push(
    { id: "arrived", type: "arrived" },
    {
      id: "counter",
      type: "counterHelp",
      userName,
      hospital: appt?.clinicName ?? "",
      date: day
        ? `${day.getMonth() + 1}월 ${day.getDate()}일(${WEEK[day.getDay()]})`
        : "",
      time: at
        ? `${at.getHours() < 12 ? "오전" : "오후"} ${at.getHours() % 12 || 12} : ${pad(at.getMinutes())}`
        : "",
      department: appt?.department ?? "",
      scale: SIZE_LABEL[appt?.clinicSize ?? ""] ?? "",
    },
  );
  return steps;
}

/** 경로(없으면 일정의 추천 경로)로 이동 시작 → 안내 단계 만들기 */
export async function startTripSession(
  routeId?: string,
  appointmentId?: string,
): Promise<GuideSession> {
  let planId = routeId;
  if (!planId) {
    if (!appointmentId) throw new Error("일정이 없어요");
    const [first] = await searchRoutePlans(appointmentId); // 맨 앞 = 추천 경로
    if (!first) throw new Error("경로가 없어요");
    planId = first.id;
  }

  const [plan, started, appt, me] = await Promise.all([
    apiData<ServerRoutePlan>(
      `/api/v1/route-plans/${planId}?refreshArrivals=true`,
    ),
    apiData<Started>("/api/v1/trips", {
      method: "POST",
      body: JSON.stringify({ routePlanId: planId }),
    }),
    appointmentId
      ? apiRequest<Appointment>(`/api/v1/appointments/${appointmentId}`)
      : Promise.resolve(null),
    apiRequest<{ name?: string }>("/api/v1/elder-profiles/me").catch(
      () => null,
    ),
  ]);

  const durationMs = (plan.summary?.durationSeconds ?? 0) * 1000;
  return {
    id: started.tripId,

    destination:
      appt?.clinicName ?? plan.legs[plan.legs.length - 1]?.end.name ?? "병원",
    expectedArrivalAt:
      started.estimatedArrivalAt ??
      new Date(Date.now() + durationMs).toISOString(),
    steps: toSteps(plan, appt, me?.name ?? ""),
    routePlanId: planId,
    destinationPoint: {
      name: appt?.clinicName ?? "병원",
      ...(appt?.clinicLat != null && appt?.clinicLon != null
        ? { latitude: appt.clinicLat, longitude: appt.clinicLon }
        : {}),
    },
  };
}

/** POST /api/v1/trips/{tripId}/location */
export async function sendTripLocation(
  tripId: string,
  coords: { latitude: number; longitude: number; accuracy?: number | null },
): Promise<void> {
  if (isMockTrip(tripId)) return;
  await apiData(`/api/v1/trips/${tripId}/location`, {
    method: "POST",
    body: JSON.stringify({
      latitude: coords.latitude,
      longitude: coords.longitude,
      ...(coords.accuracy != null
        ? { accuracyMeters: Math.min(Math.round(coords.accuracy), 1000) }
        : {}),
      recordedAt: new Date().toISOString(),
    }),
  });
}

/** '버스를 하나 보냈어요': 실시간 도착 정보에서 다음 저상 버스 찾기 (없으면 null) */
export async function findNextLowFloorBus(
  routePlanId: string,
  step: WaitBusStep,
): Promise<WaitBusStep | null> {
  const plan = await apiData<ServerRoutePlan>(
    `/api/v1/route-plans/${routePlanId}?refreshArrivals=true`,
  );
  const arrivals =
    plan.stopArrivals?.find(
      (a) =>
        a.stopName === step.stopName &&
        (!a.routeName || !step.routeName || a.routeName === step.routeName),
    )?.arrivals ?? [];
  // 방금 보낸 버스(1분 안)는 빼고, 저상 버스(정보 없으면 저상으로 봄) 중 가장 빨리 오는 것
  const next = arrivals.find(
    (a) =>
      (a.estimatedArrivalSeconds ?? 0) > 60 &&
      (!a.vehicleType || /LOW|저상/i.test(a.vehicleType)),
  );
  if (!next?.estimatedArrivalSeconds) return null;
  return {
    ...step,
    arrivalMin: Math.ceil(next.estimatedArrivalSeconds / 60),
    lowFloor: true,
  };
}

/** '지금 계신 곳에서 다시 안내': 현재 위치 → 병원 경로 다시 찾기 */
export async function searchFromHere(session: GuideSession): Promise<{
  steps: GuideStep[];
  durationSeconds: number;
  distanceMeters: number;
}> {
  if (!session.destinationPoint) throw new Error("병원 위치가 없어요");
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("위치 권한이 없어요");
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const res = await apiData<{
    alternatives: (ServerRoutePlan & {
      summary?: { distanceMeters?: number } | null;
    })[];
  }>("/api/v1/route-plans/search", {
    method: "POST",
    body: JSON.stringify({
      origin: {
        name: "현재 위치",
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      destination: session.destinationPoint,
      mode: "TRANSIT",
      count: 1,
    }),
  });
  const plan = res.alternatives?.[0];
  if (!plan) throw new Error("경로가 없어요");
  return {
    steps: legsToSteps(plan).map((s) => ({ ...s, id: `re-${s.id}` })),
    durationSeconds: plan.summary?.durationSeconds ?? 0,
    distanceMeters: plan.summary?.distanceMeters ?? 0,
  };
}

type LatLng = { latitude: number; longitude: number };

/** 두 지점 사이 거리 (km) */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** 지금 위치에서 병원까지 거리 (km, 모르면 null) */
export async function distanceToDestinationKm(session: GuideSession): Promise<number | null> {
  const dest = session.destinationPoint;
  if (dest?.latitude == null || dest?.longitude == null) return null;
  const pos =
    (await Location.getLastKnownPositionAsync()) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  if (!pos) return null;
  return distanceKm(pos.coords, { latitude: dest.latitude, longitude: dest.longitude });
}

/** 버스 타는 중: 내 위치에서 가장 가까운 정류장으로 남은 정거장 계산. 위치를 못 쓰면 onFail */
export function watchStopsLeft(
  step: OnBusStep,
  onUpdate: (updated: OnBusStep) => void,
  onFail: () => void,
): () => void {
  const stops = step.stops ?? [];
  let sub: Location.LocationSubscription | null = null;
  let stopped = false;
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") throw new Error("위치 권한 없음");
    if (stopped) return;
    sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 10_000, distanceInterval: 30 },
      (pos) => {
        let nearest = 0;
        stops.forEach((st, i) => {
          if (distanceKm(pos.coords, st) < distanceKm(pos.coords, stops[nearest])) nearest = i;
        });
        onUpdate({ ...step, stopsLeft: Math.max(stops.length - 1 - nearest, 0) });
      },
    );
    if (stopped) sub.remove();
  })().catch(() => {
    if (!stopped) onFail();
  });
  return () => {
    stopped = true;
    sub?.remove();
  };
}
