// src/app/onboarding/discomfort.tsx
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { VoiceAnswer } from '@/components/VoiceAnswer';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { cleanText } from '@/lib/parseSpeech';
import { onboarding } from '@/store/onboarding';

export default function DiscomfortScreen() {
  // 화면이 열리면 바로 듣기 시작, 마이크 버튼을 누르면 다시 듣기
  const voice = useSpeechToText();

  const handleDone = () => {
    voice.stop();
    onboarding.discomfort = cleanText(voice.transcript);
    router.push('/onboarding/guardian');
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="3 / 4"
      title="걸으실 때 불편함은 없으세요?"
      footer={<AppButton label="완료하기" variant="primary" onPress={handleDone} />}
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
