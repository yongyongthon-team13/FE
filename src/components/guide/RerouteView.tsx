// src/components/guide/RerouteView.tsx
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { ReroutePreview } from '@/api/guide';
import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

import { MapPreview } from './MapPreview';

const DIRECTION_TEXT = { straight: '앞으로', left: '왼쪽으로', right: '오른쪽으로' } as const;
const DIRECTION_ICON = { straight: 'arrowUp', left: 'arrowLeft', right: 'arrowRight' } as const;

type Props = {
  /** 아직 경로를 받아오는 중이면 null */
  preview: ReroutePreview | null;
};

/** '지금 계신 곳에서 다시 안내할게요' */
export function RerouteView({ preview }: Props) {
  return (
    <>
      <AppText variant="heading" weight="bold" color={colors.accent} style={styles.title}>
        {'지금 계신 곳에서\n다시 안내할게요'}
      </AppText>

      <View style={styles.map}>
        <MapPreview />
      </View>

      <View style={styles.card}>
        {preview ? (
          <>
            <Icon name={DIRECTION_ICON[preview.direction]} size={70} color={palette.green600} />
            <AppText variant="heading" weight="bold" color={palette.green600} style={styles.direction}>
              {`${DIRECTION_TEXT[preview.direction]} ${preview.distanceM}m`}
            </AppText>
            <AppText variant="body" weight="medium" color={palette.green300} style={styles.remaining}>
              {`병원까지 ${preview.totalRemainingM}m`}
            </AppText>
          </>
        ) : (
          <ActivityIndicator color={colors.accent} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', lineHeight: 34 },
  map: { marginTop: 30 },
  card: {
    marginTop: 22,
    minHeight: 203,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  direction: { marginTop: 18, textAlign: 'center' },
  remaining: { marginTop: 6, textAlign: 'center' },
});