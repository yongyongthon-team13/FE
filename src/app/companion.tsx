import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCompanionAssessment, type CompanionAssessment } from '@/api/companion';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors, palette, radius } from '@/constants/theme';
import { useAppointments } from '@/store/appointments';

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointments().find(a => a.id === id);
  const [assessment, setAssessment] = useState<CompanionAssessment | null>(null);

  useEffect(() => {
    getCompanionAssessment(id).then(setAssessment);
  }, [id]);

  if (!assessment) return null; // TODO: 로딩 화면
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.header}>
          {appointment && (
            <AppText variant="body" color={palette.green200}>
              {`${appointment.date} ${appointment.time} ${appointment.hospital} 예약`}
            </AppText>
          )}
          <AppText variant="heading" weight="semibold" color={palette.green600}>
            {'안전한 이동을 위해\n동행서비스를 추천드려요'}
          </AppText>
        </View>

        <View style={styles.reasonBox}>
          <AppText variant="body" color={colors.subtle}>{assessment?.reason ?? ' '}</AppText>
        </View>

        <View style={styles.serviceCard}>
          <AppText variant="body" weight="bold" color={colors.textOnPrimary}>
            {assessment?.serviceName ?? ' '}
          </AppText>
          <AppText variant="body" color={colors.textOnPrimary}>
            {`예상 비용: ${assessment?.estimatedCost ?? ''}`}
          </AppText>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton label="혼자 갈 수 있어요" variant="secondary" onPress={() => router.replace('/home')} />
        {/* TODO: POST /appointments/{id}/companion-requests */}
        <AppButton
            label="신청하기"
            variant="primary"
            disabled={!assessment}
            onPress={() =>
                router.push({
                pathname: '/companion-request',
                params: { id, phone: assessment!.provider.phone },
                })
            }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  body: { paddingHorizontal: 30, paddingTop: 180 },
  header: { gap: 2 },
  reasonBox: {
    marginTop: 33,
    minHeight: 82,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.base,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  serviceCard: {
    marginTop: 32,
    minHeight: 120,
    backgroundColor: colors.accent,
    borderRadius: radius.base,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 11,
  },
  footer: { paddingHorizontal: 30, gap: 10 },
});