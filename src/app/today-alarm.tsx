import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTodayWeather, type TodayWeather } from "@/api/weather";
import MascotClock from "@/assets/images/mascot-clock.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { colors, palette } from "@/constants/theme";

export default function TodayAlarmScreen() {
  const insets = useSafeAreaInsets();
  // 출발 알림을 누르면 알림 data(appointmentId, time, hospital)로 열림
  const {
    appointmentId,
    time = "오전 10:00",
    hospital = "OO병원",
  } = useLocalSearchParams<{
    appointmentId?: string;
    time?: string;
    hospital?: string;
  }>();
  const [weather, setWeather] = useState<TodayWeather | null>(null);

  useEffect(() => {
    getTodayWeather()
      .then(setWeather)
      .catch(() =>
        setWeather({
          alert: null,
          alertLabel: "날씨 괜찮음",
          summary: "",
          brief: "날씨 확인 안 됨",
          recommendCar: false,
        }),
      );
  }, []);

  const handleConfirm = () => {
    const params = appointmentId ? { appointmentId } : {};
    router.replace({
      pathname: weather?.alert ? "/weather-alert" : "/today-condition",
      params,
    });
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 60 },
      ]}
    >
      <MascotClock width={127} height={138} style={styles.mascot} />

      <View style={styles.card}>
        <AppText
          variant="heading"
          weight="bold"
          color={palette.green600}
          style={styles.center}
        >
          오늘 병원 가는 날이에요
        </AppText>
        <AppText
          variant="body"
          weight="semibold"
          color={palette.green400}
          style={styles.center}
        >
          {`${time} ${hospital}`}
        </AppText>
        <AppText
          variant="caption"
          weight="medium"
          color={palette.green300}
          style={styles.center}
        >
          {weather ? `오늘 날씨 · ${weather.brief}` : " "}
        </AppText>
        <View style={styles.button}>
          <AppButton
            label="확인"
            variant="primary"
            disabled={!weather}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mascot: { marginBottom: -11, zIndex: 1 },
  card: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: "#1A2E0F",
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  center: { textAlign: "center" },
  button: { marginTop: 14 },
});
