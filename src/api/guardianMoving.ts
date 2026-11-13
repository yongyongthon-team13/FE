// src/api/guardianMoving.ts
// 보호자: 어르신이 이동 중일 때 보는 화면 데이터
import {
  elderPointOf,
  etaOf,
  getActiveTrip,
  getElderAppointments,
  getElderContact,
  hm,
  nowLabel,
  requireElderId,
  todayHospitalOf,
} from "./guardianData";

export type GuardianMoving = {
  elderName: string;
  elderPhone: string;
  tripId: string | null; // 이동 기록 id (보호자 연락 기록용)
  elderLocation: { latitude: number; longitude: number } | null; // 어르신 마지막 위치
  hospitalLocation: {
    latitude: number;
    longitude: number;
    name: string;
  } | null; // 오늘 가는 병원
  departedAt: string; // 출발 시각, 예: '8:52'
  rows: { label: string; value: string }[]; // 예: 지금 / 위치 확인 / 병원 도착 예상
};

/** GET active-trip → 이동 중 화면 */
export async function getGuardianMoving(): Promise<GuardianMoving> {
  const elderId = await requireElderId();
  const [elder, trip, list] = await Promise.all([
    getElderContact(elderId),
    getActiveTrip(elderId),
    getElderAppointments(elderId),
  ]);
  const eta = trip ? etaOf(trip) : null;
  return {
    elderName: elder.name,
    elderPhone: elder.phone,
    departedAt: trip?.startedAt ? hm(new Date(trip.startedAt)) : "-",
    rows: [
      { label: "지금", value: trip ? nowLabel(trip) : "이동 중이 아니에요" },
      {
        label: "마지막 위치 확인",
        value: trip?.lastLocationAt ? hm(new Date(trip.lastLocationAt)) : "-",
      },
      { label: "병원 도착 예상", value: eta ? hm(new Date(eta)) : "-" },
    ],
    tripId: trip?.tripId ?? null,
    elderLocation: elderPointOf(trip),
    hospitalLocation: todayHospitalOf(list),
  };
}
