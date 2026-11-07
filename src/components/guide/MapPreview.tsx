// src/components/guide/MapPreview.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';

type Props = {
  caption?: string;
};

// TODO: 실제 지도(현재 위치 표시)로 교체
export function MapPreview({ caption = '지도 · 현재 위치' }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.map} />
      <AppText variant="small" color="#828282" style={styles.caption}>{caption}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  map: {
    width: 268,
    maxWidth: '100%',
    height: 170,
    backgroundColor: '#D9D9D9',
    borderWidth: 1,
    borderColor: '#A0A0A0',
  },
  caption: { marginTop: 6, fontSize: 13 },
});