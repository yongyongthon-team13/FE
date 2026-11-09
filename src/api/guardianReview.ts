// src/api/guardianReview.ts
// 보호자: 지난 진료 후기
import { markTodoDone } from './guardianHome';

export type ReviewQuestion = {
  id: string; // 예: 'move', 'onTime'
  label: string; // 예: '어떻게 다녀오셨나요?'
  options: { value: string; label: string }[]; // 예: 버스 / 동행서비스
};

export type ReviewForm = {
  id: string;
  title: string; // 예: '이번 진료 어떠셨나요?'
  questions: ReviewQuestion[];
};

// TODO: GET /guardian/reviews/:id 연동
export async function getReviewForm(id: string): Promise<ReviewForm> {
  await new Promise(r => setTimeout(r, 300));
  return {
    id,
    title: '이번 진료 어떠셨나요?',
    questions: [
      {
        id: 'move',
        label: '어떻게 다녀오셨나요?',
        options: [
          { value: 'bus', label: '버스' },
          { value: 'companion', label: '동행서비스' },
        ],
      },
      {
        id: 'onTime',
        label: '제때 도착했나요?',
        options: [
          { value: 'yes', label: '네' },
          { value: 'late', label: '늦었어요' },
        ],
      },
      {
        // AI가 어르신 맞춤(보행기·걷기 불편 등)으로 추천한 경로 평가
        id: 'route',
        label: '추천해 드린 길은 어떠셨나요?',
        options: [
          { value: 'good', label: '편했어요' },
          { value: 'bad', label: '힘들었어요' },
        ],
      },
    ],
  };
}

// TODO: POST /guardian/reviews/:id 연동 (answers: { 질문id: 고른 value })
export async function submitReview(id: string, answers: Record<string, string>): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
  markTodoDone(id); // 목업: 홈 '확인이 필요해요'에서 빼기
}