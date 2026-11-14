// app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { listenAlarmTap } from "@/lib/alarm";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
  });
  const ready = loaded || !!error; // 글꼴을 못 불러와도 앱은 시작

  useEffect(() => {
    if (error) console.error("글꼴 불러오기 실패", error);
    if (ready) SplashScreen.hideAsync();
  }, [ready, error]);

  // 출발 알림을 눌러 앱이 열리면 '오늘 병원 가는 날' 화면으로
  useEffect(() => {
    if (!ready) return;
    return listenAlarmTap();
  }, [ready]);

  if (!ready) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
