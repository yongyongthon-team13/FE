import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ChoiceButton } from '@/components/ChoiceButton';
import { Icon } from '@/components/Icon';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors } from '@/constants/theme';
import { onboarding, type StairsAnswer } from '@/store/onboarding';

export default function StairsScreen() {
  const [selected, setSelected] = useState<StairsAnswer | null>(onboarding.stairs);

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="2 / 4"
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
      {/* 물음표 옆에 계단 아이콘을 두려고 제목을 직접 그림 */}
      <View style={styles.title}>
        <AppText variant="heading" weight="semibold" color={colors.heading}>
          평소에 계단을 오르내리는데
        </AppText>
        <View style={styles.titleRow}>
          <AppText variant="heading" weight="semibold" color={colors.heading}>
            어려움이 없으신가요?
          </AppText>
          <Icon name="stairs" size={32} color={colors.accent} />
        </View>
      </View>
      <View style={styles.options}>
        <ChoiceButton
          label="계단을 잘 이용해요"
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
  title: { marginTop: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  options: { paddingTop: 44, gap: 8 },
});