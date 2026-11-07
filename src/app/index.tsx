// src/app/index.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import MascotWave from '@/assets/images/mascot-wave.svg';
import { AppButton } from '@/components/AppButton';
import { colors, fontFamily, fontSize } from '@/constants/theme';

export default function StartScreen() {
  return (
    <View style={styles.container}>
      <MascotWave width={116} height={116} />

      <Text style={styles.title}>{'병원 가는 길,\n함께 할게요'}</Text>

      <View style={styles.buttons}>
        <AppButton label="어르신으로 시작하기" variant="primary" onPress={() => router.push('/signup')} />
        <AppButton label="보호자로 시작하기" variant="soft" onPress={() => router.push('/guardian-link')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingTop: 249,
    paddingHorizontal: 30,
  },
  title: {
    marginTop: 30,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    lineHeight: 38,
    color: colors.accent,
    textAlign: 'center',
  },
  buttons: {
    alignSelf: 'stretch',
    marginTop: 30,
    gap: 24,
  },
});