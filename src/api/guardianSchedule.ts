// src/api/guardianSchedule.ts
// 보호자: 어르신 진료 일정 목록
import type { ElderStatus } from './guardianHome';

export type ScheduleVisit = {
  id: string;
  title: string; // 예: '11/4 (화) 10:00 · OO병원 내과'
  move: string; // 이동 방법, 예: '동행서비스 · 8:30 픽업'
  state: string; // 상태, 예: '신청 완료', '8:45 출발 예정'
};

export type GuardianSchedule = {
  elderName: string;
  elderPhone: string;
  status: ElderStatus;
  visits: ScheduleVisit[]; // 가까운 일정부터 (첫 번째는 초록 카드로 강조)
};

// TODO: GET /guardian/schedules 연동
export async function getGuardianSchedule(): Promise<GuardianSchedule> {
  await new Promise(r => setTimeout(r, 300));
  return {
    elderName: '어머니',
    elderPhone: '01012345678',
    status: 'onTheWay',
    visits: [
      { id: 'v1', title: '11/4 (화) 10:00 · OO병원 내과', move: '동행서비스 · 8:30 픽업', state: '신청 완료' },
      { id: 'v2', title: '11/18(화) 14:00 · XX의원', move: '10번 저상버스 예정', state: '8:45 출발 예정' },
    ],
  };
}