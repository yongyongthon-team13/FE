// src/components/FormField.tsx
import type { ComponentProps, ReactNode } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = ComponentProps<typeof TextInput> & {
  label: string;
  right?: ReactNode; // 입력칸 오른쪽에 붙는 요소 (예: 재전송 버튼)
};

/** 라벨 + 입력칸 */
export function FormField({ label, right, style, ...inputProps }: Props) {
  return (
    <View>
      <AppText variant="button" weight="medium" color={palette.green600} style={styles.label}>
        {label}
      </AppText>
      <View style={styles.box}>
        <TextInput
          placeholderTextColor={palette.green200}
          {...inputProps}
          style={[styles.input, style]}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 4 },
  box: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  input: {
    flex: 1,
    minWidth: 0, // 웹에서 입력칸이 오른쪽 버튼을 밀어내지 않게
    height: '100%',
    fontSize: 18,
    color: palette.green700,
    // 웹에서 클릭 시 생기는 검은 테두리 없애기
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
});