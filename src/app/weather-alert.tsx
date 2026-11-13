import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  getTodayWeather,
  type TodayWeather,
  type WeatherAlertType,
} from "@/api/weather";
import MascotWorried from "@/assets/images/mascot-worried.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Icon, type IconName } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette } from "@/constants/theme";

const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
const HEADLINE = "오늘은 차로 이동하시는 것을\n추천드립니다";

// 특보 종류별 아이콘·안내 문구 (특보 이름·기온은 API 값 그대로 사용)
const ALERT_COPY: Record<WeatherAlertType, { icon: IconName; reason: string }> =
  {
    coldWave: {
      icon: "snowAlert",
      reason: "밖에서 오래 기다리지 않도록\n집 앞까지 오는 차를 추천해요",
    },
    heatWave: {
      icon: "heatAlert",
      reason: "더운 날 오래 걷지 않도록\n집 앞까지 오는 차를 추천해요",
    },
    heavyRain: {
      icon: "rainAlert",
      reason: "비에 젖거나 미끄러지지 않도록\n집 앞까지 오는 차를 추천해요",
    },
    heavySnow: {
      icon: "heavySnowAlert",
      reason: "눈길에 미끄러지지 않도록\n집 앞까지 오는 차를 추천해요",
    },
    strongWind: {
      icon: "windAlert",
      reason:
        "바람이 세게 불어 걷기 위험하지 않도록\n집 앞까지 오는 차를 추천해요",
    },
  };
export default function WeatherAlertScreen() {
  const [weather, setWeather] = useState<TodayWeather | null>(null);

  useEffect(() => {
    getTodayWeather().then(setWeather);
  }, []);

  const copy = weather?.alert ? ALERT_COPY[weather.alert] : null;

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={49}
      footer={
        <>
          <AppButton
            label="버스 이용하기"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: "/route-preview",
                params: appointmentId ? { id: appointmentId } : {},
              })
            }
          />
          <AppButton
            label="차 부르기"
            variant="primary"
            onPress={() =>
              router.push({
                pathname: "/car-select",
                params: appointmentId ? { appointmentId } : {},
              })
            }
          />
        </>
      }
    >
      <View style={styles.mascot}>
        <MascotWorried width={94} height={102} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          {copy && (
            <Icon name={copy.icon} size={60} color={colors.textOnPrimary} />
          )}
          <AppText
            variant="button"
            weight="medium"
            color={colors.textOnPrimary}
            style={styles.flex}
          >
            {weather?.alertLabel ?? " "}
          </AppText>
        </View>
        <AppText variant="body" weight="bold" color={colors.textOnPrimary}>
          {weather?.summary ?? " "}
        </AppText>
      </View>

      <AppText
        variant="body"
        weight="bold"
        color={colors.accent}
        style={styles.headline}
      >
        {HEADLINE}
      </AppText>
      <AppText
        variant="button"
        weight="medium"
        color={palette.green300}
        style={styles.reason}
      >
        {copy?.reason ?? " "}
      </AppText>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: "center" },
  card: {
    marginTop: 19,
    minHeight: 157,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingTop: 26,
    paddingBottom: 22,
    justifyContent: "space-between",
    gap: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  flex: { flex: 1, minWidth: 0 },
  headline: { marginTop: 32, lineHeight: 32 },
  reason: { marginTop: 6, lineHeight: 28 },
});
