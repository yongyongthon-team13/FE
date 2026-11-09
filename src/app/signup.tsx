// src/app/signup.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { authErrorMessage, sendVerificationCode, type UserRole } from '@/api/auth';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { ScreenLayout } from '@/components/ScreenLayout';
import { palette } from '@/constants/theme';
import { onboarding } from '@/store/onboarding';

/** 로그인 1단계: 이름·전화번호 입력 → 인증번호 전송 (어르신·보호자 공통, ?role=GUARDIAN) */
export default function SignupScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: UserRole = roleParam === 'GUARDIAN' ? 'GUARDIAN' : 'ELDER';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const canSend = name.trim().length > 0 && /^01\d{8,9}$/.test(phone);

  const handleSend = async () => {
    setBusy(true);
    try {
      await sendVerificationCode(phone);
      if (role === 'ELDER') onboarding.name = name.trim(); // 온보딩 끝에 프로필 등록 API로 보냄
      router.push({ pathname: '/signup-verify', params: { name: name.trim(), phone, role } });
    } catch (e) {
      const { title, message } = authErrorMessage(e);
      if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
      else Alert.alert(title, message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={195}
      footer={<AppButton label="인증번호 전송" variant="primary" disabled={!canSend || busy} onPress={handleSend} />}
    >
      <View style={styles.titleBox}>
        <AppText variant="heading" weight="semibold" color={palette.green600} style={styles.title}>
          휴대폰 전화를 인증해주세요
        </AppText>
      </View>

      <View style={styles.fields}>
        <FormField
          label="이름"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <FormField
          label="전화번호"
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 11))}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={11}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  // 두 단계 화면의 제목 아래 끝을 맞추려고 높이를 고정 (제목은 아래쪽 정렬)
  titleBox: { minHeight: 70, justifyContent: 'flex-end' },
  title: { lineHeight: 35 },
  fields: { marginTop: 25, gap: 13 },
});