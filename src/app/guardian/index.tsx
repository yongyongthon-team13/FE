import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

// TODO: 보호자 화면
export default function GuardianHomeScreen() {
  return (
    <View style={styles.screen}>
      <AppText variant="body" color={colors.accent} onPress={() => router.back()}>
        보호자 화면 (준비 중)
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});