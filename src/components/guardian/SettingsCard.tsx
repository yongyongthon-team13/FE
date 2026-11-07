// src/components/guardian/SettingsCard.tsx
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

type Props = {
  title: string;
  value: string;
  highlight?: boolean; // true: 연두 바탕 카드 / false: 흰 카드
  editing?: boolean; // true면 값을 직접 고칠 수 있음
  onChangeValue?: (text: string) => void;
};

/** 설정 항목 카드: 제목 + 값 (수정 모드에서는 입력칸) */
export function SettingsCard({ title, value, highlight, editing, onChangeValue }: Props) {
  const valueColor = highlight ? colors.textOnPrimary : palette.green300;
  return (
    <View style={[styles.card, highlight ? styles.cardHighlight : styles.cardPlain]}>
      <AppText variant="button" weight="bold" color={palette.green700}>{title}</AppText>
      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          style={[styles.input, { color: palette.green700 }]}
          placeholder={title}
          placeholderTextColor={palette.green300}
        />
      ) : (
        <AppText variant="body" color={valueColor} style={styles.value}>{value}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 100, justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 10 },
  cardHighlight: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: palette.green200,
  },
  cardPlain: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  value: { marginTop: 4 },
  input: {
    marginTop: 6,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: '#FFFFFF',
    fontSize: 18,
  },
});