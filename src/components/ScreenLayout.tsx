// src/components/ScreenLayout.tsx
import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, palette } from '@/constants/theme';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenLayout({
  onBack,
  rightText,
  eyebrow,
  title,
  description,
  children,
  footer,
  scroll = true,
  bodyPaddingTop,
}: {
  onBack?: () => void;
  rightText?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  bodyPaddingTop?: number;
}) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  const bodyStyle = [styles.bodyContent, bodyPaddingTop != null && { paddingTop: bodyPaddingTop }];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {(onBack || rightText) && (
        <View style={styles.topBar}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="이전 화면으로"
              style={styles.back}
            >
              <Icon name="back" size={30} color={colors.accent} />
              <AppText variant="body" weight="bold" color={colors.accent}>
                이전
              </AppText>
            </Pressable>
          ) : (
            <View />
          )}
          {rightText && (
            <AppText variant="body" weight="semibold" color={colors.subtle}>
              건너뛰기 없음
            </AppText>
          )}
        </View>
      )}

      <Body
        style={styles.body}
        {...(scroll
          ? { contentContainerStyle: bodyStyle }
          : { style: [styles.body, ...bodyStyle] })}
      >
        {(eyebrow || title || description) && (
          <View style={styles.header}>
            {eyebrow && (
              <AppText variant="body" color={colors.subtle}>
                {eyebrow}
              </AppText>
            )}
            {title && (
              <AppText variant="heading" weight="semibold" color={colors.heading}>
                {title}
              </AppText>
            )}
            {description && (
              <AppText variant="small" color={palette.green300}>
                {description}
              </AppText>
            )}
          </View>
        )}
        {children}
      </Body>

      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 60 }]}>
          {footer}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 128,
  },
  header: {
    gap: 14,
  },
  footer: {
    paddingHorizontal: 30,
    gap: 10,
    backgroundColor: colors.bg,
  },
});