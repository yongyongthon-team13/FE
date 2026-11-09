import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

type NearbyHospital = { id: string; name: string; stopDistance: number; size: string };

// TODO: 현재 위치 기준 가까운 병원 API 연동 (지금은 임시 데이터)
function getNearbyHospitals(department: string): NearbyHospital[] {
  return [
    { id: '1', name: `OO${department}`, stopDistance: 100, size: '소' },
    { id: '2', name: `△△${department}`, stopDistance: 150, size: '소' },
    { id: '3', name: `□□${department}`, stopDistance: 200, size: '소' },
  ];
}

/** 진료과 추천: 가까운 병원 고르기 */
export default function HospitalSelectScreen() {
  const { department, symptom, when } = useLocalSearchParams<{
    department: string;
    symptom?: string;
    when?: string;
  }>();
  const hospitals = getNearbyHospitals(department ?? '');
  const [selected, setSelected] = useState<string | null>(null);

  const handleDone = () => {
    const hospital = hospitals.find(h => h.id === selected);
    if (!hospital) return;
    router.push({
      pathname: '/visit-confirm',
      params: {
        hospital: hospital.name,
        size: hospital.size,
        department: department ?? '',
        symptom: symptom ?? '',
        when: when ?? '',
      },
    });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow="진료과 추천"
      title={`가까운 ${department}예요\n한 곳을 골라 주세요`}
      footer={<AppButton label="완료하기" variant="primary" onPress={handleDone} disabled={!selected} />}
    >
      <View style={styles.list}>
        {hospitals.map(h => {
          const isSelected = h.id === selected;
          return (
            <Pressable
              key={h.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(h.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <AppText variant="button" weight="semibold" color={isSelected ? '#FFFFFF' : palette.green600}>
                {`${h.name} · 정류장 ${h.stopDistance}m`}
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
