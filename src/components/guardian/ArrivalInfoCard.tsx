// src/components/guardian/ArrivalInfoCard.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { palette } from '@/constants/theme';

import { guardianStyles } from './styles';

type Props = { rows: { label: string; value: string }[] };

/** 테두리 카드: 도착 후 접수·진료 정보 */
export function ArrivalInfoCard({ rows }: Props) {
  return (
    <View style={[guardianStyles.softCard, styles.card]}>
      {rows.map(row => (
        <View key={row.label} style={styles.row}>
          <AppText variant="button" color={palette.green300}>{row.label}</AppText>
          <AppText variant="body" weight="medium" color={palette.green700} style={styles.value}>{row.value}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 89, justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  value: { flexShrink: 1, textAlign: 'right' },
});