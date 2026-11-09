// src/app/onboarding/name.tsx
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { VoiceAnswer } from '@/components/VoiceAnswer';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { parseName } from '@/lib/parseSpeech';
import { onboarding } from '@/store/onboarding';

export default function NameScreen() {
  // 화면이 열리면 바로 듣기 시작, 마이크 버튼을 누르면 다시 듣기
  const voice = useSpeechToText();

  const handleDone = () => {
    voice.stop();
    const name = parseName(voice.transcript);
    if (name) onboarding.name = name; // 못 알아들었으면 가입 때 입력한 이름 유지
    router.push('/onboarding/birth-year');
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="1 / 4"
      title="어르신의 성함을 알려주세요"
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
