// src/components/VoiceAnswer.tsx
// 음성 질문 화면 공통 본문: 마이크 버튼 + 들은 내용 + 안내 문구
import { StyleSheet, Text, View } from 'react-native';

import { MicButton } from '@/components/MicButton';
import { fontFamily, palette } from '@/constants/theme';
import { SPEECH_ERROR_TEXT, type SpeechError } from '@/hooks/useSpeechToText';

type Props = {
  listening: boolean;
  transcript: string;
  error: SpeechError | null;
  onPressMic: () => void;
};

export function VoiceAnswer({ listening, transcript, error, onPressMic }: Props) {
  const guide = error
    ? SPEECH_ERROR_TEXT[error]
    : listening
      ? '듣고 있어요. 말씀해 주세요'
      : '버튼을 눌러주시면,\n다시 이야기 할 수 있어요';

  return (
    <View style={styles.micArea}>
      <MicButton active={listening} onPress={onPressMic} />
      {transcript ? <Text style={styles.transcript}>{transcript}</Text> : null}
      <Text style={styles.guide}>{guide}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  micArea: { alignItems: 'center', paddingTop: 56 },
  transcript: {
    marginTop: 26,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: palette.green600,
    textAlign: 'center',
  },
  guide: {
    marginTop: 18,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 28,
    color: palette.green400,
    textAlign: 'center',
  },
});
