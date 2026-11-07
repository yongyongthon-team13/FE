import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, radius } from '@/constants/theme';
import { onboarding } from '@/store/onboarding';

function AnswerRow({ label, highlighted }: { label: string; highlighted: boolean }) {
  return (
    <View style={[styles.row, highlighted && styles.rowHighlighted]}>
      <AppText variant="button" weight="semibold" color={highlighted ? colors.textOnPrimary : colors.accent}>
        {label}
      </AppText>
    </View>
  );
}

export default function MobilityConfirmScreen() {
  const usesWheelchair = onboarding.aids.includes('wheelchair');
  const usesCane = onboarding.aids.includes('cane');
  const stairsHard = onboarding.stairs === 'hard';

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="2/4"
      title={'해당 정보가 맞는지\n확인해주세요'}
      description="잘못된 내용이 있다면 다시 선택하기를 눌러주세요"
      footer={
        <>
          <AppButton
            label="다시 선택하기"
            variant="secondary"
            onPress={() => router.dismissTo('/onboarding/mobility')}
          />
          <AppButton
            label="완료하기"
            variant="primary"
            onPress={() => router.push('/onboarding/discomfort')}
          />
        </>
      }
    >
      <View style={styles.rows}>
        <AnswerRow
          label={usesWheelchair ? '휠체어를 사용해요' : '휠체어를 사용하지 않아요'}
          highlighted={usesWheelchair}
        />
        <AnswerRow
          label={usesCane ? '지팡이·보행기를 사용해요' : '지팡이·보행기를 사용하지 않아요'}
          highlighted={usesCane}
        />
        <AnswerRow
          label={stairsHard ? '계단 이용이 힘들어요' : '계단을 잘 이용해요'}
          highlighted={stairsHard}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  rows: { paddingTop: 44, gap: 10 },
  row: {
    height: 48,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHighlighted: { backgroundColor: colors.accent },
});