import { isDraftComplete, type AppointmentDraft } from '@/api/appointments';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors, palette, radius } from '@/constants/theme';
import { addAppointment } from '@/store/appointments';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Params = AppointmentDraft & { mode?: 'missing' | 'edit' };

const FIELDS: { key: keyof AppointmentDraft; label: string }[] = [
  { key: 'hospital', label: '병원' },
  { key: 'date', label: '날짜' },
  { key: 'time', label: '시간' },
  { key: 'department', label: '진료과' },
  { key: 'scale', label: '규모' },
];

export default function AppointmentEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [draft, setDraft] = useState<AppointmentDraft>({
    hospital: params.hospital ?? '',
    date: params.date ?? '',
    time: params.time ?? '',
    department: params.department ?? '',
    scale: params.scale ?? '',
  });

  const title = params.mode === 'edit' ? '일정을 수정해주세요' : '일부를 못 읽었어요';

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.header}>
          <AppText variant="body" color={palette.green200}>병원 일정 등록</AppText>
          <AppText variant="heading" weight="semibold" color={colors.heading}>{title}</AppText>
        </View>

        <View style={styles.box}>
          {FIELDS.map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <AppText variant="button" color={colors.subtle}>{label}</AppText>
              <TextInput
                style={styles.input}
                value={draft[key]}
                onChangeText={text => setDraft(prev => ({ ...prev, [key]: text }))}
                placeholder="(눌러서 입력)"
                placeholderTextColor={palette.green700}
                accessibilityLabel={label}
              />
            </View>
          ))}
        </View>

        <AppText variant="body" color={palette.green200} style={styles.notice}>
          {'보호자에게 대신 입력을\n부탁할 수 있어요'}
        </AppText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        {/* TODO: 보호자 화면 만들 때 보호자에게 알림 보내기 연결 */}
        <AppButton label="보호자에게 부탁하기" variant="secondary" onPress={() => {}} />
        <AppButton
          label="완료하기"
          variant="primary"
          disabled={!isDraftComplete(draft)}
          onPress={() => {
            const id = addAppointment(draft);
            router.replace({ pathname: '/companion', params: { id } });
        }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  body: { paddingHorizontal: 30, paddingTop: 160 },
  header: { gap: 4 },
  box: {
    marginTop: 34,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.base,
    paddingVertical: 25,
    paddingLeft: 20,
    paddingRight: 22,
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  },
  label: {
    width: 56,          // 라벨 고정 폭
    flexShrink: 0,      // 라벨은 절대 안 줄어들게
  },
  input: {
    flex: 1,            // 남은 공간만 차지
    minWidth: 0,        // 좁으면 줄어들 수 있게
    textAlign: 'right',
    // width: ...  ← 고정 width 있으면 삭제
  },
  notice: { marginTop: 8 },
  footer: { paddingHorizontal: 30, gap: 10 },
});