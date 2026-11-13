// src/lib/api.ts
// 백엔드 호출 공통 함수: 토큰 자동 첨부 + 401이면 토큰 갱신 후 한 번 재시도
import { router } from "expo-router";

import { API_BASE_URL } from "./config";
import {
  clearElderId,
  clearLinkId,
  clearTokens,
  getTokens,
  saveTokens,
  type AuthTokens,
} from "./tokenStorage";

/** 서버 오류 (본문의 title/detail을 그대로 담음) */
export class ApiError extends Error {
  constructor(
    public status: number,
    public title?: string,
    public detail?: string,
  ) {
    super(detail ?? title ?? `HTTP ${status}`);
  }
}

// access token 만료 1분 전이면 미리 갱신
const REFRESH_MARGIN_MS = 60 * 1000;

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const err = body?.error ?? body;
    return new ApiError(
      res.status,
      err?.code ?? body?.title,
      err?.message ?? body?.detail,
    );
  } catch {
    return new ApiError(res.status); // 본문 없는 401 등
  }
}

/** 토큰 없이 부르는 요청 (인증번호 발송, 로그인, 갱신, 로그아웃) */
export async function publicRequest<T = void>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toApiError(res);
  if (res.status === 202 || res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// 동시에 여러 요청이 401을 받아도 갱신은 한 번만 하도록 같은 Promise를 공유
let refreshing: Promise<AuthTokens | null> | null = null;

async function doRefresh(): Promise<AuthTokens | null> {
  const current = await getTokens();
  if (!current) return null;
  try {
    // 갱신하면 refresh token도 새로 나오고 기존 것은 바로 무효 → 반드시 교체 저장
    const next = await publicRequest<AuthTokens>("/api/v1/auth/refresh", {
      refreshToken: current.refreshToken,
    });
    await saveTokens(next);
    return next;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await endSession(); // refresh token 만료·무효 → 다시 문자 인증
      return null;
    }
    throw e; // 네트워크 오류 등은 토큰을 지우지 않음
  }
}

export function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/** 토큰을 지우고 첫 화면으로 */
/** 토큰·어르신 id를 지우고 첫 화면으로 */
export async function endSession(): Promise<void> {
  await clearTokens();
  await clearElderId();
  await clearLinkId();
  router.replace("/");
}

async function validAccessToken(): Promise<AuthTokens | null> {
  const tokens = await getTokens();
  if (!tokens) return null;
  if (!tokens.refreshToken) return tokens; // 갱신 불가 → 그대로 쓰고, 만료되면 401에서 처리
  const expiresSoon =
    new Date(tokens.expiresAt).getTime() - REFRESH_MARGIN_MS <= Date.now();
  return expiresSoon ? refreshTokens() : tokens;
}

/** 로그인이 필요한 요청. 예: apiRequest<Home>('/api/v1/guardian/home') */
export async function apiRequest<T = void>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const send = (tokens: AuthTokens | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        // 사진 등 FormData는 Content-Type을 직접 넣지 않음 (자동으로 붙음)
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(init.headers ?? {}),
        ...(tokens
          ? {
              Authorization: `${tokens.tokenType || "Bearer"} ${tokens.accessToken}`,
            }
          : {}),
      },
    });

  let res = await send(await validAccessToken());

  // access token 만료·무효 → 갱신 후 한 번만 다시 시도
  if (res.status === 401) {
    const next = await refreshTokens();
    if (!next) throw new ApiError(401);
    res = await send(next);
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 202 || res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

type Envelope<T> = {
  data: T;
  error?: { code?: string; message?: string } | null;
};

/** { data, error, meta }로 감싸서 주는 API용 (route-plans, trips, transport-requests) */
export async function apiData<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const body = await apiRequest<Envelope<T>>(path, init);
  if (body?.error) throw new ApiError(400, body.error.code, body.error.message);
  return body.data;
}
