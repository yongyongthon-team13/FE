// src/components/guardian/ReviewQuestionView.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import type { ReviewQuestion } from '@/api/guardianReview';
import { AppText } from '@/components/AppText';
import { colors, palette } from '@/constants/theme';

import { guardianStyles } from './styles';

type Props = {
  question: ReviewQuestion;
  selected?: string;
  onSelect: (value: string) => void;
};

/** 후기 질문 하나: 질문 + 고르는 버튼들 */
export function ReviewQuestionView({ question, selected, onSelect }: Props) {
  return (
    <View>
      <AppText variant="button" weight="semibold" color={colors.accent}>{question.label}</AppText>
      <View style={styles.options}>
        {question.options.map(option => {
          const on = option.value === selected;
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                on ? styles.optionOn : [guardianStyles.softCard, styles.optionOff],
                styles.option,
                pressed && !on && guardianStyles.pressed,
              ]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <AppText variant="button" weight="semibold" color={on ? colors.textOnPrimary : colors.accent}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', gap: 21, marginTop: 8 },
  option: { flex: 1, height: 60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  optionOff: {},
  optionOn: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.green600,
    backgroundColor: palette.green400,
  },
});