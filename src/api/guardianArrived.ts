// src/api/guardianArrived.ts
// 보호자: 어르신이 병원에 도착했을 때 보는 화면 데이터
import {
  dateOf,
  getActiveTrip,
  getElderAppointments,
  getElderContact,
  hm,
  requireElderId,
  upcomingOf,
} from "./guardianData";
import type { ElderStatus } from "./guardianHome";

export type GuardianArrived = {
  elderName: string;
  status: ElderStatus; // 'atHospital'
  rows: { label: string; value: string }[]; // 예: 도착 시각 / 진료
};

/** active-trip + 오늘 일정 → 도착 화면 */
export async function getGuardianArrived(): Promise<GuardianArrived> {
  const elderId = await requireElderId();
  const [elder, trip, list] = await Promise.all([
    getElderContact(elderId),
    getActiveTrip(elderId),
    getElderAppointments(elderId),
  ]);
  const todayKey = new Date().toDateString();
  const visit = upcomingOf(list).find(
    (a) => dateOf(a)?.toDateString() === todayKey,
  );
  const visitAt = visit?.appointmentAt ? new Date(visit.appointmentAt) : null;
  const arrivedAt = trip?.endedAt ?? trip?.lastLocationAt ?? null;

  return {
    elderName: elder.name,
    status: "atHospital",
    rows: [
      { label: "도착 시각", value: arrivedAt ? hm(new Date(arrivedAt)) : "-" },
      {
        label: "진료",
        value: visit
          ? [visitAt && hm(visitAt), visit.department]
              .filter(Boolean)
              .join(" ") || "-"
          : "-",
      },
    ],
  };
}
