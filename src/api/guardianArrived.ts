// src/api/guardianArrived.ts
// 보호자: 어르신이 병원에 도착했을 때 보는 화면 데이터
import type { ElderStatus } from './guardianHome';

export type GuardianArrived = {
  elderName: string;
  status: ElderStatus; // 'atHospital'
  rows: { label: string; value: string }[]; // 예: 접수 방법 / 진료
};

// TODO: GET /guardian/arrived 연동 (어르신 앱에서 도착 알림이 오면 보호자에게 푸시)
export async function getGuardianArrived(): Promise<GuardianArrived> {
  await new Promise(r => setTimeout(r, 300));
  return {
    elderName: '어머니',
    status: 'atHospital',
    rows: [
      { label: '접수 방법', value: '키오스크 사용 중' },
      { label: '진료', value: '10:00 내과' },
    ],
  };
}