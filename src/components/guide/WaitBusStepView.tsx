// src/components/guide/WaitBusStepView.tsx
import { StyleSheet, View } from 'react-native';

import type { WaitBusStep } from '@/api/guide';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { MapPreview } from './MapPreview';

export function WaitBusStepView({ step }: { step: WaitBusStep }) {
  return (
    <>
      <AppText variant="heading" weight="bold" color={colors.accent} style={styles.center}>
        {`${step.stopName}에서`}
      </AppText>

      <View style={styles.card}>
        <AppText variant="button" weight="semibold" color={palette.green600} style={styles.center}>
          {`${step.busNo} ${step.lowFloor ? '저상 버스' : '버스'} 탑승`}
        </AppText>
        <AppText variant="title" weight="bold" color={palette.green600} style={[styles.center, styles.arrival]}>
          {step.arrivalMin <= 0 ? '곧 도착' : `${step.arrivalMin}분 후 도착`}
        </AppText>
        <AppText variant="caption" weight="medium" color={palette.green300} style={styles.center}>
          {step.lowFloor ? '계단이 없는 버스에요' : '계단이 있는 버스에요'}
        </AppText>
      </View>

      <AppText variant="button" weight="medium" color={colors.accent} style={[styles.center, styles.note]}>
        {'먼저 도착한 버스가 계단이 있는 버스이면\n보내고 기다리세요'}
      </AppText>

      <View style={styles.map}>
        <MapPreview />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  card: {
    marginTop: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  arrival: { fontSize: 32, lineHeight: 42 },
  note: { marginTop: 22, lineHeight: 28 },
  map: { marginTop: 20 },
});