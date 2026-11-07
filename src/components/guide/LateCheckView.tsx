// src/components/guide/LateCheckView.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import MascotWorried from '@/assets/images/mascot-worried.svg';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  onOk: () => void;
  onLost: () => void;
  onHelp: () => void;
};

/** 도착 예상 시간이 지났는데 병원에 도착하지 않았을 때 묻는 화면 */
export function LateCheckView({ onOk, onLost, onHelp }: Props) {
  return (
    <View style={styles.wrap}>
      <MascotWorried width={98} height={110} style={styles.mascot} />

      <View style={styles.card}>
        <AppText variant="button" weight="medium" color={palette.green400} style={styles.title}>
          아직 병원에 도착하지 않으셨어요
        </AppText>

        <Pressable
          style={({ pressed }) => [styles.option, styles.optionPrimary, pressed && styles.optionPrimaryPressed]}
          onPress={onOk}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color={colors.textOnPrimary}>
            괜찮아요, 가는 중이에요
          </AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.option, styles.optionOutline, pressed && styles.optionOutlinePressed]}
          onPress={onLost}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color={colors.accent}>
            길을 모르겠어요
          </AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.option, styles.optionOutline, pressed && styles.optionOutlinePressed]}
          onPress={onHelp}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color={colors.accent}>
            도와주세요
          </AppText>
        </Pressable>
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
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 20,
    gap: 11,
    shadowColor: '#1A2E0F',
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  title: { textAlign: 'center', marginBottom: 5 },
  option: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPrimary: { backgroundColor: palette.green400 },
  optionPrimaryPressed: { backgroundColor: palette.green500 },
  optionOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: palette.green400,
  },
  optionOutlinePressed: { backgroundColor: '#F3F7EE' },
});