// src/api/guardianData.ts
// 보호자 앱 공통: 연결된 어르신 · 일정 · 할 일 (서버 값 → 화면 글자)
import { apiData, ApiError, apiRequest } from "@/lib/api";
import type { ElderStatus } from "./guardianHome";
import { ensureGuardianElderId, getLinkedElders } from "./link";

export type ServerAppointment = {
  clinicLat?: number | null;
  clinicLon?: number | null;
  appointmentId: string;
  clinicName?: string | null;
  department?: string | null;
  appointmentDate?: string | null; // '2026-11-04'
  appointmentAt?: string | null; // ISO
  status?: "DRAFT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  helpRequested?: boolean;
  companion?: {
    status?: string | null;
    pickupAt?: string | null;
    pickupPlace?: string | null;
    managerName?: string | null;
  } | null;
};

export type PendingTasks = {
  helpRequests: ServerAppointment[]; // 어르신이 도움 요청한 일정
  visitReviews: ServerAppointment[]; // 후기 남길 지난 진료
};

/** 저장된 어르신 id (없으면 오류) */
export async function requireElderId(): Promise<string> {
  const elderId = await ensureGuardianElderId();
  if (!elderId) throw new ApiError(400, "NO_ELDER", "연결된 어르신이 없어요");
  return elderId;
}

/** 보호자가 부르는 이름(관계 → 없으면 이름) + 전화번호(숫자만) */
export async function getElderContact(
  elderId: string,
): Promise<{ name: string; phone: string }> {
  const elders = await getLinkedElders();
  const elder = elders.find((e) => e.elderId === elderId);
  return {
    name: elder?.relationship || elder?.name || "어르신",
    phone: (elder?.phoneNumber ?? "").replace(/\D/g, ""),
  };
}

/** 이름만 필요할 때 */
export async function getElderName(elderId: string): Promise<string> {
  return (await getElderContact(elderId)).name;
}

/** GET /api/v1/guardian/elder-profiles/{elderId}/appointments */
export function getElderAppointments(
  elderId: string,
): Promise<ServerAppointment[]> {
  return apiRequest<ServerAppointment[]>(
    `/api/v1/guardian/elder-profiles/${elderId}/appointments`,
  );
}

/** GET /api/v1/guardian/elder-profiles/{elderId}/pending-tasks */
export function getPendingTasks(elderId: string): Promise<PendingTasks> {
  return apiRequest<PendingTasks>(
    `/api/v1/guardian/elder-profiles/${elderId}/pending-tasks`,
  );
}

// ── 화면 글자 만들기
export const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

/** 일정 날짜 (시간 있으면 시간까지) */
export function dateOf(a: ServerAppointment): Date | null {
  if (a.appointmentAt) return new Date(a.appointmentAt);
  if (a.appointmentDate) return new Date(`${a.appointmentDate}T00:00:00`);
  return null;
}

/** '8:30' */
export const hm = (d: Date) => `${d.getHours()}:${pad(d.getMinutes())}`;

/** '오전 10:00' */
export const ampm = (d: Date) => {
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${pad(d.getMinutes())}`;
};

/** '11/4' */
export const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

/** 비어 있는 항목 이름 (예: ['시간', '진료과']) */
export function missingFields(a: ServerAppointment): string[] {
  const out: string[] = [];
  if (!a.clinicName) out.push("병원");
  if (!a.appointmentDate && !a.appointmentAt) out.push("날짜");
  if (!a.appointmentAt) out.push("시간");
  if (!a.department) out.push("진료과");
  return out;
}

/** 'OO병원 내과' */
export const clinicText = (a: ServerAppointment) =>
  [a.clinicName || "병원 미정", a.department].filter(Boolean).join(" ");

/** 이동 방법 글자 (예: '동행서비스 · 8:30 픽업') */
export function moveText(a: ServerAppointment): string {
  const c = a.companion;
  if (!c) return "";
  if (c.pickupAt) return `동행서비스 · ${hm(new Date(c.pickupAt))} 픽업`;
  return "동행서비스 신청 중";
}

/** 오늘 이후, 취소·완료 아닌 일정 (가까운 순) */
export function upcomingOf(list: ServerAppointment[]): ServerAppointment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return list
    .filter((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED")
    .filter((a) => {
      const d = dateOf(a);
      return !d || d >= today;
    })
    .sort(
      (x, y) =>
        (dateOf(x)?.getTime() ?? Infinity) - (dateOf(y)?.getTime() ?? Infinity),
    );
}

/** 받침 따라 조사 붙이기: josa('시간', '을', '를') → '시간을' */
export function josa(
  word: string,
  withBatchim: string,
  without: string,
): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (has ? withBatchim : without);
}
// ── 이동 중 (진료 당일)
export type ActiveTrip = {
  tripId: string;
  status: "ACTIVE" | "HELP_REQUESTED" | "ARRIVED" | "CLOSED";
  plannedArrivalAt?: string | null;
  estimatedArrivalAt?: string | null;
  startedAt?: string | null;
  lastLocationAt?: string | null;
  lastLatitude?: number | null; // 2분 넘게 위치가 안 오면 null
  lastLongitude?: number | null;
  lastEventType?:
    | "DEPARTED"
    | "BOARDED"
    | "ALIGHTED"
    | "ARRIVED"
    | "HELP_REQUESTED"
    | "CANCELLED"
    | "ABORTED"
    | "CHECK_IN_RESPONDED"
    | null;
  endedAt?: string | null;
};

/** GET /api/v1/guardian/elder-profiles/{elderId}/active-trip (이동 중이 아니거나 실패하면 null) */
export async function getActiveTrip(
  elderId: string,
): Promise<ActiveTrip | null> {
  try {
    return (
      (await apiData<ActiveTrip | null>(
        `/api/v1/guardian/elder-profiles/${elderId}/active-trip`,
      )) ?? null
    );
  } catch {
    return null;
  }
}

/** 이동 상태 → 상단 상태 표시 */
export function toElderStatus(trip: ActiveTrip | null): ElderStatus {
  if (!trip) return "beforeDeparture";
  if (trip.status === "HELP_REQUESTED") return "noResponse";
  if (trip.status === "ARRIVED") return "atHospital";
  if (trip.status === "CLOSED")
    return trip.lastEventType === "ARRIVED" ? "atHospital" : "beforeDeparture";
  return "onTheWay";
}

/** 지금 어디쯤인지 (최근 이벤트 기준) */
export function nowLabel(trip: ActiveTrip): string {
  switch (trip.lastEventType) {
    case "BOARDED":
      return "버스 안";
    case "ALIGHTED":
      return "버스에서 내림 · 병원으로 걷는 중";
    case "ARRIVED":
      return "병원 도착";
    case "HELP_REQUESTED":
      return "도움을 요청했어요";
    default:
      return "집에서 출발 · 정류장으로 가는 중";
  }
}

/** 도착 예상 시각 (없으면 계획 시각) */
export const etaOf = (trip: ActiveTrip) =>
  trip.estimatedArrivalAt ?? trip.plannedArrivalAt ?? null;

/** 보호자가 이동 중에 연락한 기록: POST .../trips/{tripId}/contact-actions */
export async function recordGuardianContact(
  tripId: string,
  actionType: "CALL" | "MESSAGE" | "EMERGENCY_CALL",
): Promise<void> {
  const elderId = await requireElderId();
  await apiData(
    `/api/v1/guardian/elder-profiles/${elderId}/trips/${tripId}/contact-actions`,
    {
      method: "POST",
      body: JSON.stringify({ actionType }),
    },
  );
}

/** 어르신 마지막 위치 (없으면 null) */
export const elderPointOf = (trip: ActiveTrip | null) =>
  trip?.lastLatitude != null && trip?.lastLongitude != null
    ? { latitude: trip.lastLatitude, longitude: trip.lastLongitude }
    : null;

/** 오늘 가는 병원 위치 (좌표 없으면 null) */
export function todayHospitalOf(list: ServerAppointment[]) {
  const key = new Date().toDateString();
  const a = upcomingOf(list).find((x) => dateOf(x)?.toDateString() === key);
  return a?.clinicLat != null && a?.clinicLon != null
    ? {
        latitude: a.clinicLat,
        longitude: a.clinicLon,
        name: a.clinicName ?? "병원",
      }
    : null;
}
