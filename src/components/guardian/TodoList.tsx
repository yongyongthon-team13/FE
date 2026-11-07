// src/components/guardian/TodoList.tsx
import { Pressable, StyleSheet, View } from 'react-native';

import type { GuardianTodo } from '@/api/guardianHome';
import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';

import { guardianStyles } from './styles';

type Props = {
  todos: GuardianTodo[];
  onPressTodo: (todo: GuardianTodo) => void;
};

/** 확인이 필요해요 */
export function TodoList({ todos, onPressTodo }: Props) {
  if (todos.length === 0) return null;

  return (
    <>
      <AppText variant="caption" weight="bold" color={colors.accent} style={guardianStyles.sectionTitle}>
        확인이 필요해요
      </AppText>
      <View style={styles.list}>
        {todos.map(todo => (
          <View key={todo.id} style={[guardianStyles.softCard, styles.card]}>
            <View style={styles.icon}>
              <Icon name={todo.kind === 'smsMissing' ? 'chat' : 'clipboard'} size={22} color={colors.accent} />
            </View>
            <View style={styles.text}>
              <AppText variant="caption" weight="semibold" color={palette.green700} style={styles.title} numberOfLines={1}>
                {todo.title}
              </AppText>
              <AppText variant="small" color={palette.green300} style={guardianStyles.smallText} numberOfLines={1}>
                {todo.sub}
              </AppText>
            </View>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={() => onPressTodo(todo)}
              accessibilityRole="button"
            >
              <AppText variant="small" weight="bold" color={colors.textOnPrimary}>{todo.actionLabel}</AppText>
            </Pressable>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: 5 },
  card: { flexDirection: 'row', alignItems: 'center', minHeight: 59, paddingHorizontal: 13, gap: 4 },
  icon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, marginLeft: 4 },
  title: { fontSize: 15, lineHeight: 20 },
  button: {
    width: 44,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  buttonPressed: { backgroundColor: palette.green600 },
});