// src/app/onboarding/consent.tsx
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Icon } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, fontFamily, fontSize, radius } from "@/constants/theme";
import { onboarding } from "@/store/onboarding";

type ConsentKey = "location" | "notification" | "health" | "caregiver";

const ITEMS: { key: ConsentKey; label: string }[] = [
  { key: "location", label: "위치 정보 이용 동의" },
  { key: "notification", label: "알림·전화 수신 동의" },
  { key: "health", label: "건강 정보 이용 동의" },
  { key: "caregiver", label: "보호자와 이동 정보 공유 동의" },
];

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState<Record<ConsentKey, boolean>>({
    location: false,
    notification: false,
    health: false,
    caregiver: false,
  });
  const allAgreed = ITEMS.every((item) => agreed[item.key]);

  const toggle = (key: ConsentKey) =>
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ScreenLayout
      scroll={false}
      bodyPaddingTop={0}
      footer={
        <>
          <View style={styles.consents}>
            {ITEMS.map((item) => (
              <ConsentToggle
                key={item.key}
                label={item.label}
                checked={agreed[item.key]}
                onPress={() => toggle(item.key)}
              />
            ))}
          </View>
          <AppButton
            label="완료하기"
            variant="primary"
            disabled={!allAgreed}
            onPress={() => {
              onboarding.consents = agreed; // 프로필 만든 뒤 서버에 저장
              router.push("/onboarding/mobility");
            }}
          />
        </>
      }
    >
      <View style={styles.center}>
        <Text style={styles.title}>
          {"다음 절차를 위해서\n동의를 받을게요"}
        </Text>
      </View>
    </ScreenLayout>
  );
}

function ConsentToggle({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  const color = checked ? colors.textOnPrimary : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.toggle, checked && styles.toggleChecked]}
    >
      <Icon name="clipboardCheck" size={25} color={color} />
      <Text style={[styles.toggleText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 49,
    color: colors.accent,
    textAlign: "center",
  },
  consents: {
    gap: 9,
    marginBottom: 6,
  },
  toggle: {
    height: 40,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  toggleChecked: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.button,
  },
});
