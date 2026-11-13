// src/api/clinics.ts
// 진료과 + 동네 → 병원 목록
import { apiRequest } from "@/lib/api";

export type Clinic = {
  name: string;
  kind: string | null;
  clinicSize: "SMALL" | "MEDIUM" | "LARGE" | string | null;
  address: string | null;
  phone: string | null;
  specialist: boolean | null;
  nearestStop: string | null;
  stopDistanceM: number | null;
  latitude: number | null;
  longitude: number | null;
};

/** 화면에 보여줄 규모 글자 */
export const SIZE_LABEL: Record<string, string> = {
  SMALL: "소",
  MEDIUM: "중",
  LARGE: "대",
};

/** GET /api/v1/clinics?department=...&district=... */
export function getClinics(
  department: string,
  district?: string,
): Promise<Clinic[]> {
  const params = new URLSearchParams({ department });
  if (district) params.set("district", district);
  return apiRequest<Clinic[]>(`/api/v1/clinics?${params.toString()}`);
}
