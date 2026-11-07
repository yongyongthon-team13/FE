// src/api/rideHelp.ts
// 어르신이 '보호자에게 차 부탁하기'를 누르면 → 보호자가 어떻게 도울지 고르는 요청
import type { ElderStatus } from './guardianHome';

export type RideChoice = 'pickup' | 'taxi'; // 제가 모시러 갈게요 / 택시를 불러드릴게요

export type RideRequest = {
  id: string;
  elderName: string;
  elderPhone: string;
  status: ElderStatus;
  notice: string; // 초록 카드 윗줄, 예: '한파 주의보 · 영하 13도'
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 차량을 부탁했어요'
};

// TODO: POST /ride-requests 연동 (어르신 앱 '보호자에게 차 부탁하기'에서 호출 → 서버가 보호자에게 푸시)
export async function requestRide(): Promise<{ id: string }> {
  await new Promise(r => setTimeout(r, 300));
  return { id: 'mock-ride' };
}

// TODO: GET /ride-requests/:id 연동 (보호자 앱)
export async function getRideRequest(id: string): Promise<RideRequest> {
  await new Promise(r => setTimeout(r, 300));
  return {
    id,
    elderName: '어머니',
    elderPhone: '01012345678',
    status: 'beforeDeparture',
    notice: '한파 주의보 · 영하 13도',
    title: '어머니가 차량을 부탁했어요',
  };
}

// TODO: POST /ride-requests/:id/answer 연동 (보호자 선택 → 어르신 앱에 알림)
export async function answerRideRequest(id: string, choice: RideChoice): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
}