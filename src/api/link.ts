// src/api/link.ts
// 어르신 앱 ↔ 보호자 앱 연동
// 흐름: 어르신 앱이 서버에서 6자리 연결 번호를 받아 화면에 띄움 → 보호자가 그 번호를 입력 → 서버가 두 계정을 연결

export type LinkCode = {
  code: string; // 6자리 숫자, 예: '482913'
  expiresAt: string; // 만료 시각 (ISO 문자열)
};

export type LinkResult = {
  elderId: string;
  elderName: string;
};

// TODO: POST /link-codes 연동 (어르신 앱에서 호출 → 연결 번호 발급)
export async function requestLinkCode(): Promise<LinkCode> {
  await new Promise(r => setTimeout(r, 300));
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
}

// TODO: POST /guardian-links 연동 (보호자 앱에서 호출 → 연결 번호로 어르신과 연결)
// 번호가 틀렸거나 만료됐으면 에러를 던짐
export async function linkGuardian(code: string): Promise<LinkResult> {
  await new Promise(r => setTimeout(r, 300));
  if (code === '000000') throw new Error('INVALID_CODE');
  return { elderId: 'mock-elder', elderName: '어머니' };
}

// TODO: DELETE /guardian-links 연동 (보호자 연결 해제 → 어르신 정보·알림을 더 이상 받지 않음)
export async function unlinkGuardian(): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
}