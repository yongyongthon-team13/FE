// src/app/guardian-home.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getGuardianHome, type GuardianHome } from '@/api/guardianHome';
import { ElderMapPreview } from '@/components/guardian/ElderMapPreview';
import { GuardianBottomNav } from '@/components/guardian/GuardianBottomNav';
import { GuardianHeader } from '@/components/guardian/GuardianHeader';
import { NextVisitCard } from '@/components/guardian/NextVisitCard';
import { QuickActions } from '@/components/guardian/QuickActions';
import { TodayLogList } from '@/components/guardian/TodayLogList';
import { TodayTripCard } from '@/components/guardian/TodayTripCard';
import { TodoList } from '@/components/guardian/TodoList';
import { UpcomingList } from '@/components/guardian/UpcomingList';
import { colors } from '@/constants/theme';

/** 보호자 홈 (평소 / 진료 당일 이동 중) */
export default function GuardianHomeScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianHome | null>(null);

  useEffect(() => {
    getGuardianHome().then(setData);
    // TODO: 진료 당일에는 이동 상황(today) 실시간 구독
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const call = () => Linking.openURL(`tel:${data.elderPhone}`);

  // 평소에는 위치를 보지 않고, 병원 가는 날 이동 중일 때만 위치를 보여줌
  const showLocationOff = () => {
    const title = '지금은 위치를 볼 수 없어요';
    const message = `${data.elderName}가 병원에 가려고 출발하면 위치를 볼 수 있어요.`;
    if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <GuardianHeader elderName={data.elderName} status={data.status} />

        {data.today ? (
          // 진료 당일 이동 중
          <>
            <TodayTripCard trip={data.today} />
            <ElderMapPreview />
            <QuickActions
              actions={[
                { label: '전화', icon: 'phone', onPress: call },
                { label: '위치 크게', icon: 'location', onPress: () => router.push('/guardian-moving') },
                // TODO: 메시지 보내기 연결
                { label: '메시지', icon: 'chat', onPress: () => {} },
              ]}
            />
            <TodayLogList logs={data.today.logs} />
          </>
        ) : (
          // 평소
          <>
            {data.nextVisit && <NextVisitCard visit={data.nextVisit} />}
            <QuickActions
              actions={[
                { label: '전화', icon: 'phone', onPress: call },
                { label: '위치 보기', icon: 'location', onPress: showLocationOff },
                { label: '일정 추가', icon: 'plusSquare', onPress: () => router.push('/onboarding/paste-guide') },
              ]}
            />
            <TodoList
              todos={data.todos}
              onPressTodo={todo => {
                if (todo.kind === 'review') router.push({ pathname: '/guardian-review', params: { id: todo.id } });
                if (todo.kind === 'smsMissing') router.push({ pathname: '/guardian-schedule-help', params: { id: todo.id } });
              }}
            />
            {/* TODO: 전체 일정 화면 연결 */}
            <UpcomingList visits={data.upcoming} onSeeAll={() => {}} />
          </>
        )}
      </ScrollView>

      <GuardianBottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 29, paddingTop: 14, paddingBottom: 40 },
});