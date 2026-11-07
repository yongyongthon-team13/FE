// src/app/onboarding/personal-confirm.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, fontFamily, fontSize, shadow } from '@/constants/theme';

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <AppText variant="body" weight="semibold" color={colors.heading}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
  );
}

export default function ConfirmScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="1 / 4"
      title={'해당 정보가 맞는지\n확인해주세요'}
      description="잘못 기재된 내용은 바로 수정이 가능해요"
      footer={<AppButton label="이 내용이 맞아요" variant="primary" onPress={() => router.push('/onboarding/mobility')} />}
    >
      <View style={styles.form}>
        <Field label="성함" value={name} onChangeText={setName} />
        <Field label="나이" value={age} onChangeText={setAge} keyboardType="number-pad" />
        <Field label="집 주소" value={address} onChangeText={setAddress} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingTop: 18,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.text,
    shadowColor: shadow.button.shadowColor,
    shadowOpacity: shadow.button.shadowOpacity,
    shadowRadius: shadow.button.shadowRadius,
    shadowOffset: shadow.button.shadowOffset,
    elevation: shadow.button.elevation,
  },
});