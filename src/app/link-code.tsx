// src/app/link-code.tsx
// 어르신: 보호자 앱에 입력할 연결 번호 보여주기
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { requestLinkCode, type LinkCode } from "@/api/link";
import MascotHeart from "@/assets/images/mascot-heart.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, fontFamily, palette } from "@/constants/theme";

/** 남은 시간 'N분 M초' */
function remainText(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export default function LinkCodeScreen() {
  // 온보딩에서 왔으면 from=onboarding → '다음'으로 병원 문자 화면
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === "onboarding";

  const [linkCode, setLinkCode] = useState<LinkCode | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setFailed(false);
    setLinkCode(null);
    try {
      setLinkCode(await requestLinkCode());
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 남은 시간 1초마다 갱신
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainMs = linkCode ? new Date(linkCode.expiresAt).getTime() - now : 0;
  const expired = !!linkCode && remainMs <= 0;

  const handleNext = () => {
    if (fromOnboarding) router.replace("/onboarding/paste-guide");
    else router.back();
  };

  return (
    <ScreenLayout
      onBack={fromOnboarding ? undefined : () => router.back()}
      bodyPaddingTop={28}
      footer={
        <View style={styles.footer}>
          <AppButton label="새 번호 받기" variant="secondary" onPress={load} />
          <AppButton
            label={fromOnboarding ? "나중에 연결할게요" : "확인"}
            variant="primary"
            onPress={handleNext}
          />
        </View>
      }
    >
      <View style={styles.mascot}>
        <MascotHeart width={115} height={117} />
      </View>

      <View style={styles.header}>
        <AppText variant="body" color={colors.subtle}>
          보호자 연결
        </AppText>
        <AppText variant="heading" weight="semibold" color={colors.heading}>
          {"보호자 앱에\n이 번호를 입력해 주세요"}
        </AppText>
      </View>

      <View style={styles.codeBox}>
        {!linkCode && !failed && <ActivityIndicator color={colors.accent} />}

        {failed && (
          <AppText
            variant="body"
            color={palette.green300}
            style={styles.center}
          >
            {"번호를 받지 못했어요.\n새 번호 받기를 눌러 주세요"}
          </AppText>
        )}

        {linkCode && (
          <>
            <AppText
              style={[styles.code, expired && styles.codeExpired]}
              accessibilityLabel={`연결 번호 ${linkCode.code.split("").join(" ")}`}
            >
              {linkCode.code}
            </AppText>
            <AppText
              variant="body"
              color={expired ? palette.green200 : palette.green400}
              style={styles.center}
            >
              {expired
                ? "시간이 지났어요. 새 번호를 받아 주세요"
                : `${remainText(remainMs)} 동안 쓸 수 있어요`}
            </AppText>
          </>
        )}
      </View>

      <AppText variant="body" color={palette.green200} style={styles.notice}>
        {fromOnboarding
          ? "보호자가 번호를 입력하면\n병원 일정과 이동 알림을 함께 볼 수 있어요\n\n나중에 내 정보에서 다시 볼 수 있어요"
          : "보호자가 번호를 입력하면\n병원 일정과 이동 알림을 함께 볼 수 있어요"}
      </AppText>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: "center" },
  header: { marginTop: 14, gap: 14 },
  codeBox: {
    marginTop: 37,
    minHeight: 150,
    paddingVertical: 30,
    paddingHorizontal: 17,
    borderRadius: 22,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#213314",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  code: {
    fontFamily: fontFamily.bold,
    fontSize: 44,
    lineHeight: 54,
    letterSpacing: 8,
    color: palette.green700,
  },
  codeExpired: { color: palette.green200, textDecorationLine: "line-through" },
  center: { textAlign: "center" },
  notice: { marginTop: 14 },
  footer: { gap: 10 },
});
