// src/components/guardian/TodayTripCard.tsx
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import type { TodayTrip } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  trip: TodayTrip;
};

/** 진료 당일: 지금 어디쯤인지 + 도착 예상 + 진행 단계 */
export function TodayTripCard({ trip }: Props) {
  const { total, current, startLabel, currentLabel, endLabel } = trip.progress;

  return (
    <View style={styles.card}>
      <AppText variant="small" weight="medium" color={colors.textOnPrimary} style={styles.dim}>
        {`지금 · ${trip.nowLabel}`}
      </AppText>
      <AppText variant="heading" weight="bold" color={colors.textOnPrimary} style={styles.eta}>
        {`병원 도착 예상 ${trip.etaLabel}`}
      </AppText>

      <View style={styles.track}>
        {Array.from({ length: total }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={[styles.line, i <= current && styles.lineDone]} />}
            <View
              style={[
                styles.dot,
                i < current && styles.dotDone,
                i === current && styles.dotCurrent,
                i > current && styles.dotUpcoming,
              ]}
            />
          </Fragment>
        ))}
      </View>

      <View style={styles.labels}>
        <AppText variant="small" weight="medium" color={colors.textOnPrimary} style={styles.dim}>{startLabel}</AppText>
        <AppText variant="small" weight="medium" color={colors.textOnPrimary} style={styles.dim}>{currentLabel}</AppText>
        <AppText variant="small" weight="medium" color={colors.textOnPrimary} style={styles.dim}>{endLabel}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 44,
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  dim: { opacity: 0.9 },
  eta: { fontSize: 22, lineHeight: 30, marginTop: 4 },
  track: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  line: { flex: 1, height: 3, backgroundColor: palette.green400 },
  lineDone: { backgroundColor: '#FFFFFF' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF' },
  dotDone: {},
  dotCurrent: { width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#203013' },
  dotUpcoming: { opacity: 0.5 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
});