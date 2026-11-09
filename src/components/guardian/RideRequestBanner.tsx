// src/components/guardian/RideRequestBanner.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

type Props = { notice: string; title: string };

/** 초록 카드: 날씨 안내 + 어르신의 차량 요청 */
export function RideRequestBanner({ notice, title }: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="body" color={colors.textOnPrimary}>{notice}</AppText>
      <AppText variant="heading" weight="bold" color={colors.textOnPrimary} style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  title: { marginTop: 8 },
});