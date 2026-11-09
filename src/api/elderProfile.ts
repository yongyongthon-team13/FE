// src/api/elderProfile.ts
// 어르신 프로필 등록 (로그인 후, access token 필요)
import { apiRequest } from '@/lib/api';
import type { Aid, StairsAnswer } from '@/store/onboarding';

export type MobilityAid = 'NONE' | 'CANE' | 'WALKER' | 'WHEELCHAIR' | 'OTHER';

export type ElderProfileRequest = {
  name: string; // 필수
  birthYear?: number;
  homeAddress?: string; // 지역만 받으면 지역명
  mobility?: {
    mobilityAid?: MobilityAid;
    stairsDifficult?: boolean;
    busDifficult?: boolean;
    longWalkDifficult?: boolean;
  };
};

export type ElderProfile = ElderProfileRequest & { elderId: string };

/** POST /api/v1/elder-profiles → 201 + 프로필(elderId 포함) */
export function createElderProfile(body: ElderProfileRequest): Promise<ElderProfile> {
  return apiRequest<ElderProfile>('/api/v1/elder-profiles', { method: 'POST', body: JSON.stringify(body) });
}

/** 온보딩에서 고른 보조기구 → API 값 (API는 하나만 받아서, 여러 개 고르면 휠체어 > 보행기 > 지팡이 순으로 보냄) */
export function toMobilityAid(aids: Aid[]): MobilityAid {
  if (aids.includes('wheelchair')) return 'WHEELCHAIR';
  if (aids.includes('walker')) return 'WALKER';
  if (aids.includes('cane')) return 'CANE';
  return 'NONE';
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
    ...(data.homeAddress.trim() ? { homeAddress: data.homeAddress.trim() } : {}),
    mobility: {
      mobilityAid: toMobilityAid(data.aids),
      ...(data.stairs ? { stairsDifficult: data.stairs === 'hard' } : {}),
    },
  };
}
