// src/api/auth.ts
// 어르신 회원가입: 휴대폰 문자 인증
export type VerifyResult = {
  userId: string;
};

// TODO: POST /auth/sms 연동 (이름·전화번호로 인증번호 문자 보내기)
export async function sendVerificationCode(name: string, phone: string): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
}

// TODO: POST /auth/sms/verify 연동 (인증번호 확인 → 가입 완료)
// 번호가 틀렸거나 만료됐으면 에러를 던짐
export async function verifyCode(phone: string, code: string): Promise<VerifyResult> {
  await new Promise(r => setTimeout(r, 300));
  if (code === '000000') throw new Error('INVALID_CODE');
  return { userId: 'mock-elder' };
}