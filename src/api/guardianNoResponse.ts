// src/api/guardianNoResponse.ts
// 보호자: 어르신이 도움을 요청했거나 응답하지 않을 때 보는 화면 데이터 (active-trip 기준)
import {
  elderPointOf,
  getActiveTrip,
  getElderAppointments,
  getElderContact,
  hm,
  josa,
  requireElderId,
  todayHospitalOf,
} from "./guardianData";
import { distanceKm } from "./trips";

export type GuardianNoResponse = {
  elderName: string;
  elderPhone: string;
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 응답하지 않아요'
  sub: string; // 초록 카드 작은 글씨, 예: '도착 시간이 지났고\n병원에서 1.2KM 떨어져 있어요'
  timeline: { time: string; label: string }[]; // 예: 10:15 도착 시간 지남
  elderLocation: { latitude: number; longitude: number } | null;
  hospitalLocation: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
};

export async function getGuardianNoResponse(): Promise<GuardianNoResponse> {
  const elderId = await requireElderId();
  const [elder, trip, list] = await Promise.all([
    getElderContact(elderId),
    getActiveTrip(elderId),
    getElderAppointments(elderId),
  ]);
  const elderLocation = elderPointOf(trip);
  const hospitalLocation = todayHospitalOf(list);
  const km =
    elderLocation && hospitalLocation
      ? distanceKm(elderLocation, hospitalLocation)
      : null;
  const helped =
    trip?.status === "HELP_REQUESTED" ||
    trip?.lastEventType === "HELP_REQUESTED";
  const due = trip?.plannedArrivalAt ?? trip?.estimatedArrivalAt ?? null;
  const late = due ? new Date(due).getTime() < Date.now() : false;

  const timeline: { time: string; label: string }[] = [];
  if (due)
    timeline.push({
      time: hm(new Date(due)),
      label: late ? "도착 시간 지남" : "도착 예정",
    });
  if (trip?.lastLocationAt) {
    timeline.push({
      time: hm(new Date(trip.lastLocationAt)),
      label:
        km != null
          ? `마지막 위치 · 병원에서 ${km.toFixed(1)}KM`
          : "마지막 위치 확인",
    });
  }
  if (helped)
    timeline.push({
      time: hm(new Date()),
      label: `${josa(elder.name, "이", "가")} 도움 요청`,
    });

  return {
    elderName: elder.name,
    elderPhone: elder.phone,
    title: helped
      ? `${josa(elder.name, "이", "가")} 도움을 요청했어요`
      : `${josa(elder.name, "이", "가")} 응답하지 않아요`,
    sub: [
      late ? "도착 시간이 지났어요" : null,
      km != null ? `병원에서 ${km.toFixed(1)}KM 떨어져 있어요` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    timeline,
    elderLocation,
    hospitalLocation,
  };
}
