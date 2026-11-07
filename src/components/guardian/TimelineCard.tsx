// src/components/guardian/TimelineCard.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = { items: { time: string; label: string }[] };

/** 흰 카드: 시각 / 있었던 일 */
export function TimelineCard({ items }: Props) {
  return (
    <View style={styles.card}>
      {items.map((item, i) => (
        <View key={`${item.time}-${i}`} style={styles.row}>
          <AppText variant="body" color={colors.accent}>{item.time}</AppText>
          <AppText variant="body" weight="semibold" color={palette.green700} style={styles.label}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 133,
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flexShrink: 1, textAlign: 'right' },
});