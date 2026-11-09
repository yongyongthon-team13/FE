import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BottomNav } from '@/components/BottomNav';
import { SettingsCard } from '@/components/guardian/SettingsCard';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

type Section = { id: string; title: string; value: string };

// TODO: 어르신 정보 API 연동 (조회 / 수정)
const INITIAL: Section[] = [
  { id: 'me', title: '나의 정보', value: '김영자 · 72세 · 처인구' },
  { id: 'health', title: '평소 이동 · 건강', value: '지팡이 · 계단 어려움' },
  { id: 'display', title: '글자 · 음성', value: '글자 크게 · 음성 안내 켜짐' },
  { id: 'guardian', title: '보호자', value: '김민수 외 1명' },
];

/** 어르신: 내 정보 (내용 수정하기 → 값 직접 수정 → 저장하기) */
export default function MyInfoScreen() {
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<Section[]>(INITIAL);
  const [draft, setDraft] = useState<Section[]>([]);
  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    setDraft(sections);
    setEditing(true);
  };

  const save = () => {
    setSections(draft);
    setEditing(false);
  };

  const list = editing ? draft : sections;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Icon name="profileList" size={30} />
        <AppText variant="body" weight="semibold" color={colors.accent}>내 정보</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <AppText variant="button" color={palette.green200}>어르신</AppText>
        <AppText variant="heading" weight="semibold" color={palette.green600}>내 정보</AppText>

        <View style={styles.list}>
          {list.map((section, i) => (
            <SettingsCard
              key={section.id}
              title={section.title}
              value={section.value}
              highlight={i % 2 === 0}
              editing={editing}
              onChangeValue={text =>
                setDraft(prev => prev.map(s => (s.id === section.id ? { ...s, value: text } : s)))
              }
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
          onPress={editing ? save : startEdit}
          accessibilityRole="button"
        >
          <AppText variant="small" weight="semibold" color={colors.textOnPrimary}>
            {editing ? '저장하기' : '내용 수정하기'}
          </AppText>
          {!editing && <Icon name="edit" size={16} color={colors.textOnPrimary} />}
        </Pressable>
      </ScrollView>

      <BottomNav active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { height: 70, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 12 },
  body: { paddingHorizontal: 30, paddingTop: 30, paddingBottom: 40 },
  list: { marginTop: 26, gap: 20 },
  editButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 41,
    marginTop: 20,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: palette.green400,
  },
  editButtonPressed: { backgroundColor: palette.green500 },
});
