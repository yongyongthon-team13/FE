// src/app/onboarding/appointment-confirm.tsx
import { saveAppointment, type AppointmentDraft } from "@/api/appointments";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, fontFamily, palette } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";

const ROWS: { key: keyof AppointmentDraft; label: string }[] = [
  { key: "hospital", label: "병원" },
  { key: "date", label: "날짜" },
  { key: "time", label: "시간" },
  { key: "department", label: "진료과" },
  { key: "scale", label: "규모" },
];

export default function AppointmentConfirmScreen() {
  const draft = useLocalSearchParams<AppointmentDraft>();

  const handleComplete = async () => {
    try {
      const id = await saveAppointment(draft);
      router.replace({ pathname: "/companion", params: { id } });
    } catch {
      const msg = "일정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("저장 실패", msg);
    }
  };

  return (
    <ScreenLayout
      bodyPaddingTop={28}
      footer={
        <AppButton
          label="완료하기"
          variant="primary"
          onPress={handleComplete}
        />
      }
    >
      <View style={styles.mascot}>
        <MascotWave width={124} height={124} />
      </View>

      <View style={styles.header}>
        <AppText variant="body" color={colors.subtle}>
          병원 일정 등록
        </AppText>
        <AppText variant="heading" weight="semibold" color={colors.heading}>
          해당 일정이 맞나요?
        </AppText>
      </View>

      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/onboarding/appointment-edit",
            params: { ...draft, mode: "edit" },
          })
        }
        accessibilityRole="button"
        accessibilityLabel="일정 수정하기"
      >
        {ROWS.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <AppText style={styles.label}>{label}</AppText>
            <AppText style={styles.value} numberOfLines={1}>
              {draft[key]}
            </AppText>
          </View>
        ))}
      </Pressable>

      <AppText style={styles.hint}>
        {"잘못된 정보가 있다면\n눌러서 고쳐주세요"}
      </AppText>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: {
    alignItems: "center",
  },
  header: {
    marginTop: 14,
    gap: 14,
  },
  card: {
    marginTop: 37,
    paddingVertical: 30,
    paddingHorizontal: 17,
    borderRadius: 22,
    backgroundColor: colors.bg,
    gap: 11,
    shadowColor: "#213314",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 64,
    flexShrink: 0,
    fontFamily: fontFamily.regular,
    fontSize: 18,
    color: palette.green300,
  },
  value: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: palette.green700,
  },
  hint: {
    marginTop: 11,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 28,
    color: colors.disabled,
  },
});
