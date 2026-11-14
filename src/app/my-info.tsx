// src/app/my-info.tsx
// 어르신: 내 정보 (서버 프로필 조회·수정 + 보호자 연결 번호)
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ensureElderId,
  getElderProfile,
  updateElderProfile,
  type ElderProfile,
  type MobilityAid,
} from "@/api/elderProfile";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { BottomNav } from "@/components/BottomNav";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SettingsCard } from "@/components/guardian/SettingsCard";
import { Icon } from "@/components/Icon";
import { colors, palette } from "@/constants/theme";

type Section = { id: string; title: string; value: string; editable: boolean };

const AID_CHOICES: [MobilityAid, string][] = [
  ["WHEELCHAIR", "휠체어를 사용해요"],
  ["WALKER", "보행기를 사용해요"],
  ["CANE", "지팡이를 사용해요"],
  ["NONE", "아무것도 사용하지 않아요"],
];

const AID_LABEL: Record<string, string> = {
  WHEELCHAIR: "휠체어",
  WALKER: "보행기",
  CANE: "지팡이",
  NONE: "보조기구 없음",
};

/** 서버 프로필 → 카드 */
function toSections(p: ElderProfile): Section[] {
  const age = p.birthYear
    ? `${new Date().getFullYear() - p.birthYear + 1}세`
    : "";
  const mobility = [
    AID_LABEL[p.mobility?.mobilityAid ?? ""] ?? "",
    p.mobility?.stairsDifficult ? "계단 어려움" : "",
    p.mobility?.walkingDiscomfort ? "걷기 불편" : "",
  ].filter(Boolean);
  return [
    {
      id: "me",
      title: "나의 정보",
      value: [p.name, age, p.homeAddress].filter(Boolean).join(" · "),
      editable: true,
    },
    {
      id: "health",
      title: "평소 이동 · 건강",
      value: mobility.join(" · ") || "없음",
      editable: true, // 글자 대신 아래 선택 버튼으로 수정
    },
    {
      id: "display",
      title: "글자 · 음성",
      value: "글자 크게 · 음성 안내 켜짐",
      editable: false,
    },
    {
      id: "guardian",
      title: "보호자",
      value: "아래 버튼으로 연결 번호를 보여 주세요",
      editable: false,
    },
  ];
}

/** '김영자 · 72세 · 처인구 OO로' → 이름, 주소 (나이는 수정하지 않음) */
function parseMe(value: string): { name: string; homeAddress: string } {
  const parts = value
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const name = parts[0] ?? "";
  const homeAddress = parts
    .filter((s, i) => i > 0 && !/^\d+\s*세$/.test(s))
    .join(" ");
  return { name, homeAddress };
}

const alertMsg = (title: string, message: string) => {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

/** 어르신: 내 정보 (내용 수정하기 → 값 직접 수정 → 저장하기) */
export default function MyInfoScreen() {
  const insets = useSafeAreaInsets();
  const [elderId, setElderId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [draft, setDraft] = useState<Section[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  // 평소 이동·건강 (수정할 때 선택 버튼으로)
  const [profile, setProfile] = useState<ElderProfile | null>(null);
  const [aid, setAid] = useState<MobilityAid>("NONE");
  const [stairs, setStairs] = useState(false);
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await ensureElderId();
      setElderId(id);
      if (!id) {
        setSections([]);
        return;
      }
      try {
        const p = await getElderProfile(id);
        setProfile(p);
        setSections(toSections(p));
      } catch {
        setSections([]);
      }
    })();
  }, []);

  const startEdit = () => {
    setDraft(sections ?? []);
    setAid((profile?.mobility?.mobilityAid as MobilityAid) ?? "NONE");
    setStairs(!!profile?.mobility?.stairsDifficult);
    setWalking(!!profile?.mobility?.walkingDiscomfort);
    setEditing(true);
  };

  const save = async () => {
    if (!elderId) return;
    const me = draft.find((s) => s.id === "me");
    setBusy(true);
    try {
      if (me) {
        const { name, homeAddress } = parseMe(me.value);
        if (!name) {
          alertMsg(
            "이름을 입력해 주세요",
            "나의 정보 맨 앞에 이름이 있어야 해요",
          );
          return;
        }
        const saved = await updateElderProfile(elderId, {
          name,
          homeAddress,
          // 화면에 없는 칸(버스·오래 걷기)은 기존 값 유지
          mobility: {
            ...profile?.mobility,
            mobilityAid: aid,
            stairsDifficult: stairs,
            walkingDiscomfort: walking,
          },
        });
        setProfile(saved);
        setSections(toSections(saved));
      }
      setEditing(false);
    } catch {
      alertMsg("저장하지 못했어요", "잠시 후 다시 시도해 주세요");
    } finally {
      setBusy(false);
    }
  };

  const list = editing ? draft : (sections ?? []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Icon name="profileList" size={30} />
        <AppText variant="body" weight="semibold" color={colors.accent}>
          내 정보
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="button" color={palette.green200}>
          어르신
        </AppText>
        <AppText variant="heading" weight="semibold" color={palette.green600}>
          내 정보
        </AppText>

        {sections === null && (
          <ActivityIndicator color={colors.accent} style={styles.loading} />
        )}

        {sections?.length === 0 && (
          <AppText
            variant="body"
            color={palette.green300}
            style={styles.loading}
          >
            {"정보를 불러오지 못했어요.\n잠시 후 다시 시도해 주세요"}
          </AppText>
        )}

        <View style={styles.list}>
          {list.map((section, i) =>
            editing && section.id === "health" ? (
              <View key={section.id} style={styles.mobilityEdit}>
                <AppText
                  variant="body"
                  weight="semibold"
                  color={palette.green600}
                >
                  {section.title}
                </AppText>
                {AID_CHOICES.map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    label={label}
                    selected={aid === value}
                    onPress={() => setAid(value)}
                  />
                ))}
                <ChoiceButton
                  label="계단 이용이 힘들어요"
                  selected={stairs}
                  onPress={() => setStairs((v) => !v)}
                />
                <ChoiceButton
                  label="걷는 게 불편해요"
                  selected={walking}
                  onPress={() => setWalking((v) => !v)}
                />
              </View>
            ) : (
            <SettingsCard
              key={section.id}
              title={section.title}
              value={section.value}
              highlight={i % 2 === 0}
              editing={editing && section.editable}
              onChangeValue={(text) =>
                setDraft((prev) =>
                  prev.map((s) =>
                    s.id === section.id ? { ...s, value: text } : s,
                  ),
                )
              }
            />
            ),
          )}
        </View>

        {!!sections?.length && (
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
            onPress={editing ? save : startEdit}
            disabled={busy}
            accessibilityRole="button"
          >
            <AppText
              variant="small"
              weight="semibold"
              color={colors.textOnPrimary}
            >
              {editing ? "저장하기" : "내용 수정하기"}
            </AppText>
            {!editing && (
              <Icon name="edit" size={16} color={colors.textOnPrimary} />
            )}
          </Pressable>
        )}

        {/* 정보를 못 불러와도 항상 보이게 */}
        {!editing && (
          <View style={styles.links}>
            <AppButton
              label="집 위치 등록하기"
              variant="outline"
              onPress={() => router.push("/home-location")}
            />
            <AppButton
              label="보호자 연결 번호 보기"
              variant="outline"
              onPress={() => router.push("/link-code")}
            />
          </View>
        )}
      </ScrollView>

      <BottomNav active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 12,
  },
  body: { paddingHorizontal: 30, paddingTop: 30, paddingBottom: 40 },
  loading: { marginTop: 40 },
  list: { marginTop: 26, gap: 20 },
  editButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 41,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: palette.green400,
  },
  editButtonPressed: { backgroundColor: palette.green500 },
  mobilityEdit: { gap: 8 },
  links: { marginTop: 20, gap: 10 },
});
