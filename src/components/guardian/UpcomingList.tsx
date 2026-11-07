// src/components/guardian/UpcomingList.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import type { UpcomingVisit } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { guardianStyles } from './styles';

type Props = {
  visits: UpcomingVisit[];
  onSeeAll: () => void;
};

/** 다가오는 일정 (첫 번째 일정은 테두리로 강조) */
export function UpcomingList({ visits, onSeeAll }: Props) {
  return (
    <>
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" color={colors.accent}>다가오는 일정</AppText>
        <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
          <AppText variant="small" weight="medium" color={palette.green300}>전체 보기 ›</AppText>
        </Pressable>
      </View>

      <View style={styles.card}>
        {visits.map((visit, i) => {
          const done = visit.badge.tone === 'done';
          return (
            <View key={visit.id} style={[styles.row, i === 0 && guardianStyles.softCard]}>
              <View style={styles.dateCol}>
                <AppText variant="heading" weight="bold" color={palette.green700} style={styles.day}>{visit.day}</AppText>
                <AppText variant="small" color={palette.green300} style={guardianStyles.smallText}>{visit.monthWeek}</AppText>
              </View>
              <View style={styles.text}>
                <AppText variant="button" weight="bold" color={palette.green700} style={styles.title} numberOfLines={1}>
                  {visit.title}
                </AppText>
                <AppText variant="small" color={palette.green300} style={styles.sub} numberOfLines={1}>
                  {visit.sub}
                </AppText>
              </View>
              <View style={[styles.badge, done ? styles.badgeDone : styles.badgeWarning]}>
                <AppText
                  variant="small"
                  weight="bold"
                  color={done ? colors.accent : colors.textOnPrimary}
                  style={guardianStyles.smallText}
                >
                  {visit.badge.label}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  card: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 4,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dateCol: { width: 42, alignItems: 'center' },
  day: { fontSize: 22, lineHeight: 26 },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, lineHeight: 22 },
  sub: { fontSize: 13, lineHeight: 18 },
  badge: { height: 22, paddingHorizontal: 7, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeDone: { backgroundColor: palette.green200 },
  badgeWarning: { backgroundColor: '#203013' },
});