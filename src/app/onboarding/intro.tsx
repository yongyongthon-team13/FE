import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

export default function OnboardingIntroScreen() {
  const goNext = () => router.replace('/onboarding/birth-year');

  useEffect(() => {
    const timer = setTimeout(goNext, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.screen} onPress={goNext} accessibilityRole="button" accessibilityLabel="다음으로">
      <AppText variant="title" weight="bold" color={colors.accent} style={styles.text}>
        {'지금부터\n드리는 질문들에\n핸드폰을 향해\n대답해주세요'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 36,
    lineHeight: 49,
    textAlign: 'center',
  },
});