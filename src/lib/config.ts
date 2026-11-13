// src/lib/config.ts
// 백엔드 주소: EXPO_PUBLIC_API_URL 값이 있으면 그걸 쓰고, 없으면 배포 서버
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://161.33.148.35:8080";
