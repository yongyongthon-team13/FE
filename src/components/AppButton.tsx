// src/components/AppButton.tsx
import { colors, fontSize, palette, radius, shadow, spacing } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'accent' | 'soft';

const BUTTON_HEIGHT = 50;
const TOUCH_SLOP = { top: 8, bottom: 8, left: 0, right: 0 };

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
}) {
  const textColor = variant === 'outline' || variant === 'soft' ? colors.accent : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={TOUCH_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon && <Icon name={icon} size={25} color={textColor} />}
        <AppText weight="bold" color={textColor} style={styles.label}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: BUTTON_HEIGHT,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: fontSize.button,
    lineHeight: fontSize.button * 1.3,
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent, ...shadow.button },
  primaryPressed: { backgroundColor: palette.green600, borderColor: palette.green600 },
  secondary: { backgroundColor: colors.subtle, borderColor: colors.subtle },
  secondaryPressed: { backgroundColor: palette.green400, borderColor: palette.green400 },
  outline: { backgroundColor: colors.bg, borderColor: palette.green400 },
  outlinePressed: { backgroundColor: colors.primarySoft },
  soft: { backgroundColor: '#E6EEDD', borderColor: '#E6EEDD' },
  softPressed: { backgroundColor: colors.borderSoft, borderColor: colors.borderSoft },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled, shadowOpacity: 0, elevation: 0 },
  accent: { backgroundColor: colors.accent, borderColor: colors.accent },
  accentPressed: { backgroundColor: palette.green600, borderColor: palette.green600 },
});