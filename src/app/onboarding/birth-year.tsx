// src/app/onboarding/birth-year.tsx
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { VoiceAnswer } from '@/components/VoiceAnswer';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { parseBirthYear } from '@/lib/parseSpeech';
import { onboarding } from '@/store/onboarding';

export default function BirthYearScreen() {
  // 화면이 열리면 바로 듣기 시작, 마이크 버튼을 누르면 다시 듣기
  const voice = useSpeechToText();

  const handleDone = () => {
    voice.stop();
    const year = parseBirthYear(voice.transcript);
    if (year) onboarding.birthYear = year; // 못 알아들었으면 다음 화면에서 직접 입력
    router.push('/onboarding/personal-confirm');
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="1 / 4"
      title="몇 년생이신가요?"
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
