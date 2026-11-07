import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getTodayWeather, type TodayWeather } from '@/api/weather';
import MascotWave from '@/assets/images/mascot-wave.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

type Condition = 'great' | 'good' | 'bad';

const CONDITIONS: { key: Condition; icon: IconName; label: string }[] = [
  { key: 'great', icon: 'faceGreat', label: '아주 좋아요' },
  { key: 'good', icon: 'faceGood', label: '괜찮아요' },
  { key: 'bad', icon: 'faceBad', label: '안 좋아요' },
];

export default function TodayConditionScreen() {
  // 차 부르기 화면에서 넘어왔으면 car 파라미터가 있음
  const { car } = useLocalSearchParams<{ car?: string }>();
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [cane, setCane] = useState<boolean | null>(null);

  useEffect(() => {
    getTodayWeather().then(setWeather);
  }, []);

  const weatherLabel = weather ? (weather.alert ? weather.alertLabel : '날씨 괜찮음') : ' ';
  const canDepart = condition !== null && cane !== null;

  const handleDepart = () => {
    // TODO: 오늘 컨디션(condition)·지팡이 사용(cane) 저장 API 연동
    if (condition === 'bad' && !car) {
      // 몸이 좋지 않으면 차량 다시 추천
      router.push('/car-select');
      return;
    }
    // TODO: 출발 후 이어질 화면 연결
      router.replace('/guide');
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={22}
      footer={<AppButton label="출발할게요" variant="primary" disabled={!canDepart} onPress={handleDepart} />}
    >
      <View style={styles.mascot}>
        <MascotWave width={110} height={110} />
      </View>

      <AppText variant="caption" weight="medium" color={palette.green200} style={styles.eyebrow}>
        {`${weatherLabel} · 출발 전`}
      </AppText>
      <AppText variant="body" weight="bold" color={palette.green600}>
        오늘 몸은 어떠세요?
      </AppText>

      <View style={styles.faces}>
        {CONDITIONS.map(c => {
          const selected = condition === c.key;
          const dimmed = condition !== null && !selected;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCondition(c.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={c.label}
              hitSlop={8}
            >
              <Icon name={c.icon} size={50} color={dimmed ? palette.green200 : colors.accent} />
            </Pressable>
          );
        })}
      </View>

      <AppText variant="body" weight="bold" color={palette.green600} style={styles.question}>
        오늘 지팡이를 사용하시나요?
      </AppText>

      <View style={styles.toggles}>
        {[
          { value: true, label: '네' },
          { value: false, label: '아니요' },
        ].map(opt => {
          const selected = cane === opt.value;
          return (
            <Pressable
              key={opt.label}
              style={[styles.toggle, selected && styles.toggleSelected]}
              onPress={() => setCane(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <AppText variant="heading" weight="bold" color={selected ? colors.textOnPrimary : palette.green600}>
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText variant="caption" weight="medium" color={palette.green300} style={styles.hint}>
        몸이 좋지 않으면 차량을 추천드려요
      </AppText>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: 'center' },
  eyebrow: { marginTop: 14 },
  faces: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 30 },
  question: { marginTop: 30 },
  toggles: { marginTop: 14, flexDirection: 'row', gap: 20 },
  toggle: {
    flex: 1,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  toggleSelected: {
    backgroundColor: palette.green400,
    borderColor: palette.green600,
    borderWidth: 2,
  },
  hint: { marginTop: 26 },
});