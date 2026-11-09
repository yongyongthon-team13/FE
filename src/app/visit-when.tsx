import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { VoiceAnswer } from '@/components/VoiceAnswer';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { cleanText } from '@/lib/parseSpeech';

/** 진료과 추천 2단계: 언제 갈지 말로 듣기 */
export default function VisitWhenScreen() {
  const { symptom } = useLocalSearchParams<{ symptom?: string }>();
  // 화면이 열리면 바로 듣기 시작
  const voice = useSpeechToText();

  const handleDone = () => {
    voice.stop();
    router.push({ pathname: '/symptom-select', params: { symptom: symptom ?? '', when: cleanText(voice.transcript) } });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      title={'언제\n가실 건가요?'}
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
