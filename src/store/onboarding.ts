export type Aid = "wheelchair" | "walker" | "cane" | "none";
export type StairsAnswer = "ok" | "hard";

// 온보딩 중에 모으는 어르신 정보 → mobility-confirm '완료하기'에서 elder-profiles API로 저장
export const onboarding = {
  name: "", // 가입 화면에서 받은 이름 (personal-confirm에서 수정 가능)
  birthYear: "", // 태어난 해, 예: '1952'
  homeAddress: "", // 집 주소 또는 지역명
  discomfort: "", // 걸을 때 불편한 점 (음성으로 받은 글자)
  aids: [] as Aid[],
  stairs: null as StairsAnswer | null,
  // 동의 화면에서 고른 값 → 프로필을 만든 뒤(mobility-confirm) 서버에 저장
  consents: { location: false, notification: false, health: false, caregiver: false },
};
