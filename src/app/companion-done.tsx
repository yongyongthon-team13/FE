import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getCompanionRequestResult, type CompanionRequestResult } from '@/api/companion';
import Mascot from '@/assets/images/mascot-happy.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, fontFamily, palette, radius, shadow } from '@/constants/theme';
import { setCompanion, useAppointments } from '@/store/appointments';

export default function CompanionDoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointments().find(a => a.id === id);
  const [result, setResult] = useState<CompanionRequestResult | null>(null);

  useEffect(() => {
    getCompanionRequestResult(id).then(setResult);
  }, [id]);

  const handleDone = () => {
    if (result) {
      setCompanion(id, {
        service: `동행 서비스 · ${result.pickupTime} ${result.pickupPlace}`,
        manager: `${result.companionType}와 함께`,
      });
    }
    router.dismissTo('/home');
  };

  return (
    <ScreenLayout
      scroll={false}
      bodyPaddingTop={0}
      footer={<AppButton label="완료하기" variant="primary" disabled={!result} onPress={handleDone} />}
    >
      <View style={styles.center}>
        <Mascot width={104} height={102} style={styles.mascot} />

        <AppText variant="title" weight="bold" color={colors.accent} style={styles.title}>
          신청이 완료되었어요
        </AppText>

        <View style={styles.box}>
          <View style={styles.row}>
            <AppText style={styles.label}>{appointment?.date ?? ' '}</AppText>
            <AppText style={styles.value} numberOfLines={1}>
              {result ? `${result.pickupTime} ${result.pickupPlace}` : ' '}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText style={styles.label}>함께 가는 분</AppText>
            <AppText style={styles.value} numberOfLines={1}>
              {result?.companionType ?? ' '}
            </AppText>
          </View>
        </View>

        <AppText style={styles.notice}>전날 저녁과 당일 아침에 연락드리겠습니다</AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  mascot: {
    alignSelf: 'center',
  },
  title: {
    marginTop: 30,
    textAlign: 'center',
  },
  box: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    gap: 4,
    ...shadow.card,
  },
  row: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flexShrink: 0,
    fontFamily: fontFamily.regular,
    fontSize: 18,
    color: palette.green300,
  },
  value: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: palette.green700,
  },
  notice: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.accent,
  },
});