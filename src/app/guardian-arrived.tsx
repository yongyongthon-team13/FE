// src/app/guardian-arrived.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getGuardianArrived, type GuardianArrived } from '@/api/guardianArrived';
import MascotFlag from '@/assets/images/mascot-flag.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ArrivalInfoCard } from '@/components/guardian/ArrivalInfoCard';
import { GuardianHeader } from '@/components/guardian/GuardianHeader';
import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';

/** 보호자: 어르신이 병원에 도착했을 때 뜨는 화면 */
export default function GuardianArrivedScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianArrived | null>(null);

  useEffect(() => {
    getGuardianArrived().then(setData);
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

        <View style={styles.center}>
          <MascotFlag width={140} height={140} />
          <View style={styles.icon}>
            <Icon name="calendarCheck" size={50} color={colors.accent} />
          </View>
          <AppText variant="title" weight="bold" color={colors.accent} style={styles.title}>
            {`${data.elderName}가 병원에\n도착하셨어요`}
          </AppText>
        </View>

        <View style={styles.card}>
          <ArrivalInfoCard rows={data.rows} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton label="완료하기" variant="primary" onPress={() => router.replace('/guardian-home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 14, paddingBottom: 24 },
  center: { alignItems: 'center', marginTop: 46 },
  icon: { marginTop: 30 },
  title: { marginTop: 14, textAlign: 'center', lineHeight: 42 },
  card: { marginTop: 26 },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});