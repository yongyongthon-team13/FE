// src/lib/tokenStorage.ts
// 로그인 토큰 저장소: 폰은 SecureStore(암호화), 웹은 localStorage
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type UserRole = "ELDER" | "GUARDIAN";

export type AuthTokens = {
  accessToken: string;
  tokenType: string; // 보통 'Bearer'
  expiresAt: string; // access token 만료 시각 (ISO)
  refreshToken: string;
  refreshExpiresAt?: string; // refresh token 만료 시각 (ISO)
  userId: string;
  role: UserRole;
};

const KEY = "auth.tokens";

// 매번 저장소를 읽지 않도록 메모리에도 들고 있음
let cache: AuthTokens | null | undefined;

async function readRaw(key: string = KEY): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function writeRaw(
  value: string | null,
  key: string = KEY,
): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      // 사생활 보호 모드 등에서 저장 실패 → 메모리에만 유지
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
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
/** 로그인 상태인지: refresh token이 있으면 그 만료, 없으면 access token 만료 기준 */
export function isRefreshValid(
  tokens: AuthTokens | null,
): tokens is AuthTokens {
  if (!tokens) return false;
  const until = tokens.refreshExpiresAt ?? tokens.expiresAt;
  return new Date(until).getTime() > Date.now();
}

// ── 어르신 id: 프로필 등록 응답의 elderId (내 정보·일정 등 API에 필요)
const ELDER_KEY = "auth.elderId";
let elderCache: string | null | undefined;

export async function getElderId(): Promise<string | null> {
  if (elderCache !== undefined) return elderCache;
  elderCache = await readRaw(ELDER_KEY);
  return elderCache;
}

export async function saveElderId(elderId: string): Promise<void> {
  elderCache = elderId;
  await writeRaw(elderId, ELDER_KEY);
}

export async function clearElderId(): Promise<void> {
  elderCache = null;
  await writeRaw(null, ELDER_KEY);
}

// ── 보호자 연결 id: 연결 해제(DELETE /guardian-links/{linkId})에 필요
const LINK_KEY = "auth.linkId";

export async function getLinkId(): Promise<string | null> {
  return readRaw(LINK_KEY);
}

export async function saveLinkId(linkId: string): Promise<void> {
  await writeRaw(linkId, LINK_KEY);
}

export async function clearLinkId(): Promise<void> {
  await writeRaw(null, LINK_KEY);
}

// ── 푸시 토큰: 로그아웃할 때 서버에서 해제하려고 기기에 보관
const PUSH_KEY = "auth.pushToken";

export async function getPushToken(): Promise<string | null> {
  return readRaw(PUSH_KEY);
}

export async function savePushToken(token: string): Promise<void> {
  await writeRaw(token, PUSH_KEY);
}

export async function clearPushToken(): Promise<void> {
  await writeRaw(null, PUSH_KEY);
}
