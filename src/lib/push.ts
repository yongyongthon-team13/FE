// src/lib/push.ts
// 푸시 알림 토큰: 로그인하면 서버에 등록, 로그아웃하면 해제
// (APK에서만 동작. Expo Go·웹에서는 조용히 건너뜀)
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiData } from "@/lib/api";
import {
    clearPushToken,
    getPushToken,
    savePushToken,
} from "@/lib/tokenStorage";

/** 이 기기의 Expo 푸시 토큰 받기 (권한 없거나 지원 안 하면 null) */
async function getDeviceToken(): Promise<string | null> {
  if (Platform.OS === "web" || !Device.isDevice) return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "병원 일정 알림",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted")
    status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/** POST /api/v1/push-tokens (실패해도 앱 흐름은 계속) */
export async function registerPushToken(): Promise<void> {
  try {
    const token = await getDeviceToken();
    if (!token) return;
    await apiData("/api/v1/push-tokens", {
      method: "POST",
      body: JSON.stringify({
        token,
        platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
      }),
    });
    await savePushToken(token);
  } catch {
    // Expo Go 등 푸시를 지원하지 않는 환경
  }
}

/** DELETE /api/v1/push-tokens (로그아웃 전에 호출) */
export async function unregisterPushToken(): Promise<void> {
  const token = await getPushToken();
  if (!token) return;
  try {
    await apiData("/api/v1/push-tokens", {
      method: "DELETE",
      body: JSON.stringify({ token }),
    });
  } catch {
    // 서버 응답과 관계없이 기기에서는 지움
  } finally {
    await clearPushToken();
  }
}
