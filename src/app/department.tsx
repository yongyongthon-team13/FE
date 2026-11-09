import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MascotWave from '@/assets/images/mascot-wave.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

/** 진료과 추천 결과 */
export default function DepartmentScreen() {
  const insets = useSafeAreaInsets();
  const { area, department, symptom, when } = useLocalSearchParams<{
    area: string;
    department: string;
    symptom?: string;
    when?: string;
  }>();

  const handleConfirm = () => {
    router.push({
      pathname: '/hospital-select',
      params: { department, symptom: symptom ?? '', when: when ?? '' },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.mascot}>
        <MascotWave width={124} height={124} />
      </View>

      <AppText variant="body" color={palette.green200}>진료과 추천</AppText>
      <AppText variant="heading" weight="bold" color={palette.green600}>{`${department}로 가 보세요`}</AppText>

      <View style={styles.card}>
        <View style={styles.row}>
          <AppText variant="body" color={palette.green300}>불편한 곳</AppText>
          <AppText variant="heading" weight="semibold" color={palette.green700}>{area}</AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="body" color={palette.green300}>추천 진료과</AppText>
          <AppText variant="heading" weight="semibold" color={palette.green700}>{department}</AppText>
        </View>
      </View>

      <AppText variant="body" color={palette.green200} style={styles.notice}>
        {'병명을 알려드리는 것은 아니에요\n정확한 진료는 병원에서 받으세요'}
      </AppText>

      <View style={styles.buttons}>
        <AppButton label="다른 과 고르기" variant="secondary" onPress={() => router.back()} />
        <AppButton label="맞아요" variant="primary" onPress={handleConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 30 },
  mascot: { alignItems: 'center', marginBottom: 8 },
  card: {
    marginTop: 32,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notice: { marginTop: 14 },
  buttons: { marginTop: 'auto', gap: 10 },
});
