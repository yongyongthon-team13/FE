// src/api/rideHelp.ts
// 날씨 특보 때 어르신이 '보호자에게 부탁하기' → 보호자가 '모시러 갈게요 / 택시 불러드릴게요'로 답함
// POST /api/v1/appointments/{appointmentId}/transport-requests  { type: 'GUARDIAN_ASSISTANCE' }
import { apiData } from "@/lib/api";

import {
  dateOf,
  getElderContact,
  josa,
  md,
  requireElderId,
  type ServerAppointment,
} from "./guardianData";
import type { ElderStatus } from "./guardianHome";
import { getTodayWeather } from "./weather";

export type RideChoice = "pickup" | "taxi"; // 제가 모시러 갈게요 / 택시를 불러드릴게요

export type RideRequest = {
  appointmentId: string;
  requestId: string;
  elderName: string;
  elderPhone: string;
  status: ElderStatus;
  notice: string; // 초록 카드 윗줄, 예: '한파 주의 · 영하 13도'
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 차량을 부탁했어요'
};

type TransportRequest = {
  requestId: string;
  type:
    | "TAXI"
    | "CAREGIVER_PICKUP"
    | "ACCESSIBLE_TRANSPORT"
    | "GUARDIAN_ASSISTANCE";
  status?: string | null; // PENDING → ACCEPTED
  guardianResponse?: "PICKUP_BY_GUARDIAN" | "CALL_TAXI" | null;
};

const base = (appointmentId: string) =>
  `/api/v1/appointments/${appointmentId}/transport-requests`;

/** 어르신 앱: 보호자에게 차 부탁 (서버가 보호자에게 알림) */
export async function requestRide(
  appointmentId: string,
): Promise<{ requestId: string }> {
  const r = await apiData<TransportRequest>(base(appointmentId), {
    method: "POST",
    // 같은 날 여러 번 눌러도 요청은 하나만
    headers: {
      "Idempotency-Key": `ride-${appointmentId}-${new Date().toDateString()}`,
    },
    body: JSON.stringify({ type: "GUARDIAN_ASSISTANCE" }),
  });
  return { requestId: r.requestId };
}

/** 보호자 앱: 가까운 일정들에서 아직 답하지 않은 차 부탁 찾기 */
export async function findPendingRides(
  appointments: ServerAppointment[],
): Promise<{ appointment: ServerAppointment; requestId: string }[]> {
  const found = await Promise.all(
    appointments.map(async (a) => {
      const list = await apiData<TransportRequest[]>(
        base(a.appointmentId),
      ).catch(() => []);
      return (list ?? [])
        .filter(
          (r) => r.type === "GUARDIAN_ASSISTANCE" && r.status === "PENDING",
        )
        .map((r) => ({ appointment: a, requestId: r.requestId }));
    }),
  );
  return found.flat();
}

/** '확인이 필요해요' 한 줄 (id = '일정id:요청id') */
export function toRideTodo(
  elderName: string,
  ride: { appointment: ServerAppointment; requestId: string },
) {
  const d = dateOf(ride.appointment);
  return {
    id: `${ride.appointment.appointmentId}:${ride.requestId}`,
    kind: "ride" as const,
    title: `${josa(elderName, "이", "가")} 차량을 부탁했어요`,
    sub:
      [d && md(d), ride.appointment.clinicName].filter(Boolean).join(" ") ||
      "오늘 병원 가는 길",
    actionLabel: "답하기",
  };
}

/** 보호자 앱: 차 부탁 화면 */
export async function getRideRequest(
  appointmentId: string,
  requestId: string,
): Promise<RideRequest> {
  const elderId = await requireElderId();
  const [elder, weather] = await Promise.all([
    getElderContact(elderId),
    getTodayWeather().catch(() => null),
    apiData<TransportRequest>(`${base(appointmentId)}/${requestId}`), // 요청이 있는지 확인
  ]);
  return {
    appointmentId,
    requestId,
    elderName: elder.name,
    elderPhone: elder.phone,
    status: "beforeDeparture",
    notice: weather?.alert
      ? [weather.alertLabel, weather.brief].filter(Boolean).join(" · ")
      : "오늘 병원 가는 날",
    title: `${josa(elder.name, "이", "가")} 차량을 부탁했어요`,
  };
}

/** 보호자 앱: 답하기 (첫 답만 적용) */
export async function answerRideRequest(
  appointmentId: string,
  requestId: string,
  choice: RideChoice,
): Promise<void> {
  await apiData(`${base(appointmentId)}/${requestId}/response`, {
    method: "POST",
    body: JSON.stringify({
      response: choice === "pickup" ? "PICKUP_BY_GUARDIAN" : "CALL_TAXI",
    }),
  });
}

export type RideAnswer = "PICKUP_BY_GUARDIAN" | "CALL_TAXI";

/** 어르신 앱: 보호자 답 확인 (아직 답이 없으면 null) */
export async function getRideAnswer(
  appointmentId: string,
  requestId: string,
): Promise<RideAnswer | null> {
  const r = await apiData<TransportRequest>(
    `${base(appointmentId)}/${requestId}`,
  );
  return r.guardianResponse ?? null;
}
