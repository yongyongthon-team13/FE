// src/api/weather.ts
// 날씨 위험도: GET /api/v1/weather-risk (AI 아님, 서버 규칙)
import { apiRequest } from "@/lib/api";
import { getHomePoint } from "./homeLocation";

export type WeatherAlertType =
  | "coldWave"
  | "heatWave"
  | "heavyRain"
  | "heavySnow"
  | "strongWind";

export type TodayWeather = {
  alert: WeatherAlertType | null; // 위험 날씨가 없으면 null
  alertLabel: string; // 예: '한파 주의'
  summary: string; // 예: '기온 영하 13도 · 비 올 확률 10%' (특보 화면용)
  brief: string; // 예: '영하 13도' (오늘 알림 화면 한 줄용)
  recommendCar: boolean; // 서버가 차 이동을 추천하는지
};

type WeatherRiskResponse = {
  riskLevel: "NORMAL" | "CAUTION" | "WARNING";
  recommendCar: boolean;
  hazardCodes: (
    | "RAIN"
    | "SNOW"
    | "HEAVY_RAIN"
    | "HEAVY_SNOW"
    | "STRONG_WIND"
    | "HEAT"
    | "COLD"
  )[];
  warnings: string[];
  temperatureC: number | null;
  precipitationProbability: number | null;
};

// 서버 위험 코드 → 화면 아이콘·문구 종류 (앞에 있을수록 우선)
const HAZARD_TO_ALERT: [string, WeatherAlertType, string][] = [
  ["COLD", "coldWave", "한파"],
  ["HEAT", "heatWave", "폭염"],
  ["HEAVY_SNOW", "heavySnow", "대설"],
  ["SNOW", "heavySnow", "눈"],
  ["HEAVY_RAIN", "heavyRain", "호우"],
  ["RAIN", "heavyRain", "비"],
  ["STRONG_WIND", "strongWind", "강풍"],
];

const tempText = (t: number | null) =>
  t == null ? "" : t < 0 ? `영하 ${-t}도` : `${t}도`;

/** forDate: 병원 가는 시각 (기본: 지금) */
export async function getTodayWeather(
  forDate: Date = new Date(),
): Promise<TodayWeather> {
  const home = await getHomePoint(); // 등록한 집 위치 (없으면 처인구청)
  const params = new URLSearchParams({
    latitude: String(home.latitude),
    longitude: String(home.longitude),
    for: forDate.toISOString(),
  });
  const res = await apiRequest<WeatherRiskResponse>(
    `/api/v1/weather-risk?${params.toString()}`,
  );

  const hit =
    res.riskLevel === "NORMAL"
      ? undefined
      : HAZARD_TO_ALERT.find(([code]) =>
          res.hazardCodes?.includes(code as never),
        );
  const level = res.riskLevel === "WARNING" ? "경보" : "주의";
  const temp = tempText(res.temperatureC);
  const rain =
    res.precipitationProbability != null
      ? `비 올 확률 ${res.precipitationProbability}%`
      : "";

  return {
    alert: hit ? hit[1] : null,
    alertLabel:
      res.warnings?.[0] ?? (hit ? `${hit[2]} ${level}` : "날씨 괜찮음"),
    summary: [temp && `기온 ${temp}`, rain].filter(Boolean).join(" · "),
    brief: temp || "날씨 확인",
    recommendCar: res.recommendCar,
  };
}
