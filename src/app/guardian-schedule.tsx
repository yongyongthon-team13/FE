// src/app/guardian-schedule.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getGuardianSchedule, type GuardianSchedule } from '@/api/guardianSchedule';
import { AppText } from '@/components/AppText';
import { GuardianBottomNav } from '@/components/guardian/GuardianBottomNav';
import { GuardianHeader } from '@/components/guardian/GuardianHeader';
import { ScheduleCard } from '@/components/guardian/ScheduleCard';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

/** 보호자: 어르신 진료 일정 */
export default function GuardianScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianSchedule | null>(null);

  useEffect(() => {
    getGuardianSchedule().then(setData);
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <GuardianHeader elderName={data.elderName} status={data.status} />

        <AppText variant="heading" weight="bold" color={palette.green600} style={styles.title}>
          {`${data.elderName}의 진료 일정`}
        </AppText>

        <View style={styles.list}>
          {data.visits.map((visit, i) => (
            <ScheduleCard key={visit.id} visit={visit} highlight={i === 0} />
          ))}
        </View>

        
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => router.push('/onboarding/paste-guide')}
          accessibilityRole="button"
        >
          <Icon name="plusSquare" size={22} color={colors.textOnPrimary} />
          <AppText variant="button" weight="semibold" color={colors.textOnPrimary}>일정 추가하기</AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.callPill, pressed && styles.callPillPressed]}
          onPress={() => Linking.openURL(`tel:${data.elderPhone}`)}
          accessibilityRole="button"
        >
          <AppText variant="small" weight="semibold" color={colors.accent}>{`${data.elderName}에게 연락`}</AppText>
          <Icon name="phone" size={16} color={colors.accent} />
        </Pressable>
      </ScrollView>

      <GuardianBottomNav active="schedule" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 14, paddingBottom: 40 },
  title: { marginTop: 108, marginBottom: 22 },
  list: { gap: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: colors.accent,
    shadowColor: '#213314',
    shadowOpacity: 0.16,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  addButtonPressed: { backgroundColor: palette.green600 },
  callPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    marginTop: 20,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
  },
  callPillPressed: { backgroundColor: '#F3F7EE' },
});