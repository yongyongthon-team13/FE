import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPrimaryGuardian, type Guardian } from '@/api/guardian';
import MascotWorried from '@/assets/images/mascot-worried.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

const showAlert = (title: string, message: string) => {
  // 웹에서는 Alert.alert가 동작하지 않아 브라우저 알림창 사용
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

/** 위험 증상: 119 / 보호자에게 바로 전화 */
export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const [guardian, setGuardian] = useState<Guardian | null>(null);

  useEffect(() => {
    getPrimaryGuardian().then(setGuardian);
  }, []);

  const call = async (tel: string) => {
    try {
      await Linking.openURL(`tel:${tel}`);
    } catch {
      showAlert('전화를 걸 수 없어요', `${tel}로 직접 전화해 주세요.`);
    }
  };

  const callGuardian = () => {
    if (!guardian) {
      showAlert('보호자 번호가 없어요', '119로 먼저 전화해 주세요.');
      return;
    }
    call(guardian.phone);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.mascot}>
        <MascotWorried width={94} height={102} />
      </View>

      <View style={styles.card}>
        <AppText variant="body" weight="semibold" color="#FFFFFF">위험할 수 있는 증상</AppText>
        <AppText variant="heading" weight="bold" color="#FFFFFF">가슴이 짓눌리는 느낌</AppText>
      </View>

      <View style={styles.message}>
        <AppText variant="heading" weight="bold" color={colors.accent}>{'지금 바로\n119에 연락하세요'}</AppText>
        <AppText variant="body" color={palette.green300}>{'병원 일정을 만들기 전에\n먼저 도움을 받으셔야 해요'}</AppText>
      </View>

      <View style={styles.buttons}>
        <AppButton label="보호자에게 연락하기" variant="secondary" onPress={callGuardian} />
        <AppButton label="119 전화하기" variant="primary" onPress={() => call('119')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 30 },
  mascot: { alignItems: 'center', marginBottom: 20 },
  card: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 26,
    gap: 14,
  },
  message: { marginTop: 36, gap: 6 },
  buttons: { marginTop: 32, gap: 10 },
});
