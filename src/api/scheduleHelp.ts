// src/api/scheduleHelp.ts
// 어르신이 병원 일정 입력 중 '보호자에게 연락하기'를 누르면 → 보호자가 대신 채워 주는 요청
import type { ElderStatus } from './guardianHome';
import { markTodoDone } from './guardianHome';

export type ScheduleHelpRequest = {
  id: string;
  elderName: string;
  status: ElderStatus;
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 도움을 요청했어요'
  sub: string; // 초록 카드 작은 글씨, 예: '병원 문자에서 시간을 못 읽었어요'
  infoTitle: string; // 흰 카드 제목, 예: '어머니가 읽은 정보'
  rows: { label: string; value: string }[]; // 어르신 쪽에서 이미 읽은 정보, 예: 병원 / 날짜
  fieldLabel: string; // 보호자가 채울 항목, 예: '시간'
  fieldValue: string; // 채워 둔 값(있으면), 예: '오전 10:00'
};

// TODO: POST /schedule-help-requests 연동 (어르신 앱 '보호자에게 연락하기'에서 호출 → 서버가 보호자에게 푸시)
export async function requestScheduleHelp(draft: { hospital?: string; date?: string; missing: string }): Promise<{ id: string }> {
  await new Promise(r => setTimeout(r, 300));
  return { id: 'mock-help' };
}

// TODO: GET /schedule-help-requests/:id 연동 (보호자 앱)
export async function getScheduleHelpRequest(id: string): Promise<ScheduleHelpRequest> {
  await new Promise(r => setTimeout(r, 300));
  return {
    id,
    elderName: '어머니',
    status: 'beforeDeparture',
    title: '어머니가 도움을 요청했어요',
    sub: '병원 문자에서 시간을 못 읽었어요',
    infoTitle: '어머니가 읽은 정보',
    rows: [
      { label: '병원', value: 'OO병원' },
      { label: '날짜', value: '11월 4일 (화)' },
    ],
    fieldLabel: '시간',
    fieldValue: '오전 10:00',
  };
}

// TODO: POST /schedule-help-requests/:id/answer 연동 (보호자가 채운 값 → 어르신 일정에 반영)
export async function submitScheduleHelp(id: string, value: string): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
  markTodoDone(id); // 목업: 홈 '확인이 필요해요'에서 빼기
}