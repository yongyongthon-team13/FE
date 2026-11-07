// src/api/guardianNoResponse.ts
// 보호자: 어르신이 응답하지 않을 때 보는 화면 데이터
export type GuardianNoResponse = {
  elderName: string;
  elderPhone: string;
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 응답하지 않아요'
  sub: string; // 초록 카드 작은 글씨, 예: '도착 시간이 지났고\n병원에서 1.2KM 떨어져 있어요'
  timeline: { time: string; label: string }[]; // 예: 10:15 도착 시간 지남
};

// TODO: GET /guardian/no-response 연동 (어르신 앱에서 무응답 신고가 오면 보호자에게 푸시)
export async function getGuardianNoResponse(): Promise<GuardianNoResponse> {
  await new Promise(r => setTimeout(r, 300));
  return {
    elderName: '어머니',
    elderPhone: '01012345678',
    title: '어머니가 응답하지 않아요',
    sub: '도착 시간이 지났고\n병원에서 1.2KM 떨어져 있어요',
    timeline: [
      { time: '10:15', label: '도착 시간 지남' },
      { time: '10:15', label: '반경 밖 · 연락 시작' },
      { time: '10:20', label: '어머니 응답 없음' },
    ],
  };
}