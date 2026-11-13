// src/api/department.ts
// 말한 아픈 곳 → 진료과 추천 (AI, 위험 증상은 규칙이 먼저 걸러 emergency)
import { apiRequest } from "@/lib/api";

export type DepartmentRecommendation = {
  emergency: boolean; // true면 119 안내
  bodyPart: string | null; // 예: '뼈 · 관절 · 허리'
  department: string | null; // 예: '정형외과' (분류 실패면 null → 버튼 화면)
  basis: string | null; // 추천 근거
};

/** POST /api/v1/department-recommendations */
export function recommendDepartment(
  text: string,
): Promise<DepartmentRecommendation> {
  return apiRequest<DepartmentRecommendation>(
    "/api/v1/department-recommendations",
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
}
