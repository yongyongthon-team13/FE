import { getRoutePlan, type RouteStep } from '@/api/routes';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [steps, setSteps] = useState<RouteStep[]>([]);

  useEffect(() => {
    getRoutePlan(id).then(plan => setSteps(plan?.steps ?? []));
  }, [id]);

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={26}
      footer={
        <AppButton
          label="어떤 길인지 확인했어요"
          variant="primary"
          onPress={() => router.dismissTo('/home')}
        />
      }
    >
      <AppText variant="heading" weight="semibold" color={palette.green600}>가는 길 미리 보기</AppText>

      {/* TODO: 미리보기 지도 */}
      <View style={styles.map} />

      <View style={styles.list}>
        {steps.map((step, i) => (
          <StepCard key={i} index={i + 1} step={step} />
        ))}
      </View>
    </ScreenLayout>
  );
}

function StepCard({ index, step }: { index: number; step: RouteStep }) {
  const filled = step.type === 'walk';
  const titleColor = filled ? colors.textOnPrimary : palette.green600;

  return (
    <View style={[styles.card, filled && styles.cardFilled]}>
      <View style={styles.titleRow}>
        <View style={[styles.badge, { borderColor: titleColor }]}>
          <AppText variant="small" weight="bold" color={titleColor} style={styles.badgeText}>
            {String(index)}
          </AppText>
        </View>
        <AppText variant="body" weight="bold" color={titleColor} style={styles.titleText}>
          {step.title}
        </AppText>
      </View>
      <AppText variant="button" color={filled ? colors.textOnPrimary : palette.green300}>
        {step.summary}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: 267,
    maxWidth: '100%',
    height: 170,
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: '#D9D9D9',
  },
  list: { marginTop: 21, gap: 21 },
  card: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 22,
    paddingHorizontal: 11,
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardFilled: {
    backgroundColor: palette.green400,
    borderColor: palette.green600,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleText: { flexShrink: 1 },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, lineHeight: 13 },
});