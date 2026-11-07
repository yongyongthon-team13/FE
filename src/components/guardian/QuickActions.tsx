// src/components/guardian/QuickActions.tsx
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';

import { guardianStyles } from './styles';

export type QuickAction = {
  label: string;
  icon: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
};

type Props = {
  actions: QuickAction[];
};

/** 빠른 버튼 3개 (평소: 전화/위치 보기/일정 추가, 당일: 전화/위치 크게/메시지) */
export function QuickActions({ actions }: Props) {
  return (
    <View style={styles.row}>
      {actions.map(action => (
        <Pressable
          key={action.label}
          style={({ pressed }) => [guardianStyles.softCard, styles.card, pressed && guardianStyles.pressed]}
          onPress={action.onPress}
          accessibilityRole="button"
        >
          <Icon name={action.icon} size={22} color={colors.accent} />
          <AppText variant="small" weight="bold" color={colors.accent}>{action.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 20 },
  card: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 4 },
});