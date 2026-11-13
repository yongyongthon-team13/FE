// src/api/departureCheck.ts
// 출발 전 컨디션 → 차 추천 여부 (AI 아님, 서버 규칙)
import { apiRequest } from "@/lib/api";

export type DepartureCondition = "GOOD" | "NORMAL" | "BAD";

export type DepartureCheckResult = {
  recommendCar: boolean;
  reasonCodes: string[];
};

/** POST /api/v1/appointments/{appointmentId}/departure-checks */
export function checkDeparture(
  appointmentId: string,
  condition: DepartureCondition,
  usesCane: boolean,
): Promise<DepartureCheckResult> {
  return apiRequest<DepartureCheckResult>(
    `/api/v1/appointments/${appointmentId}/departure-checks`,
    {
      method: "POST",
      body: JSON.stringify({ condition, usesCane }),
    },
  );
}
