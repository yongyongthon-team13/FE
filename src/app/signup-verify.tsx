// src/app/signup-verify.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { authErrorMessage, login, sendVerificationCode, type UserRole } from '@/api/auth';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

const CODE_LENGTH = 6;
const RESEND_WAIT_SEC = 60; // 같은 번호로는 60초에 한 번만 다시 받을 수 있음

// 인증 완료 후 이동할 화면
const NEXT_ROUTE: Record<UserRole, '/onboarding/name' | '/guardian-link'> = {
  ELDER: '/onboarding/name',
  GUARDIAN: '/guardian-link',
};

const notify = (title: string, message: string) => {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

/** 로그인 2단계: 문자로 온 인증번호 입력 → 토큰 발급·저장 */
export default function SignupVerifyScreen() {
  const { phone = '', role: roleParam } = useLocalSearchParams<{ name?: string; phone?: string; role?: string }>();
  const role: UserRole = roleParam === 'GUARDIAN' ? 'GUARDIAN' : 'ELDER';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_WAIT_SEC); // 재전송까지 남은 초

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const handleVerify = async () => {
    setBusy(true);
    try {
      await login(phone, code, role);
      router.replace(NEXT_ROUTE[role]);
    } catch (e) {
      const { title, message } = authErrorMessage(e);
      notify(title, message);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (wait > 0) return;
    try {
      await sendVerificationCode(phone);
      setWait(RESEND_WAIT_SEC);
      notify('인증번호를 다시 보냈어요', '문자를 확인해 주세요');
    } catch (e) {
      const { title, message } = authErrorMessage(e);
      notify(title, message);
    }
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={195}
      footer={
        <AppButton
          label="인증번호 전송"
          variant="primary"
          disabled={code.length < CODE_LENGTH || busy}
          onPress={handleVerify}
        />
      }
    >
      <View style={styles.titleBox}>
        <AppText variant="heading" weight="semibold" color={palette.green600} style={styles.title}>
          {'문자로 온 인증번호를\n입력해주세요'}
        </AppText>
      </View>

      <View style={styles.fields}>
        <FormField
          label="인증번호"
          value={code}
          onChangeText={text => setCode(text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={CODE_LENGTH}
          autoFocus
          right={
            <Pressable
              style={({ pressed }) => [styles.resend, wait > 0 && styles.resendWaiting, pressed && styles.resendPressed]}
              onPress={handleResend}
              disabled={wait > 0}
              accessibilityRole="button"
              accessibilityLabel={wait > 0 ? `${wait}초 뒤 재전송 가능` : '인증번호 재전송'}
            >
              <AppText variant="small" weight="semibold" color={colors.textOnPrimary} style={styles.resendText}>
                {wait > 0 ? `${wait}초` : '재전송'}
              </AppText>
            </Pressable>
          }
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  titleBox: { minHeight: 70, justifyContent: 'flex-end' },
  title: { lineHeight: 35 },
  fields: { marginTop: 25 },
  resend: {
    minWidth: 55,
    height: 35,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: palette.green600,
  },
  resendWaiting: { backgroundColor: palette.green200 },
  resendPressed: { backgroundColor: palette.green700 },
  resendText: { fontSize: 13 },
});
