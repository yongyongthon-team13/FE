// src/components/guide/NoResponseView.tsx
import { StyleSheet, View } from 'react-native';

import type { NoResponseReport } from '@/api/guide';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { MapPreview } from './MapPreview';

type Props = {
  report: NoResponseReport;
  title?: string;
};

/** '아직 도착하지 않으셨어요'에 일정 시간 응답이 없을 때: 보호자에게 문자 발송 안내 */
export function NoResponseView({ report, title = '사용자가 응답하지 않아요' }: Props) {
  return (
    <>
      <AppText variant="heading" weight="bold" color={colors.accent} style={styles.title}>
        {title}
      </AppText>

      <View style={styles.card}>
        {report.timeline.map((item, i) => (
          <View key={`${item.time}-${i}`} style={styles.row}>
            <AppText variant="button" color={palette.green300} style={styles.time}>
              {item.time}
            </AppText>
            <AppText variant="button" weight="medium" color={palette.green700} style={styles.label}>
              {item.label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.map}>
        <MapPreview caption="현 위치 지도" />
      </View>

      {report.guardianNotified && (
        <AppText variant="heading" weight="bold" color={colors.accent} style={styles.notice}>
          보호자에게 문자가 갔어요
        </AppText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 40, textAlign: 'center' },
  card: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  time: { width: 64 },
  label: { flex: 1, textAlign: 'right' },
  map: { marginTop: 30 },
  notice: { marginTop: 36, textAlign: 'center' },
});