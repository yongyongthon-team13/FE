// src/components/guardian/TodayLogList.tsx
import { StyleSheet, View } from 'react-native';

import type { TodayLog } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { guardianStyles } from './styles';

type Props = {
  logs: TodayLog[];
};

/** 진료 당일: 오늘 기록 (예정 항목은 흐리게) */
export function TodayLogList({ logs }: Props) {
  return (
    <>
      <AppText variant="caption" weight="bold" color={colors.accent} style={guardianStyles.sectionTitle}>
        오늘 기록
      </AppText>
      <View style={styles.card}>
        {logs.map(log => {
          const textColor = log.done ? palette.green700 : palette.green200;
          return (
            <View key={log.id} style={styles.row}>
              <AppText variant="small" color={log.done ? palette.green400 : palette.green200} style={styles.time}>
                {log.time}
              </AppText>
              <View style={[styles.dot, !log.done && styles.dotPlanned]} />
              <AppText variant="small" color={textColor} style={styles.text} numberOfLines={1}>
                {log.parts.map((part, i) => (
                  <AppText key={i} variant="small" weight={part.bold ? 'bold' : 'regular'} color={textColor} style={styles.text}>
                    {part.text}
                  </AppText>
                ))}
              </AppText>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 7,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 22 },
  time: { width: 54, fontSize: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10, backgroundColor: colors.accent },
  dotPlanned: { backgroundColor: palette.green200 },
  text: { flex: 1, fontSize: 15, lineHeight: 20 },
});