// src/components/guide/AlightStepView.tsx
import { useEffect } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

import MascotClock from '@/assets/images/mascot-clock.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

type Props = {
  onAlighted: () => void;
};

export function AlightStepView({ onAlighted }: Props) {
  // 이 화면이 뜨면 휴대폰 진동으로 하차벨 누를 때라고 알려줌
  useEffect(() => {
    // [기다림, 진동, 쉼, 진동, 쉼, 진동] (밀리초)
    Vibration.vibrate([0, 500, 300, 500, 300, 500]);
    return () => Vibration.cancel();
  }, []);
  
  return (
    <View style={styles.wrap}>
      <MascotClock width={102} height={111} style={styles.mascot} />

      <View style={styles.card}>
        <AppText variant="heading" weight="bold" color={palette.green600} style={styles.center}>
          다음 정류장에서 내려요
        </AppText>

        <View style={styles.bell}>
          <Icon name="bell" size={86} color={colors.accent} />
        </View>

        <AppText variant="body" weight="bold" color={colors.accent} style={styles.center}>
          지금 하차벨을 눌러주세요
        </AppText>
        <AppText variant="button" weight="medium" color={palette.green300} style={[styles.center, styles.sub]}>
          버스가 멈춘 뒤 일어나세요
        </AppText>

        <View style={styles.button}>
          <AppButton label="버스에서 내렸어요" variant="primary" onPress={onAlighted} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  mascot: { marginBottom: -10, zIndex: 1 },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 36,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#1A2E0F',
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  center: { textAlign: 'center' },
  bell: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  sub: { marginTop: 10 },
  button: { marginTop: 32 },
});