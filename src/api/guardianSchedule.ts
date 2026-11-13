// src/api/guardianSchedule.ts
// 보호자: 어르신 진료 일정 목록
import {
  clinicText,
  dateOf,
  getElderAppointments,
  getElderContact,
  hm,
  md,
  missingFields,
  moveText,
  requireElderId,
  upcomingOf,
  WEEK,
  type ServerAppointment,
} from "./guardianData";
import type { ElderStatus } from "./guardianHome";

export type ScheduleVisit = {
  id: string;
  title: string; // 예: '11/4 (화) 10:00 · OO병원 내과'
  move: string; // 이동 방법, 예: '동행서비스 · 8:30 픽업'
  state: string; // 상태, 예: '신청 완료', '정보 부족'
};

export type GuardianSchedule = {
  elderName: string;
  elderPhone: string;
  status: ElderStatus;
  visits: ScheduleVisit[]; // 가까운 일정부터 (첫 번째는 초록 카드로 강조)
};

function toVisit(a: ServerAppointment): ScheduleVisit {
  const d = dateOf(a);
  const when = d
    ? `${md(d)} (${WEEK[d.getDay()]})${a.appointmentAt ? ` ${hm(d)}` : ""}`
    : "날짜 미정";
  return {
    id: a.appointmentId,
    title: `${when} · ${clinicText(a)}`,
    move: moveText(a) || "이동 방법 미정",
    state:
      missingFields(a).length > 0
        ? "정보 부족"
        : a.companion
          ? "신청 완료"
          : "예정",
  };
}

/** GET /api/v1/guardian/elder-profiles/{elderId}/appointments */
export async function getGuardianSchedule(): Promise<GuardianSchedule> {
  const elderId = await requireElderId();
  const [elder, list] = await Promise.all([
    getElderContact(elderId),
    getElderAppointments(elderId),
  ]);
  return {
    elderName: elder.name,
    elderPhone: elder.phone,
    status: "beforeDeparture", // TODO: 10-3단계 active-trip으로 교체
    visits: upcomingOf(list).map(toVisit),
  };
}
