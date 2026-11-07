// src/api/guardianSettings.ts
// 보호자: 설정 (어르신 정보 등)
export type SettingsSection = {
  id: string; // 예: 'elder', 'health', 'alerts', 'family'
  title: string; // 예: '어머니 정보'
  value: string; // 예: '김영자 · 72세 · 처인구'
};

// TODO: GET /guardian/settings 연동
export async function getGuardianSettings(): Promise<SettingsSection[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    { id: 'elder', title: '어머니 정보', value: '김영자 · 72세 · 처인구' },
    { id: 'health', title: '평소 이동 · 건강', value: '지팡이 · 어지럼증' },
    { id: 'alerts', title: '알림 받을 상황', value: '출발 · 도착 · 응답 없음' },
    { id: 'family', title: '연결된 가족', value: '김민수 외 1명' },
  ];
}

// TODO: PUT /guardian/settings 연동
export async function updateGuardianSettings(sections: SettingsSection[]): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
}