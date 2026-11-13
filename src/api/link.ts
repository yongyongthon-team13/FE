// src/api/link.ts
// 어르신 앱 ↔ 보호자 앱 연결
// 흐름: 어르신 앱이 연결 번호를 받아 화면에 띄움 → 보호자가 번호 입력 → 서버가 두 계정을 연결
import { ApiError, apiRequest } from "@/lib/api";
import {
  clearElderId,
  clearLinkId,
  getElderId,
  getLinkId,
  saveElderId,
  saveLinkId,
} from "@/lib/tokenStorage";

export type LinkCode = {
  code: string; // 연결 번호
  expiresAt: string; // 만료 시각 (ISO)
};

export type LinkResult = {
  linkId: string;
  elderId: string;
  status: string;
};

export type ElderSummary = {
  elderId: string;
  name: string;
  birthYear: number | null;
  relationship: string | null;
  phoneNumber?: string | null;
};

/** 어르신 앱: POST /api/v1/elder-profiles/{elderId}/guardian-link-codes */
export async function requestLinkCode(): Promise<LinkCode> {
  const elderId = await getElderId();
  if (!elderId) throw new ApiError(400, "NO_ELDER", "어르신 정보가 없어요");
  return apiRequest<LinkCode>(
    `/api/v1/elder-profiles/${elderId}/guardian-link-codes`,
    { method: "POST" },
  );
}

/** 보호자 앱: POST /api/v1/guardian-links → 어르신 id·연결 id 저장 */
export async function linkGuardian(
  code: string,
  relationship?: string,
): Promise<LinkResult> {
  const link = await apiRequest<LinkResult>("/api/v1/guardian-links", {
    method: "POST",
    body: JSON.stringify({ code, ...(relationship ? { relationship } : {}) }),
  });
  await saveElderId(link.elderId);
  await saveLinkId(link.linkId);
  return link;
}

/** 보호자 앱: DELETE /api/v1/guardian-links/{linkId} */
export async function unlinkGuardian(): Promise<void> {
  const linkId = await getLinkId();
  if (!linkId) throw new ApiError(400, "NO_LINK", "연결 정보가 없어요");
  await apiRequest(`/api/v1/guardian-links/${linkId}`, { method: "DELETE" });
  await clearElderId();
  await clearLinkId();
}

/** 보호자 앱: GET /api/v1/guardian/elder-profiles */
export function getLinkedElders(): Promise<ElderSummary[]> {
  return apiRequest<ElderSummary[]>("/api/v1/guardian/elder-profiles");
}

/** 보호자 앱: 저장된 어르신 id, 없으면(다시 로그인 등) 연결 목록 첫 번째로 저장 */
export async function ensureGuardianElderId(): Promise<string | null> {
  const saved = await getElderId();
  if (saved) return saved;
  const [first] = await getLinkedElders();
  if (!first) return null;
  await saveElderId(first.elderId);
  return first.elderId;
}
