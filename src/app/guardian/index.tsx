// src/app/guardian/index.tsx
// '/guardian' 주소로 들어오면 보호자 홈으로 보냄
import { Redirect } from "expo-router";

export default function GuardianIndex() {
  return <Redirect href="/guardian-home" />;
}
