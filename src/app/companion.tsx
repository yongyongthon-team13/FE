import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import {
  getCompanionAssessment,
  type CompanionAssessment,
} from "@/api/companion";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette, radius, shadow } from "@/constants/theme";
import { useAppointments } from "@/store/appointments";

export default function CompanionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointments().find((a) => a.id === id);
  const [assessment, setAssessment] = useState<CompanionAssessment | null>(
    null,
  );

  useEffect(() => {
    getCompanionAssessment(id).then(setAssessment);
  }, [id]);

  if (!assessment) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScreenLayout
      bodyPaddingTop={28}
      footer={
        <>
          <AppButton
            label="혼자 갈 수 있어요"
            variant="secondary"
            onPress={() => router.replace("/home")}
          />
          <AppButton
            label="신청하기"
            variant="primary"
            onPress={() =>
              router.push({ pathname: "/companion-request", params: { id } })
            }
          />
        </>
      }
    >
      <View style={styles.mascot}>
        <MascotWave width={140} height={140} />
      </View>

      <View style={styles.header}>
        {appointment && (
          <AppText variant="body" color={palette.green200}>
            {`${appointment.date} ${appointment.time} ${appointment.hospital} 예약`}
          </AppText>
        )}
        <AppText variant="heading" weight="semibold" color={palette.green600}>
          {"안전한 이동을 위해\n동행서비스를 추천드려요"}
        </AppText>
      </View>

      <View style={styles.reasonBox}>
        <AppText variant="body" color={colors.subtle}>
          {assessment.reason}
        </AppText>
      </View>

      <View style={styles.serviceCard}>
        <AppText variant="body" weight="bold" color={colors.textOnPrimary}>
          {assessment.serviceName}
        </AppText>
        <AppText variant="body" color={colors.textOnPrimary}>
          {`예상 비용: ${assessment.estimatedCost}`}
        </AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: {
    alignItems: "center",
  },
  header: {
    marginTop: 10,
    gap: 6,
  },
  reasonBox: {
    marginTop: 37,
    minHeight: 83,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: "center",
    ...shadow.card,
  },
  serviceCard: {
    marginTop: 31,
    minHeight: 118,
    backgroundColor: colors.accent,
    borderRadius: radius.base,
    paddingHorizontal: 17,
    paddingVertical: 24,
    justifyContent: "center",
    gap: 11,
  },
});
