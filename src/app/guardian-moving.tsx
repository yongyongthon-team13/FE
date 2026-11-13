// src/app/guardian-moving.tsx
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { recordGuardianContact } from "@/api/guardianData";
import { getGuardianMoving, type GuardianMoving } from "@/api/guardianMoving";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ElderMapPreview } from "@/components/guardian/ElderMapPreview";
import { HelpInfoCard } from "@/components/guardian/HelpInfoCard";
import { Icon } from "@/components/Icon";
import { colors, palette } from "@/constants/theme";
import { callPhone } from "@/lib/call";

/** 보호자: 어르신이 이동 중일 때 뜨는 화면 */
export default function GuardianMovingScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianMoving | null>(null);

  useEffect(() => {
    getGuardianMoving().then(setData);
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.mascot}>
          <MascotWave width={140} height={140} />
        </View>

        <AppText
          variant="body"
          color={palette.green200}
          style={styles.departed}
        >
          {`${data.departedAt} 출발`}
        </AppText>
        <View style={styles.titleRow}>
          <AppText
            variant="heading"
            weight="semibold"
            color={palette.green600}
            style={styles.title}
          >
            {`${data.elderName}가 이동 중이에요`}
          </AppText>
          <Icon name="walk" size={30} color={colors.accent} />
        </View>
        <ElderMapPreview
          elderName={data.elderName}
          elder={data.elderLocation}
          hospital={data.hospitalLocation}
          height={220}
          interactive
        />
        <View style={styles.card}>
          <HelpInfoCard rows={data.rows} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton
          label={`${data.elderName}께 전화하기`}
          variant="primary"
          onPress={() => {
            if (callPhone(data.elderPhone, data.elderName) && data.tripId) {
              recordGuardianContact(data.tripId, "CALL").catch(() => {});
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 44, paddingBottom: 24 },
  mascot: { alignItems: "center" },
  departed: { marginTop: 26 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  title: { flexShrink: 1 },
  card: { marginTop: 40 },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});
