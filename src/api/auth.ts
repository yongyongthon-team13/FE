// src/api/auth.ts
// 로그인: 문자 인증 → 토큰 발급·저장 / 로그아웃
import { ApiError, endSession, publicRequest } from '@/lib/api';
import { getTokens, saveTokens, type AuthTokens, type UserRole } from '@/lib/tokenStorage';

export type { UserRole };

/** 인증번호 문자 보내기 (성공 시 202, 본문 없음) */
export async function sendVerificationCode(phoneNumber: string): Promise<void> {
  await publicRequest('/api/v1/auth/phone-verifications', { phoneNumber });
}

/** 인증번호로 로그인 → 토큰 저장 */
export async function login(phoneNumber: string, verificationCode: string, role: UserRole): Promise<AuthTokens> {
  const tokens = await publicRequest<AuthTokens>('/api/v1/auth/login', { phoneNumber, verificationCode, role });
  await saveTokens(tokens);
  return tokens;
}

/** 로그아웃: 서버에 알리고, 실패해도 기기의 토큰은 반드시 삭제 */
export async function logout(): Promise<void> {
  const tokens = await getTokens();
  try {
    if (tokens) await publicRequest('/api/v1/auth/logout', { refreshToken: tokens.refreshToken });
  } catch {
    // 서버 응답과 관계없이 아래에서 토큰 삭제
  } finally {
    await endSession();
  }
}

/** 화면에 보여줄 오류 문구 */
export function authErrorMessage(e: unknown): { title: string; message: string } {
  if (e instanceof ApiError) {
    if (e.status === 400) return { title: '인증번호가 맞지 않아요', message: '번호를 다시 확인하거나, 5분이 지났다면 다시 받아 주세요' };
    if (e.status === 429) return { title: '잠시 후 다시 받아 주세요', message: '인증번호는 1분에 한 번, 하루 10번까지 받을 수 있어요' };
    if (e.status === 503) return { title: '문자를 보낼 수 없어요', message: '문자 서비스 점검 중이에요. 잠시 후 다시 시도해 주세요' };
  }
  return { title: '연결에 실패했어요', message: '인터넷 연결을 확인하고 다시 시도해 주세요' };
}
