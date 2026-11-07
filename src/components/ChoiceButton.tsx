// src/components/ChoiceButton.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, IconName } from '@/components/Icon';
import { colors, radius } from '@/constants/theme';

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
  const color = selected ? colors.textOnPrimary : colors.heading;
  const iconEl = icon && <Icon name={icon} size={iconSize} color={color} />;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.base, selected && styles.selected]}
    >
      <View style={styles.content}>
        {iconPosition  === 'left' && iconEl}
        <AppText weight={selected ? 'semibold' : 'medium'} color={color} style={styles.label}>
          {label}
        </AppText>
        {iconPosition === 'right' && iconEl}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.base,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selected: {
    backgroundColor: colors.accent,
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