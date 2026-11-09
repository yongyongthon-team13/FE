// src/lib/tokenStorage.ts
// 로그인 토큰 저장소: 폰은 SecureStore(암호화), 웹은 localStorage
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type UserRole = 'ELDER' | 'GUARDIAN';

export type AuthTokens = {
  accessToken: string;
  tokenType: string; // 보통 'Bearer'
  expiresAt: string; // access token 만료 시각 (ISO)
  refreshToken: string;
  refreshExpiresAt: string; // refresh token 만료 시각 (ISO)
  userId: string;
  role: UserRole;
};

const KEY = 'auth.tokens';

// 매번 저장소를 읽지 않도록 메모리에도 들고 있음
let cache: AuthTokens | null | undefined;

async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

async function writeRaw(value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, value);
    } catch {
      // 사생활 보호 모드 등에서 저장 실패 → 메모리에만 유지
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(KEY);
  else await SecureStore.setItemAsync(KEY, value);
}

export async function getTokens(): Promise<AuthTokens | null> {
  if (cache !== undefined) return cache;
  const raw = await readRaw();
  try {
    cache = raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  cache = tokens;
  await writeRaw(JSON.stringify(tokens));
}

export async function clearTokens(): Promise<void> {
  cache = null;
  await writeRaw(null);
}

/** refresh token이 아직 살아 있으면 로그인 상태로 봄 */
export function isRefreshValid(tokens: AuthTokens | null): tokens is AuthTokens {
  return !!tokens && new Date(tokens.refreshExpiresAt).getTime() > Date.now();
}
