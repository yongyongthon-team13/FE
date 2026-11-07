// src/components/GuideCard.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, radius, spacing } from '@/constants/theme';

type Direction = 'up' | 'left' | 'right' | 'down';

const arrowIcon = {
  up: 'arrowUp',
  left: 'arrowLeft',
  right: 'arrowRight',
  down: 'arrowDown',
} as const;

export function GuideCard({
  direction,
  instruction,
  hint,
}: {
  direction: Direction;   // 화살표 방향
  instruction: string;    // 예: "120m 앞으로"
  hint?: string;          // 예: "편의점이 보이면 왼쪽"
}) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={hint ? `${instruction}. ${hint}` : instruction}
    >
      <Icon name={arrowIcon[direction]} size={80} color={colors.primary} />
      <AppText variant="title" weight="bold" style={styles.center}>
        {instruction}
      </AppText>
      {hint && (
        <AppText variant="body" color={colors.textSub} style={styles.center}>
          {hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  center: {
    textAlign: 'center',
  },
});