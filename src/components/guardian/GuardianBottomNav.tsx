// src/components/guardian/GuardianBottomNav.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { palette } from '@/constants/theme';

export type GuardianTab = 'schedule' | 'home' | 'settings';

const TAB_ROUTE = {
  schedule: '/guardian-schedule',
  home: '/guardian-home',
  settings: '/guardian-settings',
} as const;

type Props = {
  active: GuardianTab;
};

/** 보호자 하단 탭: 일정 / 홈 / 설정 (현재 탭은 연두 박스로 표시) */
export function GuardianBottomNav({ active }: Props) {
  const insets = useSafeAreaInsets();

  const go = (tab: GuardianTab) => {
    if (tab === active) return;
    // 설정 화면에는 하단 탭이 없어서 push로 열어 뒤로가기로 돌아올 수 있게 함
    if (tab === 'settings') router.push(TAB_ROUTE.settings);
    else router.replace(TAB_ROUTE[tab]);
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      <Pressable
        style={[styles.item, active === 'schedule' && styles.itemActive]}
        onPress={() => go('schedule')}
        accessibilityRole="button"
        accessibilityLabel="일정"
      >
        <Icon name="calendarClock" size={30} color={palette.green600} />
        <AppText variant="small" weight="semibold" color={palette.green600}>일정</AppText>
      </Pressable>

      <Pressable
        style={[styles.item, styles.homeItem, active === 'home' && styles.itemActive]}
        onPress={() => go('home')}
        accessibilityRole="button"
        accessibilityLabel="홈"
      >
        <Icon name="home" size={26} color={palette.green600} />
      </Pressable>

      <Pressable
        style={[styles.item, active === 'settings' && styles.itemActive]}
        onPress={() => go('settings')}
        accessibilityRole="button"
        accessibilityLabel="설정"
      >
        <Icon name="settings" size={26} color={palette.green600} />
        <AppText variant="small" weight="semibold" color={palette.green600}>설정</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },
  item: { width: 60, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2 },
  homeItem: { width: 50, height: 50 },
  itemActive: { backgroundColor: palette.green200 },
});