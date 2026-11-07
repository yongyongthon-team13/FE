export type WeatherAlertType = 'coldWave' | 'heatWave' | 'heavyRain' | 'heavySnow' | 'strongWind';

export type TodayWeather = {
  alert: WeatherAlertType | null; // 특보가 없으면 null
  alertLabel: string; // 예: '한파 주의보'
  summary: string; // 예: '오늘 아침 영하 13도' (특보 화면용)
  brief: string; // 예: '맑음 · 12도' (오늘 알림 화면 한 줄용)
};

// TODO: 날씨/기상특보 API 연동 (병원 일정 당일, 사용자 지역 기준)
export async function getTodayWeather(): Promise<TodayWeather> {
  await new Promise(r => setTimeout(r, 300));
  return { alert: 'coldWave', alertLabel: '한파 주의보', summary: '오늘 아침 영하 13도', brief: '맑음 · 영하 13도' };
}