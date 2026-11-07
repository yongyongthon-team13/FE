// src/components/guardian/ElderMapPreview.tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';

/** 진료 당일 이동 중: 어르신 현재 위치 지도 (자리만 잡아둔 상태) */
// TODO: 실제 지도(어르신 현재 위치)로 교체
export function ElderMapPreview() {
  return (
    <View style={styles.box}>
      <AppText variant="small" color="#9AA391">지도 · 어머니 위치</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 96,
    marginTop: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EBE4',
  },
});