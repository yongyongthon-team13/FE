import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type AlarmOption = 'nightBefore' | 'hourBefore';

// 앱이 켜져 있을 때도 알림이 보이도록
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '병원 일정 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/** 병원 가는 날 기준으로 알림 시각 계산: 전날 20:00 / 당일 06:00 */
function triggerDate(appointmentDay: Date, option: AlarmOption) {
  const d = new Date(appointmentDay);
  if (option === 'nightBefore') {
    d.setDate(d.getDate() - 1);
    d.setHours(20, 0, 0, 0);
  } else {
    d.setHours(6, 0, 0, 0);
  }
  return d;
}

export async function scheduleDepartureAlarm(params: {
  appointmentDay: Date;
  option: AlarmOption;
  departAt: string;
}) {
  if (Platform.OS === 'web') return null;
  if (!(await ensurePermission())) return null;

  const date = triggerDate(params.appointmentDay, params.option);
  if (date.getTime() <= Date.now()) return null; // 이미 지난 시간이면 예약 안 함

  return Notifications.scheduleNotificationAsync({
    content: {
      title: params.option === 'nightBefore' ? '내일 병원 가는 날이에요' : '오늘 병원 가는 날이에요',
      body: `${params.departAt}에 출발하시면 돼요`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}