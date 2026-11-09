import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ChoiceButton } from '@/components/ChoiceButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { onboarding, type StairsAnswer } from '@/store/onboarding';

export default function StairsScreen() {
  const [selected, setSelected] = useState<StairsAnswer | null>(onboarding.stairs);

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="2 / 4"
      title={'평소에 계단을 오르내리는데\n어려움이 없으신가요?'}
      footer={
        <AppButton
          label="다음"
          variant="primary"
          disabled={!selected}
          onPress={() => {
            onboarding.stairs = selected;
            router.push('/onboarding/discomfort');
          }}
        />
      }
    >
      <View style={styles.options}>
        <ChoiceButton
          label="계단을 잘 이용해요"
          icon="stairs"
          iconPosition="right"
          selected={selected === 'ok'}
          onPress={() => setSelected('ok')}
        />
        <ChoiceButton
          label="계단 이용이 힘들어요"
          selected={selected === 'hard'}
          onPress={() => setSelected('hard')}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  options: { paddingTop: 44, gap: 8 },
});