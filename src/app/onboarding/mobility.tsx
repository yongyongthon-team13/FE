// src/app/onboarding/mobility.tsx
import { AppButton } from '@/components/AppButton';
import { ChoiceButton } from '@/components/ChoiceButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { onboarding, type Aid } from '@/store/onboarding';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function MobilityScreen() {
  const [selected, setSelected] = useState<Aid[]>(onboarding.aids);

  const toggle = (aid: Aid) => {
    setSelected(prev => {
      // 이미 선택된 것 → 해제
      if (prev.includes(aid)) return prev.filter(a => a !== aid);
      // "아무것도" 선택 → 나머지 해제
      if (aid === 'none') return ['none'];
      // 휠체어·보행기·지팡이 선택 → "아무것도" 해제
      return [...prev.filter(a => a !== 'none'), aid];
    });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      bodyPaddingTop={40}
      eyebrow="2 / 4"
      title={'걸으실 때 무엇을\n사용하시나요?'}
      footer={
        <AppButton
          label="다음"
          variant="primary"
          disabled={selected.length === 0}
          onPress={() => {
            onboarding.aids = selected;
            router.push('/onboarding/stairs');
          }}
        />
      }
    >
      <View style={styles.options}>
        <ChoiceButton
          label="휠체어를 사용해요"
          icon="wheelchair"
          iconSize={30}
          selected={selected.includes('wheelchair')}
          onPress={() => toggle('wheelchair')}
        />
        <ChoiceButton
          label="보행기를 사용해요"
          icon="walker"
          iconSize={40}
          selected={selected.includes('walker')}
          onPress={() => toggle('walker')}
        />
        <ChoiceButton
          label="지팡이를 사용해요"
          icon="cane"
          iconSize={40}
          selected={selected.includes('cane')}
          onPress={() => toggle('cane')}
        />
        <ChoiceButton
          label="아무것도 사용하지 않아요"
          selected={selected.includes('none')}
          onPress={() => toggle('none')}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  options: { paddingTop: 38, gap: 8 },
});