// src/components/guardian/NextVisitCard.tsx
import { StyleSheet, View } from 'react-native';

import type { NextVisit } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

type Props = {
  visit: NextVisit;
};

/** 다음 진료 카드 (D-day) */
export function NextVisitCard({ visit }: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="small" weight="medium" color={colors.textOnPrimary} style={styles.dim}>
        다음 진료
      </AppText>
      <View style={styles.row}>
        <AppText variant="title" weight="bold" color={colors.textOnPrimary} style={styles.dDay}>
          {visit.dDay === 0 ? 'D-Day' : `D-${visit.dDay}`}
        </AppText>
        <AppText variant="button" weight="bold" color={colors.textOnPrimary} style={styles.date}>
          {visit.dateLabel}
        </AppText>
      </View>
      <AppText variant="small" weight="medium" color={colors.textOnPrimary}>
        {visit.summary}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 44,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  dim: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', marginTop: 2, marginBottom: 6 },
  dDay: { fontSize: 32, lineHeight: 38, marginRight: 12 },
  date: { flexShrink: 1 },
});