// src/app/signup-verify.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { authErrorMessage, login, sendVerificationCode, type UserRole } from '@/api/auth';
import { ensureElderId } from '@/api/elderProfile';
import { ensureGuardianElderId } from '@/api/link';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

const CODE_LENGTH = 6;
const RESEND_WAIT_SEC = 60; // 같은 번호로는 60초에 한 번만 다시 받을 수 있음

/** 인증 완료 후 이동할 화면: 처음이면 온보딩·연결, 이미 했으면 홈 (온보딩은 한 번만) */
async function nextRoute(role: UserRole) {
  if (role === 'ELDER') {
    // 서버에 어르신 프로필이 있으면 온보딩을 이미 마친 것
    const elderId = await ensureElderId().catch(() => null);
    return elderId ? '/home' : '/onboarding/intro';
  }
  // 이미 연결된 어르신이 있으면 보호자 홈
  const elderId = await ensureGuardianElderId().catch(() => null);
  return elderId ? '/guardian-home' : '/guardian-link';
}

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
      router.replace(await nextRoute(role));
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
