// src/components/guide/WalkStepView.tsx
import { StyleSheet, View } from 'react-native';

import type { WalkStep } from '@/api/guide';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { Icon, type IconName } from '@/components/Icon';
import { MapPreview } from './MapPreview';

const DIRECTION_TEXT = { straight: '앞으로', left: '왼쪽으로', right: '오른쪽으로' } as const;

const DIRECTION_ICON: Record<WalkStep['direction'], IconName> = {
  straight: 'arrowUp',
  left: 'arrowLeft',
  right: 'arrowRight',
};

export function WalkStepView({ step }: { step: WalkStep }) {
  return (
    <>
      <AppText variant="heading" weight="bold" color={colors.accent} style={styles.title}>
        {step.title}
      </AppText>

      <View style={styles.card}>
        <Icon name={DIRECTION_ICON[step.direction]} size={70} color={colors.accent} />
        <AppText variant="heading" weight="bold" color={palette.green600} style={styles.center}>
            {step.direction === 'straight'
            ? `${step.distanceM}m 앞으로`
            : `${DIRECTION_TEXT[step.direction]} ${step.distanceM}m`}
        </AppText>
        <AppText variant="button" weight="medium" color={palette.green600} style={styles.center}>
          {step.instruction}
        </AppText>
        <AppText variant="caption" weight="medium" color={palette.green300} style={styles.center}>
          {`도착까지 ${step.remainingM}m · ${step.remainingMin}분`}
        </AppText>
      </View>

      <View style={styles.map}>
        <MapPreview />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center' },
  card: {
    marginTop: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  center: { textAlign: 'center' },
  map: { marginTop: 20 },
});