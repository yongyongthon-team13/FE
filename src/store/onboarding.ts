export type Aid = 'wheelchair' | 'cane' | 'none';
export type StairsAnswer = 'ok' | 'hard';

// TODO: 온보딩 끝나면 elder-profiles API로 저장
export const onboarding = {
  aids: [] as Aid[],
  stairs: null as StairsAnswer | null,
};