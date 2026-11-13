// src/api/guardianReview.ts
// 보호자: 지난 진료 후기
import { apiRequest } from "@/lib/api";

export type ReviewQuestion = {
  id: string; // 예: 'move', 'onTime'
  label: string; // 예: '어떻게 다녀오셨나요?'
  options: { value: string; label: string }[]; // 예: 버스 / 동행서비스
};

export type ReviewForm = {
  id: string; // 일정 id (appointmentId)
  title: string; // 예: '이번 진료 어떠셨나요?'
  questions: ReviewQuestion[];
};

/** 질문은 앱에 고정 (id = 홈 '확인이 필요해요'에서 받은 appointmentId) */
export async function getReviewForm(id: string): Promise<ReviewForm> {
  return {
    id,
    title: "이번 진료 어떠셨나요?",
    questions: [
      {
        id: "move",
        label: "어떻게 다녀오셨나요?",
        options: [
          { value: "bus", label: "버스" },
          { value: "companion", label: "동행서비스" },
        ],
      },
      {
        id: "onTime",
        label: "제때 도착했나요?",
        options: [
          { value: "yes", label: "네" },
          { value: "late", label: "늦었어요" },
        ],
      },
      {
        // AI 추천 경로 평가 (서버에 칸이 생기면 같이 보내기 — 백엔드 요청 중)
        id: "route",
        label: "추천해 드린 길은 어떠셨나요?",
        options: [
          { value: "good", label: "편했어요" },
          { value: "bad", label: "힘들었어요" },
        ],
      },
    ],
  };
}

const TRANSPORT: Record<string, "BUS" | "COMPANION" | "TAXI" | "GUARDIAN"> = {
  bus: "BUS",
  companion: "COMPANION",
};

/** POST /api/v1/appointments/{appointmentId}/visit-reviews */
export async function submitReview(
  id: string,
  answers: Record<string, string>,
): Promise<void> {
  await apiRequest(`/api/v1/appointments/${id}/visit-reviews`, {
    method: "POST",
    body: JSON.stringify({
      transport: TRANSPORT[answers.move] ?? "BUS",
      onTime: answers.onTime === "yes",
      ...(answers.route
        ? { routeRating: answers.route === "good" ? "GOOD" : "BAD" }
        : {}),
    }),
  });
}
