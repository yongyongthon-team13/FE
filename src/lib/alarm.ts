// src/lib/alarm.ts
// 병원 가는 날 출발 알림 (휴대폰 로컬 알림)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type AlarmOption = 'nightBefore' | 'hourBefore'; // 전날 저녁 / 출발 1시간 전

const NIGHT_BEFORE_HOUR = 19; // 전날 저녁 7시

/** '오전 8:45', '오후 2:30', '14:30' → { hour, minute } (24시간) */
function parseTime(label: string): { hour: number; minute: number } | null {
  const m = label.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  if (label.includes('오후') && hour < 12) hour += 12;
  if (label.includes('오전') && hour === 12) hour = 0;
  return { hour, minute };
}

/** 선택한 옵션에 맞춰 출발 알림 예약. 웹에서는 아무것도 하지 않음 */
export async function scheduleDepartureAlarm({
  appointmentDay,
  option,
  departAt,
}: {
  appointmentDay: Date;
  option: AlarmOption;
  departAt: string;
}): Promise<void> {
  if (Platform.OS === 'web') return;

  const time = parseTime(departAt);
  if (!time) return;

  const depart = new Date(appointmentDay);
  depart.setHours(time.hour, time.minute, 0, 0);

  const fireAt = new Date(depart);
  if (option === 'hourBefore') {
    fireAt.setHours(fireAt.getHours() - 1);
  } else {
    fireAt.setDate(fireAt.getDate() - 1);
    fireAt.setHours(NIGHT_BEFORE_HOUR, 0, 0, 0);
  }
  if (fireAt.getTime() <= Date.now()) return; // 이미 지난 시간이면 예약하지 않음

  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: option === 'hourBefore' ? '1시간 뒤에 출발해요' : '내일 병원 가는 날이에요',
      body: `${departAt}에 출발하시면 돼요`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}
