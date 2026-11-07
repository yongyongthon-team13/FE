// src/app/onboarding/discomfort.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { MicButton } from '@/components/MicButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { fontFamily, palette } from '@/constants/theme';

export default function DiscomfortScreen() {
  // TODO: 음성 인식 연동 시 listening 상태 사용
  const [listening, setListening] = useState(true);

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="3 / 4"
      title="걸으실 때 불편함은 없으세요?"
      footer={
        <AppButton label="완료하기" variant="primary" onPress={() => router.push('/onboarding/guardian')} />
      }
    >
      <View style={styles.micArea}>
        <MicButton active={listening} onPress={() => setListening(true)} />
        <Text style={styles.guide}>{'버튼을 눌러주시면,\n다시 이야기 할 수 있어요'}</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  micArea: {
    alignItems: 'center',
    paddingTop: 56,
  },
  guide: {
    marginTop: 26,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 28,
    color: palette.green400,
    textAlign: 'center',
  },
});