import { markCompanionCalled } from "@/api/companion";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppText } from "@/components/AppText";
import {
  colors,
  fontFamily,
  fontSize,
  palette,
  radius,
} from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Params = {
  visit: string;
  hospital: string;
  departure: string;
  vehicle: string;
  mobilityAid: string;
  phone: string;
  id: string;
  requestId: string;
};

export default function CompanionCallScreen() {
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<Params>();
  const [calling, setCalling] = useState(false);

  const script = `“병원 동행 신청하고자\n전화드렸습니다.\n${p.visit}\n${p.hospital}입니다.`;
  const detail =
    p.vehicle === "필요"
      ? `${p.departure}에서 출발하고,\n${p.mobilityAid}를 써서 차가 필요해요”`
      : `${p.departure}에서 출발해요”`;

  const startCall = () => {
    if (!p.phone) return;
    Linking.openURL(`tel:${p.phone}`);
    setCalling(true);
  };

  const endCall = async () => {
    try {
      if (p.requestId) await markCompanionCalled(p.id, p.requestId);
    } catch {
      // 상태 저장 실패해도 결과 화면으로는 이동
    }
    router.replace({
      pathname: "/companion-pickup",
      params: { id: p.id, requestId: p.requestId },
    });
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 102, paddingBottom: insets.bottom + 58 },
      ]}
    >
      <View>
        <View style={styles.mascot}>
          <MascotWave width={101} height={101} />
        </View>

        <View style={styles.card}>
          <AppText variant="body" color={colors.subtle}>
            이렇게 말씀하세요
          </AppText>
          <AppText
            variant="heading"
            weight="semibold"
            color={palette.green600}
            style={[styles.script, styles.scriptGap]}
          >
            {script}
          </AppText>
          <AppText
            variant="heading"
            weight="semibold"
            color={palette.green400}
            style={[styles.script, styles.detailGap]}
          >
            {detail}
          </AppText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.whiteButton,
          pressed && styles.whiteButtonPressed,
        ]}
        onPress={calling ? endCall : startCall}
        disabled={!calling && !p.phone}
        hitSlop={{ top: 8, bottom: 8 }}
        accessibilityRole="button"
        accessibilityState={{ disabled: !calling && !p.phone }}
      >
        <AppText style={styles.whiteButtonText}>
          {calling ? "통화 종료" : "통화 시작하기"}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingHorizontal: 27,
    justifyContent: "space-between",
  },
  mascot: {
    alignItems: "center",
    marginBottom: -12,
    zIndex: 1,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: 24,
    paddingHorizontal: 21,
    paddingTop: 25,
    paddingBottom: 26,
    shadowColor: "#1A2E0F",
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  script: { lineHeight: 35 },
  scriptGap: { marginTop: 12 },
  detailGap: { marginTop: 9 },
  whiteButton: {
    height: 50,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  whiteButtonPressed: { backgroundColor: palette.green200 },
  whiteButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.button,
    color: colors.accent,
  },
});
