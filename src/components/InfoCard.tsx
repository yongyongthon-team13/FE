// src/components/InfoCard.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/constants/theme';

export type InfoItem = {
  label: string; // 예: "병원"
  value: string; // 예: "○○병원 (종합병원)"
};

export function InfoCard({ items }: { items: InfoItem[] }) {
  return (
    <View style={styles.card}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.row}
          accessible
          accessibilityLabel={`${item.label}, ${item.value}`}
        >
          <AppText variant="body" color={colors.textSub} style={styles.label}>
            {item.label}
          </AppText>
          <AppText variant="body" weight="semibold" style={styles.value}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  label: {
    width: 72,
  },
  value: {
    flex: 1,
  },
});