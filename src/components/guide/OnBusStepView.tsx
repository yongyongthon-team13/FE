// src/components/guide/OnBusStepView.tsx
import { StyleSheet, View } from 'react-native';

import type { OnBusStep } from '@/api/guide';
import MascotClock from '@/assets/images/mascot-clock.svg';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

export function OnBusStepView({ step }: { step: OnBusStep }) {
  return (
    <>
      <AppText variant="heading" weight="bold" color={colors.accent} style={[styles.center, styles.title]}>
        {`${step.alightStop}에서 내려요`}
      </AppText>

      <View style={styles.box}>
        <AppText variant="title" weight="bold" color={colors.textOnPrimary} style={styles.count}>
          {String(step.stopsLeft)}
        </AppText>
        <AppText variant="button" weight="semibold" color={colors.textOnPrimary}>
          정거장 남았어요
        </AppText>
      </View>

      <View style={styles.bubble}>
        <AppText variant="small" weight="medium" color="#2B2B2B" style={[styles.center, styles.bubbleText]}>
          {'자리에 앉아 계세요\n내릴때 알려드릴게요'}
        </AppText>
      </View>

      <View style={styles.mascot}>
        <MascotClock width={145} height={158} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  title: { marginTop: 100 },
  box: {
    marginTop: 30,
    minHeight: 148,
    backgroundColor: colors.accent,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  count: { fontSize: 48, lineHeight: 60 },
  bubble: {
    marginTop: 28,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  bubbleText: { fontSize: 12, lineHeight: 17 },
  mascot: { marginTop: 8, alignItems: 'center' },
});