// src/app/home-location.tsx
// 집 위치 등록: 주소 입력 → 후보 고르기 → 저장 (from=onboarding이면 다음은 보호자 입력)
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";

import {
    candidateLabel,
    saveHomeLocation,
    searchHomeCandidates,
    type HomeCandidate,
} from "@/api/homeLocation";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { FormField } from "@/components/FormField";
import { Icon } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette } from "@/constants/theme";

const notify = (title: string, message: string) => {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

export default function HomeLocationScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === "onboarding";

  const [address, setAddress] = useState("");
  const [candidates, setCandidates] = useState<HomeCandidate[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const goNext = () => {
    if (fromOnboarding) router.push("/onboarding/guardian");
    else router.back();
  };

  const handleSearch = async () => {
    if (address.trim().length < 2) return;
    setSearching(true);
    setSelected(null);
    try {
      setCandidates(await searchHomeCandidates(address.trim()));
    } catch {
      setCandidates([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (selected == null || !candidates) return;
    setSaving(true);
    try {
      await saveHomeLocation(candidates[selected]);
      goNext();
    } catch {
      notify("저장하지 못했어요", "잠시 후 다시 시도해 주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow={fromOnboarding ? "3 / 4" : undefined}
      title="집 주소를 알려주세요"
      description={
        "병원 가는 길을 집에서부터 안내해 드려요\n동·호수는 빼고 적어 주세요"
      }
      scroll
      footer={
        <>
          {fromOnboarding && (
            <AppButton
              label="나중에 할게요"
              variant="secondary"
              onPress={goNext}
            />
          )}
          <AppButton
            label="이 위치로 저장하기"
            variant="primary"
            disabled={selected == null || saving}
            onPress={handleSave}
          />
        </>
      }
    >
      <FormField
        label="주소"
        value={address}
        onChangeText={setAddress}
        placeholder="예: 처인구 중부대로 1199"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        right={
          <Pressable
            onPress={handleSearch}
            disabled={searching}
            accessibilityRole="button"
            style={styles.searchButton}
          >
            <AppText
              variant="small"
              weight="semibold"
              color={colors.textOnPrimary}
            >
              {searching ? "찾는 중" : "찾기"}
            </AppText>
          </Pressable>
        }
      />

      {candidates && candidates.length === 0 && (
        <AppText variant="button" color={palette.green300} style={styles.empty}>
          주소를 찾지 못했어요. 도로명이나 동 이름으로 다시 적어 주세요
        </AppText>
      )}

      {candidates && candidates.length > 0 && (
        <View style={styles.list}>
          <AppText variant="button" weight="medium" color={palette.green600}>
            맞는 곳을 골라 주세요
          </AppText>
          {candidates.map((c, i) => {
            const on = i === selected;
            return (
              <Pressable
                key={`${c.latitude},${c.longitude},${i}`}
                style={[styles.card, on && styles.cardSelected]}
                onPress={() => setSelected(i)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
              >
                <Icon
                  name="location"
                  size={22}
                  color={on ? colors.textOnPrimary : colors.accent}
                />
                <AppText
                  variant="button"
                  weight="medium"
                  color={on ? colors.textOnPrimary : palette.green700}
                  style={styles.cardText}
                >
                  {candidateLabel(c)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  empty: { marginTop: 16 },
  list: { marginTop: 28, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: palette.green400,
    borderColor: palette.green600,
  },
  cardText: { flex: 1, minWidth: 0 },
});
