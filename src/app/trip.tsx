// src/app/trip.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/constants/theme';

export default function TripScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <AppText variant="title" weight="bold">
          이동 안내
        </AppText>
        <AppText variant="body" color={colors.textSub}>
          병원까지 가는 길을 안내해 드릴게요.
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
});