// src/components/guardian/HelpInfoCard.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = { title?: string; rows: { label: string; value: string }[] };

/** 흰 카드: 어르신 쪽에서 이미 읽은 정보 */
export function HelpInfoCard({ title, rows }: Props) {
  return (
    <View style={styles.card}>
      {title && <AppText variant="button" weight="medium" color={colors.accent}>{title}</AppText>}
      {rows.map(row => (
        <View key={row.label} style={styles.row}>
          <AppText variant="button" color={colors.accent}>{row.label}</AppText>
          <AppText variant="button" weight="medium" color={palette.green700} style={styles.value}>{row.value}</AppText>
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
    paddingVertical: 18,
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
  value: { flexShrink: 1, textAlign: 'right' },
});