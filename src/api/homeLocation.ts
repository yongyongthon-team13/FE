// src/api/homeLocation.ts
// 어르신 집 위치: 주소 → 좌표 후보(TMAP) → 확인 후 저장 → 경로 출발지·날씨 위치로 사용
import { apiRequest } from "@/lib/api";

export type HomeCandidate = {
  address: string;
  buildingName?: string | null;
  buildingDong?: string | null;
  latitude: number;
  longitude: number;
};

export type HomeLocation = {
  address: string;
  latitude: number;
  longitude: number;
  verifiedAt?: string | null;
};

/** 집 위치를 등록 안 했을 때 쓰는 기본 위치 (용인시 처인구청) */
export const DEFAULT_HOME = { latitude: 37.2342, longitude: 127.2017 };

/** POST /api/v1/elder-profiles/me/home-location/candidates (동·호수는 빼고 보내기) */
export async function searchHomeCandidates(
  address: string,
): Promise<HomeCandidate[]> {
  const res = await apiRequest<{ candidates: HomeCandidate[] }>(
    "/api/v1/elder-profiles/me/home-location/candidates",
    { method: "POST", body: JSON.stringify({ address }) },
  );
  return res.candidates ?? [];
}

let cached: HomeLocation | null = null;

/** PUT /api/v1/elder-profiles/me/home-location */
export async function saveHomeLocation(
  c: HomeCandidate,
): Promise<HomeLocation> {
  cached = await apiRequest<HomeLocation>(
    "/api/v1/elder-profiles/me/home-location",
    {
      method: "PUT",
      body: JSON.stringify({
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
      }),
    },
  );
  return cached;
}

/** GET /api/v1/elder-profiles/me/home-location (등록 안 했거나 실패하면 null) */
export async function getHomeLocation(): Promise<HomeLocation | null> {
  if (cached) return cached;
  try {
    cached = await apiRequest<HomeLocation>(
      "/api/v1/elder-profiles/me/home-location",
    );
    return cached;
  } catch {
    return null;
  }
}

/** 경로 출발지·날씨에 쓰는 집 좌표 (없으면 기본 위치) */
export async function getHomePoint(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const home = await getHomeLocation();
  return home
    ? { latitude: home.latitude, longitude: home.longitude }
    : DEFAULT_HOME;
}

/** 후보 한 줄 표시: '처인구 중부대로 1199 · 용인시청' */
export const candidateLabel = (c: HomeCandidate) =>
  [c.address, [c.buildingName, c.buildingDong].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(" · ");
