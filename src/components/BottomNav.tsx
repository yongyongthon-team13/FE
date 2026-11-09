import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { palette, radius } from '@/constants/theme';

type Tab = 'route' | 'home' | 'profile';

const TABS: { key: Tab; label: string; icon: IconName; onPress: () => void }[] = [
  { key: 'route', label: '병원 가기', icon: 'location', onPress: () => router.push('/hospital') },
  { key: 'home', label: '홈', icon: 'home', onPress: () => router.replace('/home') },
  { key: 'profile', label: '내 정보', icon: 'profileList', onPress: () => router.push('/my-info') }
];

export function BottomNav({ active }: { active: Tab }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={[styles.item, isActive && styles.activeItem]}
            onPress={tab.onPress}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <Icon name={tab.icon} size={30} color={palette.green600} />
            {!isActive && (
              <AppText variant="caption" weight="semibold" color={palette.green600}>{tab.label}</AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: palette.green400,
    minHeight: 70,
  },
  item: { alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 80, height: 60 },
  activeItem: {
    minWidth: 50,
    width: 50,
    height: 50,
    borderRadius: radius.base,
    backgroundColor: palette.green200,
  },
});