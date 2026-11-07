// src/components/guardian/HelpRequestBanner.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = { title: string; sub: string };

/** 초록 카드: 어르신이 보낸 도움 요청 */
export function HelpRequestBanner({ title, sub }: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="heading" weight="bold" color={colors.textOnPrimary}>{title}</AppText>
      <AppText variant="button" color={palette.green200} style={styles.sub}>{sub}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 87,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  sub: { marginTop: 4 },
});