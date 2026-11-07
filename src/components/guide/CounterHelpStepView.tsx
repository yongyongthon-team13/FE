// src/components/guide/CounterHelpStepView.tsx
import { StyleSheet, View } from 'react-native';

import type { CounterHelpStep } from '@/api/guide';
import { AppText } from '@/components/AppText';
import { palette } from '@/constants/theme';

type Props = {
  step: CounterHelpStep;
};

export function CounterHelpStepView({ step }: Props) {
  const rows = [
    { label: '병원', value: step.hospital },
    { label: '날짜', value: step.date },
    { label: '시간', value: step.time },
    { label: '진료과', value: step.department },
    { label: '규모', value: step.scale },
  ];

  return (
    <>
      <AppText variant="heading" weight="bold" color={palette.green600} style={styles.message}>
        {`안녕하세요\n오늘 진료를 보러 온 ${step.userName}입니다\n제가 키오스크를 찾지 못해서\n도움을 요청하고 싶습니다`}
      </AppText>

      <View style={styles.card}>
        {rows.map(row => (
          <View key={row.label} style={styles.row}>
            <AppText variant="caption" weight="medium" color={palette.green300} style={styles.label}>
              {row.label}
            </AppText>
            <AppText variant="body" weight="bold" color={palette.green700} style={styles.value}>
              {row.value}
            </AppText>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  message: { lineHeight: 36 },
  card: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { width: 64 },
  value: { flex: 1, textAlign: 'right' },
});