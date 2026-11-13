// app/_layout.tsx
import { listenAlarmTap } from "@/lib/alarm";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
  });

  // 출발 알림을 눌러 앱이 열리면 '오늘 병원 가는 날' 화면으로
  useEffect(() => {
    if (!loaded) return;
    return listenAlarmTap();
  }, [loaded]);

  if (!loaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
