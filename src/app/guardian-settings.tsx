// src/app/guardian-settings.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logout } from '@/api/auth';
import { getGuardianSettings, updateGuardianSettings, type SettingsSection } from '@/api/guardianSettings';
import { unlinkGuardian } from '@/api/link';
import { AppText } from '@/components/AppText';
import { SettingsCard } from '@/components/guardian/SettingsCard';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

/** 보호자: 설정 (내용 수정하기 → 값 직접 수정 → 저장하기) */
export default function GuardianSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<SettingsSection[] | null>(null);
  const [draft, setDraft] = useState<SettingsSection[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getGuardianSettings().then(setSections);
  }, []);

  if (!sections) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const startEdit = () => {
    setDraft(sections);
    setEditing(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateGuardianSettings(draft);
      setSections(draft);
      setEditing(false);
    } catch {
      Alert.alert('저장하지 못했어요', '잠시 후 다시 시도해 주세요');
    } finally {
      setBusy(false);
    }
  };

  const list = editing ? draft : sections;

  const unlink = async () => {
    setBusy(true);
    try {
      await unlinkGuardian();
      router.replace('/'); // 연결이 끊기면 첫 화면으로
    } catch {
      Alert.alert('해제하지 못했어요', '잠시 후 다시 시도해 주세요');
      setBusy(false);
    }
  };

  const confirmLogout = () => {
    const title = '로그아웃할까요?';
    const message = '다시 들어올 때 문자 인증을 한 번 더 받아야 해요.';
    // 웹에서는 Alert.alert가 동작하지 않아 브라우저 확인창 사용
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) logout();
      return;
    }
    Alert.alert(title, message, [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: () => logout() },
    ]);
  };

  const confirmUnlink = () => {
    const title = '보호자 연결을 해제할까요?';
    const message = '해제하면 어머니의 병원 일정과 이동 알림을 더 이상 받을 수 없어요.';
    // 웹에서는 Alert.alert가 동작하지 않아 브라우저 확인창 사용
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) unlink();
      return;
    }
    Alert.alert(title, message, [
      { text: '취소', style: 'cancel' },
      { text: '해제하기', style: 'destructive', onPress: unlink },
    ]);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/guardian-home');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="돌아가기"
        >
          <Icon name="back" size={22} color={palette.green600} />
          <AppText variant="caption" weight="semibold" color={palette.green600}>돌아가기</AppText>
        </Pressable>

        <AppText variant="button" color={palette.green200}>보호자</AppText>
        <AppText variant="heading" weight="semibold" color={palette.green600}>설정</AppText>

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
          disabled={busy}
          accessibilityRole="button"
        >
          <AppText variant="small" weight="semibold" color={colors.textOnPrimary}>
            {editing ? '저장하기' : '내용 수정하기'}
          </AppText>
          {!editing && <Icon name="edit" size={16} color={colors.textOnPrimary} />}
        </Pressable>

        {!editing && (
          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={confirmLogout}
            disabled={busy}
            accessibilityRole="button"
          >
            <AppText variant="caption" weight="semibold" color={colors.accent}>로그아웃</AppText>
          </Pressable>
        )}

        {!editing && (
          <Pressable
            style={({ pressed }) => [styles.unlinkButton, pressed && styles.unlinkButtonPressed]}
            onPress={confirmUnlink}
            disabled={busy}
            accessibilityRole="button"
          >
            <AppText variant="caption" weight="semibold" color={UNLINK_RED}>보호자 연결 해제</AppText>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const UNLINK_RED = '#CC0000';

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 30 },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 40,
    marginLeft: -8,
    marginBottom: 23,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  backButtonPressed: { backgroundColor: '#F3F7EE' },
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
  logoutButton: {
    alignSelf: 'center',
    height: 44,
    marginTop: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
  },
  logoutButtonPressed: { backgroundColor: '#F3F7EE' },
  unlinkButton: {
    alignSelf: 'center',
    height: 44,
    marginTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: UNLINK_RED,
    backgroundColor: '#FFFFFF',
  },
  unlinkButtonPressed: { backgroundColor: '#FDF0F0' },
});