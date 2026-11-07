// src/app/guardian-no-response.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getGuardianNoResponse, type GuardianNoResponse } from '@/api/guardianNoResponse';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { GuardianHeader } from '@/components/guardian/GuardianHeader';
import { NoResponseBanner } from '@/components/guardian/NoResponseBanner';
import { TimelineCard } from '@/components/guardian/TimelineCard';
import { colors, palette } from '@/constants/theme';

/** 보호자: 어르신이 응답하지 않을 때 뜨는 화면 */
export default function GuardianNoResponseScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianNoResponse | null>(null);

  useEffect(() => {
    getGuardianNoResponse().then(setData);
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
        <GuardianHeader elderName={data.elderName} status="noResponse" />

        <View style={styles.banner}>
          <NoResponseBanner title={data.title} sub={data.sub} />
        </View>

        <View style={styles.timeline}>
          <TimelineCard items={data.timeline} />
        </View>

        {/* TODO: 실제 지도(어르신 현재 위치)로 교체 */}
        <View style={styles.map} />
        <AppText variant="small" color="#828282" style={styles.mapCaption}>
          {`지도 · ${data.elderName} 위치`}
        </AppText>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        {/* TODO: 어르신 위치 공유 연결 */}
        <Pressable
          style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}
          onPress={() => {}}
          accessibilityRole="button"
        >
          <AppText variant="button" weight="semibold" color={colors.accent}>위치 공유</AppText>
        </Pressable>
        <AppButton
          label={`${data.elderName}께 전화`}
          variant="primary"
          onPress={() => Linking.openURL(`tel:${data.elderPhone}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 14, paddingBottom: 24 },
  banner: { marginTop: 84 },
  timeline: { marginTop: 25 },
  map: { height: 120, marginTop: 25, marginHorizontal: 16, backgroundColor: '#D9D9D9' },
  mapCaption: { marginTop: 6, textAlign: 'center' },
  footer: { paddingHorizontal: 30, paddingTop: 12, gap: 5 },
  shareButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.green400,
    backgroundColor: '#FFFFFF',
  },
  shareButtonPressed: { backgroundColor: '#F3F7EE' },
});