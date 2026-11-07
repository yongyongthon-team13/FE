// src/components/guardian/ScheduleCard.tsx
import { StyleSheet, View } from 'react-native';

import type { ScheduleVisit } from '@/api/guardianSchedule';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  visit: ScheduleVisit;
  /** true면 초록 카드 (가장 가까운 일정) */
  highlight?: boolean;
};

/** 진료 일정 카드 1개 */
export function ScheduleCard({ visit, highlight = false }: Props) {
  const main = highlight ? colors.textOnPrimary : palette.green600;
  const label = highlight ? colors.textOnPrimary : palette.green400;

  return (
    <View style={[styles.card, highlight ? styles.cardHighlight : styles.cardPlain]}>
      <AppText variant="button" weight="semibold" color={main} style={styles.title} numberOfLines={1}>
        {visit.title}
      </AppText>
      <View style={styles.row}>
        <AppText variant="button" color={label} style={styles.label}>이동</AppText>
        <AppText variant="button" weight="medium" color={main} style={styles.value} numberOfLines={1}>
          {visit.move}
        </AppText>
      </View>
      <View style={styles.row}>
        <AppText variant="button" color={label} style={styles.label}>상태</AppText>
        <AppText variant="button" weight="medium" color={main} style={styles.value} numberOfLines={1}>
          {visit.state}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingVertical: 20, gap: 6, borderRadius: 22 },
  cardHighlight: { backgroundColor: colors.accent },
  cardPlain: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: { marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { width: 50 },
  value: { flex: 1, textAlign: 'right' },
});