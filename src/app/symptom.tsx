import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { VoiceAnswer } from '@/components/VoiceAnswer';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { cleanText } from '@/lib/parseSpeech';

/** 병원 가기 → 진료과 추천: 아픈 곳을 말로 듣기 */
export default function SymptomScreen() {
  // 화면이 열리면 바로 듣기 시작
  const voice = useSpeechToText();

  const handleDone = () => {
    voice.stop();
    router.push({ pathname: '/visit-when', params: { symptom: cleanText(voice.transcript) } });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow="진료과 추천"
      title={'어디가\n불편하세요?'}
      footer={
        <View style={styles.footer}>
          <AppButton label="완료하기" variant="primary" onPress={handleDone} />
          <AppButton label="다시 말하기" variant="secondary" onPress={voice.start} />
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
