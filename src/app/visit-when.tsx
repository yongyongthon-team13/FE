import { recommendDepartment } from "@/api/department";
import { AppButton } from "@/components/AppButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { VoiceAnswer } from "@/components/VoiceAnswer";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cleanText } from "@/lib/parseSpeech";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

/** 진료과 추천 2단계: 언제 갈지 말로 듣기 */
export default function VisitWhenScreen() {
  const { symptom } = useLocalSearchParams<{ symptom?: string }>();
  // 화면이 열리면 바로 듣기 시작
  const voice = useSpeechToText();

  const [busy, setBusy] = useState(false);

  const handleDone = async () => {
    voice.stop();
    const when = cleanText(voice.transcript);
    const text = symptom ?? "";
    const toButtons = () =>
      router.push({
        pathname: "/symptom-select",
        params: { symptom: text, when },
      });

    // 말한 내용이 없으면 서버 호출 없이 버튼 화면
    if (!text) return toButtons();

    setBusy(true);
    try {
      const result = await recommendDepartment(text);
      if (result.emergency) {
        router.push({
          pathname: "/emergency",
          params: { label: result.bodyPart ?? text },
        });
      } else if (result.department) {
        router.push({
          pathname: "/department",
          params: {
            area: result.bodyPart ?? text,
            department: result.department,
            symptom: text,
            when,
          },
        });
      } else {
        toButtons();
      }
    } catch {
      toButtons(); // 서버 실패(503 등)도 버튼 화면으로
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      title={"언제\n가실 건가요?"}
      footer={
        <View style={styles.footer}>
          <AppButton
            label="완료하기"
            variant="primary"
            onPress={handleDone}
            disabled={busy}
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
