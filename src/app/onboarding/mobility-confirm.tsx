import { createElderProfile, toElderProfileRequest } from "@/api/elderProfile";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, radius } from "@/constants/theme";
import { saveElderId } from "@/lib/tokenStorage";
import { onboarding } from "@/store/onboarding";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";

function AnswerRow({
  label,
  highlighted,
}: {
  label: string;
  highlighted: boolean;
}) {
  return (
    <View style={[styles.row, highlighted && styles.rowHighlighted]}>
      <AppText
        variant="button"
        weight="semibold"
        color={highlighted ? colors.textOnPrimary : colors.accent}
      >
        {label}
      </AppText>
    </View>
  );
}

export default function MobilityConfirmScreen() {
  const usesWheelchair = onboarding.aids.includes("wheelchair");
  const usesWalker = onboarding.aids.includes("walker");
  const usesCane = onboarding.aids.includes("cane");
  const stairsHard = onboarding.stairs === "hard";
  const [busy, setBusy] = useState(false);

  // 지금까지 받은 이름·출생연도·주소·이동 정보를 프로필로 등록
  const handleComplete = async () => {
    setBusy(true);
    try {
      const profile = await createElderProfile(
        toElderProfileRequest(onboarding),
      );
      await saveElderId(profile.elderId);
      router.push("/onboarding/discomfort");
    } catch {
      const title = "정보를 저장하지 못했어요";
      const message = "인터넷 연결을 확인하고 다시 눌러 주세요";
      if (Platform.OS === "web") window.alert(`${title}\n${message}`);
      else Alert.alert(title, message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="2/4"
      title={"해당 정보가 맞는지\n확인해주세요"}
      description="잘못된 내용이 있다면 다시 선택하기를 눌러주세요"
      footer={
        <>
          <AppButton
            label="다시 선택하기"
            variant="secondary"
            onPress={() => router.dismissTo("/onboarding/mobility")}
          />
          <AppButton
            label="완료하기"
            variant="primary"
            disabled={busy}
            onPress={handleComplete}
          />
        </>
      }
    >
      <View style={styles.rows}>
        <AnswerRow
          label={
            usesWheelchair ? "휠체어를 사용해요" : "휠체어를 사용하지 않아요"
          }
          highlighted={usesWheelchair}
        />
        <AnswerRow
          label={usesWalker ? "보행기를 사용해요" : "보행기를 사용하지 않아요"}
          highlighted={usesWalker}
        />
        <AnswerRow
          label={usesCane ? "지팡이를 사용해요" : "지팡이를 사용하지 않아요"}
          highlighted={usesCane}
        />
        <AnswerRow
          label={stairsHard ? "계단 이용이 힘들어요" : "계단을 잘 이용해요"}
          highlighted={stairsHard}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  rows: { paddingTop: 44, gap: 10 },
  row: {
    height: 48,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.base,
    alignItems: "center",
    justifyContent: "center",
  },
  rowHighlighted: { backgroundColor: colors.accent },
});
