// src/api/elderProfile.ts
// 어르신 프로필 등록 (로그인 후, access token 필요)
import { apiRequest } from "@/lib/api";
import { getElderId, saveElderId } from "@/lib/tokenStorage";
import type { Aid, StairsAnswer } from "@/store/onboarding";

export type MobilityAid = "NONE" | "CANE" | "WALKER" | "WHEELCHAIR" | "OTHER";

export type ElderProfileRequest = {
  name: string; // 필수
  birthYear?: number;
  homeAddress?: string; // 지역만 받으면 지역명
  mobility?: {
    mobilityAid?: MobilityAid;
    stairsDifficult?: boolean;
    busDifficult?: boolean;
    longWalkDifficult?: boolean;
    walkingDiscomfort?: boolean;
  };
};

export type ElderProfile = ElderProfileRequest & { elderId: string };

/** POST /api/v1/elder-profiles → 201 + 프로필(elderId 포함) */
export function createElderProfile(
  body: ElderProfileRequest,
): Promise<ElderProfile> {
  return apiRequest<ElderProfile>("/api/v1/elder-profiles", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** 온보딩에서 고른 보조기구 → API 값 (API는 하나만 받아서, 여러 개 고르면 휠체어 > 보행기 > 지팡이 순으로 보냄) */
export function toMobilityAid(aids: Aid[]): MobilityAid {
  if (aids.includes("wheelchair")) return "WHEELCHAIR";
  if (aids.includes("walker")) return "WALKER";
  if (aids.includes("cane")) return "CANE";
  return "NONE";
}

/** 온보딩 값 → 등록 요청 본문 */
export function toElderProfileRequest(data: {
  name: string;
  birthYear: string;
  homeAddress: string;
  aids: Aid[];
  stairs: StairsAnswer | null;
}): ElderProfileRequest {
  const year = Number(data.birthYear);
  return {
    name: data.name.trim(),
    ...(year > 1900 ? { birthYear: year } : {}),
    ...(data.homeAddress.trim()
      ? { homeAddress: data.homeAddress.trim() }
      : {}),
    mobility: {
      mobilityAid: toMobilityAid(data.aids),
      ...(data.stairs ? { stairsDifficult: data.stairs === "hard" } : {}),
    },
  };
}

/** GET /api/v1/elder-profiles/{elderId} */
export function getElderProfile(elderId: string): Promise<ElderProfile> {
  return apiRequest<ElderProfile>(`/api/v1/elder-profiles/${elderId}`);
}

/** PATCH /api/v1/elder-profiles/{elderId} (보낸 칸만 바뀜) */
export function updateElderProfile(
  elderId: string,
  body: Partial<
    Pick<ElderProfileRequest, "name" | "birthYear" | "homeAddress" | "mobility">
  >,
): Promise<ElderProfile> {
  return apiRequest<ElderProfile>(`/api/v1/elder-profiles/${elderId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── 개인정보 동의: PUT /api/v1/elder-profiles/{elderId}/consents/{scope}
// 보호자 알림·차량 부탁·지연/무응답 푸시는 '보호자 공유 동의'가 있어야 동작함
// policyVersion: 동의 화면 문구 버전 (문구가 바뀌면 v2로 올리기). 성공 응답은 204
const CONSENT_SCOPES = {
  location: "LOCATION", // 위치 정보 이용
  notification: "NOTIFICATION_CALL", // 알림·전화 수신
  health: "HEALTH", // 건강 정보 이용
  caregiver: "CAREGIVER_SHARING", // 보호자와 이동 정보 공유 (보호자 알림·차량 부탁에 필요)
} as const;
const POLICY_VERSION = "v1";

export async function saveConsents(
  elderId: string,
  agreed: Record<keyof typeof CONSENT_SCOPES, boolean>,
): Promise<void> {
  await Promise.all(
    (Object.keys(CONSENT_SCOPES) as (keyof typeof CONSENT_SCOPES)[]).map(
      (key) =>
        apiRequest(
          `/api/v1/elder-profiles/${elderId}/consents/${CONSENT_SCOPES[key]}`,
          {
            method: "PUT",
            body: JSON.stringify({
              policyVersion: POLICY_VERSION,
              granted: agreed[key],
            }),
          },
        ),
    ),
  );
}

/** 어르신 id: 기기에 없으면(다른 기기·다시 설치) 서버의 내 프로필에서 가져와 저장 */
export async function ensureElderId(): Promise<string | null> {
  const saved = await getElderId();
  if (saved) return saved;
  const me = await apiRequest<{ elderId?: string }>(
    "/api/v1/elder-profiles/me",
  ).catch(() => null);
  if (!me?.elderId) return null;
  await saveElderId(me.elderId);
  return me.elderId;
}
