// src/lib/config.ts
// 백엔드 주소: .env 의 EXPO_PUBLIC_API_URL 값 (없으면 로컬 서버)
// TODO: 백엔드 배포 주소가 나오면 .env 에 EXPO_PUBLIC_API_URL=https://... 로 넣기
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
