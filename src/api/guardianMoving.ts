// src/api/guardianMoving.ts
// 보호자: 어르신이 이동 중일 때 보는 화면 데이터
export type GuardianMoving = {
  elderName: string;
  elderPhone: string;
  departedAt: string; // 출발 시각, 예: '8:52'
  rows: { label: string; value: string }[]; // 예: 지금 / 남은 정거장 / 병원 도착 예상
};

// TODO: GET /guardian/moving 연동 (이동 중에는 주기적으로 다시 불러오거나 실시간 구독)
export async function getGuardianMoving(): Promise<GuardianMoving> {
  await new Promise(r => setTimeout(r, 300));
  return {
    elderName: '어머니',
    elderPhone: '01012345678',
    departedAt: '8:52',
    rows: [
      { label: '지금', value: '10번 저상버스 안' },
      { label: '남은 정거장', value: '3개' },
      { label: '병원 도착 예상', value: '9:28' },
    ],
  };
}