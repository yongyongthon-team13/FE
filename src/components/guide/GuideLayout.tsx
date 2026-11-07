// src/components/guide/GuideLayout.tsx
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

const END_RED = '#CC0000';

type Props = {
  destination: string;
  onEnd: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** alert: 초록 배경 + 본문 세로 가운데 정렬 (하차 알림 등 꼭 봐야 하는 단계) */
  tone?: 'default' | 'alert';
  /** 상단 목적지/안내 종료 헤더 숨기기 (창구에 보여주는 화면 등) */
  hideHeader?: boolean;
};

/** 경로 안내 공통 틀: 상단 목적지 + 안내 종료, 본문, 하단 버튼 */
export function GuideLayout({ destination, onEnd, children, footer, tone = 'default', hideHeader = false }: Props) {
  const insets = useSafeAreaInsets();
  const isAlert = tone === 'alert';

  return (
    <View style={[styles.screen, isAlert && styles.screenAlert, { paddingTop: insets.top }]}>
      {!hideHeader && (
        <View style={styles.header}>
          <View style={styles.destination}>
            <Svg width={30} height={30} viewBox="50 43 30 30">
              <Path
                d="M65 45.875C59.8244 45.875 55.625 49.6549 55.625 54.3125C55.625 61.8125 65 72.125 65 72.125C65 72.125 74.375 61.8125 74.375 54.3125C74.375 49.6549 70.1756 45.875 65 45.875ZM65 59C64.2583 59 63.5333 58.7801 62.9166 58.368C62.2999 57.956 61.8193 57.3703 61.5355 56.6851C61.2516 55.9998 61.1774 55.2458 61.3221 54.5184C61.4667 53.791 61.8239 53.1228 62.3483 52.5983C62.8728 52.0739 63.541 51.7167 64.2684 51.5721C64.9958 51.4274 65.7498 51.5016 66.4351 51.7855C67.1203 52.0693 67.706 52.5499 68.118 53.1666C68.5301 53.7833 68.75 54.5083 68.75 55.25C68.7489 56.2442 68.3535 57.1974 67.6505 57.9005C66.9474 58.6035 65.9942 58.9989 65 59Z"
                fill={isAlert ? colors.textOnPrimary : palette.green600}
              />
            </Svg>
            <View style={styles.destinationText}>
              <AppText variant="small" weight="medium" color={palette.green200}>목적지</AppText>
              <AppText
                variant="caption"
                weight="semibold"
                color={isAlert ? colors.textOnPrimary : colors.accent}
                numberOfLines={1}
              >
                {destination}
              </AppText>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
            onPress={onEnd}
            accessibilityRole="button"
            hitSlop={6}
          >
            <AppText variant="small" weight="semibold" color={END_RED}>안내 종료</AppText>
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.body,
          hideHeader && styles.bodyNoHeader,
          isAlert && [styles.bodyAlert, { paddingBottom: insets.bottom + 40 }],
        ]}
      >
        {children}
      </ScrollView>

      {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenAlert: { backgroundColor: colors.accent },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 14,
    gap: 12,
  },
  destination: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 },
  destinationText: { flex: 1, minWidth: 0 },
  endButton: {
    height: 33,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: END_RED,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  endButtonPressed: { backgroundColor: '#FFF0F0' },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 30, paddingTop: 50, paddingBottom: 24 },
  bodyNoHeader: { paddingTop: 110 },
  bodyAlert: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 24 },
  footer: { paddingHorizontal: 30, paddingTop: 12, gap: 10 },
});