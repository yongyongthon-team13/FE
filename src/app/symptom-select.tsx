import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

// 위험 증상: 고르면 바로 119 안내 화면으로
const EMERGENCY = '가슴이 짓눌리는 느낌';

// 버튼 문구 → 불편한 곳 / 추천 진료과
const DEPARTMENTS: Record<string, { area: string; department: string }> = {
  '눈이 불편해요': { area: '눈', department: '안과' },
  '뼈 · 관절 · 허리가 아파요': { area: '뼈 · 관절 · 허리', department: '정형외과' },
  '귀 · 코 · 목이 불편해요': { area: '귀 · 코 · 목', department: '이비인후과' },
  '이 · 잇몸이 아파요': { area: '이 · 잇몸', department: '치과' },
  '배가 아프거나 소화가 안 돼요': { area: '배 · 소화', department: '내과' },
};

const OPTIONS = [...Object.keys(DEPARTMENTS), EMERGENCY];

/** 진료과 추천 3단계: 불편한 곳 고르기 */
export default function SymptomSelectScreen() {
  const { symptom, when } = useLocalSearchParams<{ symptom?: string; when?: string }>();
  const [selected, setSelected] = useState<string | null>(null);

  const handleDone = () => {
    if (!selected) return;
    const { area, department } = DEPARTMENTS[selected];
    router.push({
      pathname: '/department',
      params: { area, department, symptom: symptom ?? '', when: when ?? '' },
    });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow="진료과 추천"
      title={'어디가\n불편하세요?'}
      footer={<AppButton label="완료하기" variant="primary" onPress={handleDone} disabled={!selected} />}
    >
      <View style={styles.list}>
        {OPTIONS.map(option => {
          const isSelected = option === selected;
          return (
            <Pressable
              key={option}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => {
                if (option === EMERGENCY) {
                  router.push('/emergency');
                  return;
                }
                setSelected(option);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <AppText variant="button" weight="semibold" color={isSelected ? '#FFFFFF' : palette.green600}>
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 40, gap: 8 },
  option: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#213314',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
});
