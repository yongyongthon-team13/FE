// src/api/guardian.ts
// 어르신 앱: 연결된 보호자
import { apiRequest } from "@/lib/api";

export type Guardian = {
  name: string;
  relation: string;
  phone: string; // 숫자만, 예: '01012345678'
};

type LinkedGuardian = {
  linkId: string;
  name?: string | null;
  phoneNumber?: string | null;
  relationship?: string | null;
};

/** GET /api/v1/elder-profiles/me/guardians → 첫 번째 보호자 (없거나 실패하면 null) */
export async function getPrimaryGuardian(): Promise<Guardian | null> {
  try {
    const list = await apiRequest<LinkedGuardian[]>(
      "/api/v1/elder-profiles/me/guardians",
    );
    const g = list.find((item) => item.phoneNumber) ?? list[0];
    if (!g) return null;
    return {
      name: g.name ?? "",
      relation: g.relationship ?? "보호자",
      phone: (g.phoneNumber ?? "").replace(/\D/g, ""),
    };
  } catch {
    return null;
  }
}
