// src/app/onboarding/discomfort.tsx
import { router } from "expo-router";

import { toElderProfileRequest, updateElderProfile } from "@/api/elderProfile";
import { AppButton } from "@/components/AppButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { VoiceAnswer } from "@/components/VoiceAnswer";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cleanText } from "@/lib/parseSpeech";
import { getElderId } from "@/lib/tokenStorage";
import { onboarding } from "@/store/onboarding";

/** '없어요', '괜찮아요' 등이면 불편 없음 */
const hasDiscomfort = (text: string) => !/(없|아니|괜찮)/.test(text);

export default function DiscomfortScreen() {
  // 화면이 열리면 바로 듣기 시작, 마이크 버튼을 누르면 다시 듣기
  const voice = useSpeechToText();

  const handleDone = async () => {
    voice.stop();
    const text = cleanText(voice.transcript);
    onboarding.discomfort = text;
    // 프로필은 앞 화면에서 만들었으니 걷기 불편 여부만 추가로 저장 (실패해도 다음으로)
    const elderId = await getElderId();
    if (text && elderId) {
      updateElderProfile(elderId, {
        mobility: {
          ...toElderProfileRequest(onboarding).mobility,
          walkingDiscomfort: hasDiscomfort(text),
        },
      }).catch(() => {});
    }
    router.push({ pathname: "/home-location", params: { from: "onboarding" } });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="3 / 4"
      title="걸으실 때 불편함은 없으세요?"
      footer={
        <AppButton label="완료하기" variant="primary" onPress={handleDone} />
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
