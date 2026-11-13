import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";

export type AlarmOption = "nightBefore" | "hourBefore";

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
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "병원 일정 알림",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

/** 알림 시각: 전날 저녁 8시 / 출발 1시간 전 */
function triggerDate(departDate: Date, option: AlarmOption) {
  if (option === "hourBefore")
    return new Date(departDate.getTime() - 60 * 60 * 1000);
  const d = new Date(departDate);
  d.setDate(d.getDate() - 1);
  d.setHours(20, 0, 0, 0);
  return d;
}

/** 알림을 눌렀을 때 넘겨받는 값 */
type AlarmData = {
  screen?: "today-alarm";
  appointmentId?: string;
  time?: string;
  hospital?: string;
};

export async function scheduleDepartureAlarm(params: {
  appointmentId: string;
  option: AlarmOption;
  departDate: Date; // 출발 시각
  departAt: string; // 화면용 출발 시각, 예: '오전 8:45'
  hospital: string;
  appointmentTime: string; // 진료 시각, 예: '오전 10:00'
}) {
  if (Platform.OS === "web") return null;
  if (!(await ensurePermission())) return null;

  const date = triggerDate(params.departDate, params.option);
  if (date.getTime() <= Date.now()) return null; // 이미 지난 시간이면 예약 안 함

  const data: AlarmData = {
    // 출발 1시간 전 알림을 누르면 '오늘 병원 가는 날' 화면으로 (전날 알림은 앱만 열림)
    ...(params.option === "hourBefore"
      ? { screen: "today-alarm" as const }
      : {}),
    appointmentId: params.appointmentId,
    time: params.appointmentTime,
    hospital: params.hospital,
  };

  return Notifications.scheduleNotificationAsync({
    content: {
      title:
        params.option === "nightBefore"
          ? "내일 병원 가는 날이에요"
          : "오늘 병원 가는 날이에요",
      body: `${params.departAt}에 출발하시면 돼요`,
      data,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

/** 알림을 눌러 앱이 열리면 해당 화면으로 (앱 꺼져 있을 때 + 켜져 있을 때). 반환값은 해제 함수 */
export function listenAlarmTap(): () => void {
  if (Platform.OS === "web") return () => {};
  const open = (res: Notifications.NotificationResponse | null) => {
    const data = res?.notification.request.content.data as
      | AlarmData
      | undefined;
    if (data?.screen !== "today-alarm") return;
    Notifications.clearLastNotificationResponse(); // 다음에 앱 열 때 또 뜨지 않게
    router.push({
      pathname: "/today-alarm",
      params: {
        appointmentId: data.appointmentId ?? "",
        time: data.time ?? "",
        hospital: data.hospital ?? "",
      },
    });
  };
  open(Notifications.getLastNotificationResponse());
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
