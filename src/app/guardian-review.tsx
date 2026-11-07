// src/app/guardian-review.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getReviewForm, submitReview, type ReviewForm } from '@/api/guardianReview';
import MascotWave from '@/assets/images/mascot-wave.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ReviewQuestionView } from '@/components/guardian/ReviewQuestionView';
import { colors, palette } from '@/constants/theme';

/** 보호자: 지난 진료 후기 작성 */
export default function GuardianReviewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [form, setForm] = useState<ReviewForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getReviewForm(id ?? 'mock-review').then(setForm);
  }, [id]);

  if (!form) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const allAnswered = form.questions.every(q => answers[q.id]);

  const handleSave = async () => {
    setBusy(true);
    try {
      await submitReview(form.id, answers);
      router.replace('/guardian-home');
    } catch {
      Alert.alert('저장하지 못했어요', '잠시 후 다시 시도해 주세요');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.mascot}>
          <MascotWave width={140} height={140} />
        </View>

        <AppText variant="heading" weight="semibold" color={palette.green600} style={styles.title}>
          {form.title}
        </AppText>

        <View style={styles.questions}>
          {form.questions.map(q => (
            <ReviewQuestionView
              key={q.id}
              question={q}
              selected={answers[q.id]}
              onSelect={value => setAnswers(prev => ({ ...prev, [q.id]: value }))}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton label="저장하기" variant="primary" disabled={!allAnswered || busy} onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 44, paddingBottom: 24 },
  mascot: { alignItems: 'center' },
  title: { marginTop: 26 },
  questions: { marginTop: 46, gap: 42 },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});