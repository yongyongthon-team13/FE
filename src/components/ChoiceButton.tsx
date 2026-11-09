// src/components/ChoiceButton.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, IconName } from '@/components/Icon';
import { colors, palette, radius, shadow } from '@/constants/theme';

export function ChoiceButton({
  label,
  icon,
  iconSize,
  iconPosition = 'left',
  selected,
  onPress,
}: {
  label: string;
  icon?: IconName;
  iconSize?: number;
  iconPosition?: 'left' | 'right';
  selected: boolean;
  onPress: () => void;
}) {
  const textColor = selected ? colors.textOnPrimary : palette.green600;
  const iconColor = selected ? colors.textOnPrimary : colors.accent;
  const iconEl = icon && <Icon name={icon} size={iconSize} color={iconColor} />;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.base, selected && styles.selected]}
    >
      <View style={styles.content}>
        {iconPosition === 'left' && iconEl}
        <AppText weight={selected ? 'semibold' : 'medium'} color={textColor} style={styles.label}>
          {label}
        </AppText>
        {iconPosition === 'right' && iconEl}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.base,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: shadow.button.shadowColor,
    shadowOpacity: shadow.button.shadowOpacity,
    shadowRadius: shadow.button.shadowRadius,
    shadowOffset: shadow.button.shadowOffset,
    elevation: shadow.button.elevation,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
  },
});