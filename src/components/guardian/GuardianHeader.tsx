// src/components/guardian/GuardianHeader.tsx
import { StyleSheet, View } from 'react-native';

import type { ElderStatus } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

const STATUS_LABEL: Record<ElderStatus, string> = {
  beforeDeparture: '출발 전',
  onTheWay: '이동 중',
  atHospital: '도착 완료',
  returned: '귀가 완료',
  noResponse: '응답 없음',
};

const ALERT_RED = '#CC0000';

type Props = {
  elderName: string;
  status: ElderStatus;
};

/** 상단: 어르신 이름 + 현재 상태 */
export function GuardianHeader({ elderName, status }: Props) {
  // 출발 전: 흰 바탕 + 테두리 / 그 외(이동 중 등): 연두 바탕
  const active = status !== 'beforeDeparture';
  // 도착 완료: 진한 초록 바탕 + 흰 글씨
  const done = status === 'atHospital';
  // 응답 없음: 흰 바탕 + 빨간 테두리·글씨
  const alert = status === 'noResponse';
  return (
    <View style={styles.header}>
      <View>
        <AppText variant="small" weight="medium" color={palette.green200}>보호자</AppText>
        <AppText variant="heading" weight="bold" color={palette.green700} style={styles.name}>
          {elderName}
        </AppText>
      </View>
      <View style={[styles.pill, active && styles.pillActive, done && styles.pillDone, alert && styles.pillAlert]}>
        <View style={[styles.dot, active && styles.dotActive, done && styles.dotDone, alert && styles.dotAlert]} />
        <AppText variant="caption" weight="semibold" color={alert ? ALERT_RED : done ? '#FFFFFF' : active ? palette.green700 : colors.accent}>
          {STATUS_LABEL[status]}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -19 },
  name: { fontSize: 22, lineHeight: 28 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: palette.green600,
    backgroundColor: '#FFFFFF',
  },
  pillActive: { borderColor: palette.green200, backgroundColor: palette.green200 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  dotActive: { backgroundColor: palette.green700 },
  pillDone: { borderColor: palette.green600, backgroundColor: palette.green600 },
  dotDone: { backgroundColor: '#FFFFFF' },
  pillAlert: { borderColor: ALERT_RED, backgroundColor: '#FFFFFF' },
  dotAlert: { backgroundColor: ALERT_RED },
});