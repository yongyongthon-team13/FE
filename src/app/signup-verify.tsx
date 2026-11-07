// src/app/signup-verify.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { sendVerificationCode, verifyCode } from '@/api/auth';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

const CODE_LENGTH = 6;
// TODO: 가입 후 이동할 화면 ('어르신으로 시작하기'가 원래 가던 경로로 바꾸기)
const NEXT_ROUTE = '/onboarding/name';

const notify = (title: string, message: string) => {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

/** 어르신 회원가입 2단계: 문자로 온 인증번호 입력 */
export default function SignupVerifyScreen() {
  const { name = '', phone = '' } = useLocalSearchParams<{ name?: string; phone?: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const handleVerify = async () => {
    setBusy(true);
    try {
      await verifyCode(phone, code);
      router.replace(NEXT_ROUTE);
    } catch {
      notify('인증번호가 맞지 않아요', '문자로 온 번호를 다시 확인해 주세요');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendVerificationCode(name, phone);
      notify('인증번호를 다시 보냈어요', '문자를 확인해 주세요');
    } catch {
      notify('인증번호를 보내지 못했어요', '잠시 후 다시 시도해 주세요');
    }
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={195}
      footer={
        <AppButton
          label="인증번호 확인하기"
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
              style={({ pressed }) => [styles.resend, pressed && styles.resendPressed]}
              onPress={handleResend}
              accessibilityRole="button"
            >
              <AppText variant="small" weight="semibold" color={colors.textOnPrimary} style={styles.resendText}>
                재전송
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
    height: 35,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: palette.green600,
  },
  resendPressed: { backgroundColor: palette.green700 },
  resendText: { fontSize: 13 },
});