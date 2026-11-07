// src/components/guide/ArrivedStepView.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import MascotFlag from '@/assets/images/mascot-flag.svg';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  arrivalNotified: boolean;
  onSeeKiosk: () => void;
  onNoKiosk: () => void;
};

export function ArrivedStepView({ arrivalNotified, onSeeKiosk, onNoKiosk }: Props) {
  return (
    <>
      <View style={styles.mascot}>
        <MascotFlag width={134} height={128} />
      </View>

      <AppText variant="heading" weight="bold" color={palette.green600} style={styles.title}>
        병원에 도착했어요
      </AppText>
      <AppText variant="caption" weight="semibold" color={palette.green600} style={styles.question}>
        접수 기계(키오스크)가 보이세요?
      </AppText>

      <View style={styles.options}>
        <Pressable
          style={({ pressed }) => [styles.option, styles.optionYes, pressed && styles.optionYesPressed]}
          onPress={onSeeKiosk}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color={colors.textOnPrimary}>
            네, 보여요 → 사용법 보기
          </AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.option, styles.optionNo, pressed && styles.optionNoPressed]}
          onPress={onNoKiosk}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color="#2B2B2B">
            아니요 → 창구에 화면 보여주기
          </AppText>
        </Pressable>
      </View>

      {arrivalNotified && (
        <AppText variant="caption" weight="medium" color={palette.green400} style={styles.notice}>
          가족에게 도착 알림을 보냈어요
        </AppText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: 'center' },
  title: { marginTop: 22 },
  question: { marginTop: 6 },
  options: { marginTop: 20, gap: 20 },
  option: {
    minHeight: 70,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionYes: {
    backgroundColor: palette.green400,
    borderWidth: 2,
    borderColor: palette.green600,
  },
  optionYesPressed: { backgroundColor: palette.green500 },
  optionNo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  optionNoPressed: { backgroundColor: '#F3F7EE' },
  notice: { marginTop: 26 },
});