// src/api/guardianSettings.ts
// 보호자: 설정 (연결된 어르신 · 내 정보 · 알림 받을 상황)
import { apiRequest } from "@/lib/api";

import { requireElderId } from "./guardianData";
import { getLinkedElders } from "./link";

export type SettingsSection = {
  id: string; // 'elder' | 'me' | 'alerts' | 'family'
  title: string; // 예: '어머니 정보'
  value: string; // 예: '김영자 · 72세'
};

type GuardianProfile = { name?: string | null; phoneNumber?: string | null };

const phoneText = (p?: string | null) => {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 11
    ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
    : d;
};

/** GET 연결 어르신 목록 + GET /api/v1/guardian-profiles/me */
export async function getGuardianSettings(): Promise<SettingsSection[]> {
  const elderId = await requireElderId();
  const [elders, me] = await Promise.all([
    getLinkedElders(),
    apiRequest<GuardianProfile>("/api/v1/guardian-profiles/me").catch(
      () => null,
    ),
  ]);
  const elder = elders.find((e) => e.elderId === elderId);
  const call = elder?.relationship || elder?.name || "어르신";
  const age = elder?.birthYear
    ? `${new Date().getFullYear() - elder.birthYear}세`
    : null;

  return [
    {
      id: "elder",
      title: `${call} 정보`,
      value: [elder?.name, age].filter(Boolean).join(" · ") || "-",
    },
    {
      id: "me",
      title: "내 정보",
      value:
        [me?.name, phoneText(me?.phoneNumber)].filter(Boolean).join(" · ") ||
        "-",
    },
    // 서버가 보내는 보호자 알림 (늦어질 때 · 응답 없을 때 · 차량 부탁)
    {
      id: "alerts",
      title: "알림 받을 상황",
      value: "도착 늦어짐 · 응답 없음 · 차량 부탁",
    },
    {
      id: "family",
      title: "연결된 어르신",
      value: elders.map((e) => e.relationship || e.name).join(", ") || "-",
    },
  ];
}

/** 저장: '내 정보'의 이름만 서버에 저장 (PUT /api/v1/guardian-profiles/me). 나머지는 보기 전용 */
export async function updateGuardianSettings(
  sections: SettingsSection[],
): Promise<void> {
  const name = sections
    .find((s) => s.id === "me")
    ?.value.split("·")[0]
    .trim();
  if (!name || name === "-") return;
  await apiRequest("/api/v1/guardian-profiles/me", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}
