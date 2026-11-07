// src/app/guardian-ride-help.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { answerRideRequest, getRideRequest, type RideChoice, type RideRequest } from '@/api/rideHelp';
import MascotWorried from '@/assets/images/mascot-worried.svg';
import { AppText } from '@/components/AppText';
import { ChoiceButton } from '@/components/guardian/ChoiceButton';
import { GuardianHeader } from '@/components/guardian/GuardianHeader';
import { RideRequestBanner } from '@/components/guardian/RideRequestBanner';
import { colors } from '@/constants/theme';

/** 보호자: 어르신이 '차 부탁하기'를 눌렀을 때 뜨는 화면 */
export default function GuardianRideHelpScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [data, setData] = useState<RideRequest | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getRideRequest(id ?? 'mock-ride').then(setData);
  }, [id]);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const answer = async (choice: RideChoice) => {
    setBusy(true);
    try {
      await answerRideRequest(data.id, choice);
      router.replace('/guardian-home');
    } catch {
      Alert.alert('보내지 못했어요', '잠시 후 다시 시도해 주세요');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}>
        <GuardianHeader elderName={data.elderName} status={data.status} />

        <View style={styles.mascot}>
          <MascotWorried width={74} height={82} />
        </View>

        <RideRequestBanner notice={data.notice} title={data.title} />

        <AppText variant="heading" weight="bold" color={colors.accent} style={styles.question}>
          어떻게 도와드릴까요?
        </AppText>

        <View style={styles.choices}>
          <ChoiceButton label="제가 모시러 갈게요" filled disabled={busy} onPress={() => answer('pickup')} />
          <ChoiceButton label="택시를 불러드릴게요" disabled={busy} onPress={() => answer('taxi')} />
          <ChoiceButton
            label={`${data.elderName}께 전화하기`}
            onPress={() => Linking.openURL(`tel:${data.elderPhone}`)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 14 },
  mascot: { alignItems: 'center', marginTop: 52, marginBottom: 9 },
  question: { marginTop: 34 },
  choices: { marginTop: 36, gap: 30 },
});