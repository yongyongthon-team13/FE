// src/app/companion-pickup.tsx
// 동행 기관과 통화 후: 들은 픽업 시간·장소를 말로 듣기
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";

import { parseDate, parseTime } from "@/api/appointments";
import { saveCompanionPickup } from "@/api/companion";
import { AppButton } from "@/components/AppButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { VoiceAnswer } from "@/components/VoiceAnswer";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cleanText } from "@/lib/parseSpeech";
import { useAppointments } from "@/store/appointments";

/** 말한 내용에서 장소 뽑기. 예: '8시 반에 아파트 정문 앞으로 온대요' → '아파트 정문 앞' (못 찾으면 '집 앞') */
function parsePlace(text: string): string {
  const m = text.match(/([가-힣0-9\s]{1,15}?(?:앞|입구|정문|정류장|주차장))/);
  if (!m) return "집 앞";
  // 시간 표현(오전/8시/반에 등)은 빼고 장소만 남기기
  return (
    m[1]
      .replace(/.*(?:\d+\s*시(?:\s*\d+\s*분)?(?:\s*반)?에?|오전|오후)\s*/, "")
      .trim() || "집 앞"
  );
}

export default function CompanionPickupScreen() {
  const { id, requestId } = useLocalSearchParams<{
    id: string;
    requestId: string;
  }>();
  const appointment = useAppointments().find((a) => a.id === id);
  // 화면이 열리면 바로 듣기 시작
  const voice = useSpeechToText();
  const [busy, setBusy] = useState(false);

  const goDone = () =>
    router.replace({ pathname: "/companion-done", params: { id } });

  const handleDone = async () => {
    voice.stop();
    const text = cleanText(voice.transcript);
    if (!text) return goDone(); // 아무 말도 없으면 저장 없이 결과 화면

    // 픽업 날짜 = 병원 가는 날, 시간·장소 = 말한 내용에서
    const date = appointment ? parseDate(appointment.date) : null;
    const hhmm = parseTime(text);
    setBusy(true);
    try {
      await saveCompanionPickup(id, requestId, {
        pickupPlace: parsePlace(text),
        ...(date && hhmm ? { pickupAt: `${date}T${hhmm}:00+09:00` } : {}),
      });
      goDone();
    } catch {
      const msg = "저장하지 못했어요. 잠시 후 다시 시도해 주세요";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("저장 실패", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow="동행 신청"
      title={"몇 시에, 어디로\n온다고 했나요?"}
      footer={
        <View style={styles.footer}>
          <AppButton
            label="완료하기"
            variant="primary"
            disabled={busy}
            onPress={handleDone}
          />
          <AppButton
            label="다시 말하기"
            variant="secondary"
            onPress={voice.start}
          />
        </View>
      }
    >
      <VoiceAnswer
        listening={voice.listening}
        transcript={voice.transcript}
        error={voice.error}
        onPressMic={voice.start}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10 },
});
