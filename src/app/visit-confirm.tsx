import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MascotWave from '@/assets/images/mascot-wave.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

/** 진료과 추천: 만든 일정 확인 */
export default function VisitConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { hospital, size, department, when } = useLocalSearchParams<{
    hospital: string;
    size: string;
    department: string;
    when?: string;
  }>();

  // TODO: when(말한 내용)에서 날짜·시간 뽑기 / 백엔드 일정 API 연동 (지금은 임시 값)
  void when;
  const date = '11월 4일(화)';
  const time = '오전 10 : 00';

  const rows: [string, string][] = [
    ['병원', hospital],
    ['날짜', date],
    ['시간', time],
    ['진료과', department],
    ['규모', size],
  ];

  const handleDone = () => {
    // TODO: 일정 저장 API 호출
    router.dismissTo('/hospital');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.mascot}>
        <MascotWave width={124} height={124} />
      </View>

      <AppText variant="body" color={palette.green200}>진료과 추천</AppText>
      <AppText variant="heading" weight="bold" color={palette.green600}>해당 일정이 맞나요?</AppText>

      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <AppText variant="body" color={palette.green300}>{label}</AppText>
            <AppText variant="heading" weight="semibold" color={palette.green700}>{value}</AppText>
          </View>
        ))}
      </View>

      <AppText variant="body" color={palette.green200} style={styles.notice}>
        {'잘못된 정보가 있다면\n수정하기를 통해 고쳐주세요'}
      </AppText>

      <View style={styles.buttons}>
        {/* TODO: 수정하기 화면 연결 */}
        <AppButton label="수정하기" variant="secondary" onPress={() => {}} />
        <AppButton label="완료하기" variant="primary" onPress={handleDone} />
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
