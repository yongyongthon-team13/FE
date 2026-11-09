// src/components/guardian/ChoiceButton.tsx
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  label: string;
  filled?: boolean; // true: 연한 초록 바탕 / false: 흰 바탕
  disabled?: boolean;
  onPress: () => void;
};

/** 테두리 있는 선택 버튼 */
export function ChoiceButton({ label, filled, disabled, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        filled ? styles.filled : styles.outline,
        pressed && (filled ? styles.filledPressed : styles.outlinePressed),
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <AppText variant="button" weight="medium" color={filled ? colors.textOnPrimary : colors.accent}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  filled: { backgroundColor: palette.green400 },
  filledPressed: { backgroundColor: palette.green500 },
  outline: { backgroundColor: '#FFFFFF' },
  outlinePressed: { backgroundColor: '#F3F7EE' },
});