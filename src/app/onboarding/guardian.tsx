import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Icon } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, fontFamily, palette, radius, shadow } from "@/constants/theme";

const TEXT = {
  title: "보호자 분의 연락처를\n입력하여주세요",
  name: "성함",
  phone: "전화번호",
  relation: "관계",
  relationPlaceholder: "눌러서 선택",
};

const RELATIONS = ["자녀", "배우자", "형제·자매", "기타"];

type Guardian = { name: string; phone: string; relation: string | null };
const emptyGuardian = (): Guardian => ({ name: "", phone: "", relation: null });

const isFilled = (g: Guardian) =>
  g.name.trim() !== "" && g.phone.trim() !== "" && g.relation !== null;

export default function GuardianScreen() {
  const [guardians, setGuardians] = useState<Guardian[]>([emptyGuardian()]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const canComplete = guardians.some(isFilled);

  const update = (i: number, patch: Partial<Guardian>) =>
    setGuardians((prev) =>
      prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)),
    );

  return (
    <ScreenLayout
      onBack={() => router.back()}
      rightText="건너뛰기 없음"
      eyebrow="4 / 4"
      title={TEXT.title}
      bodyPaddingTop={57}
      footer={
        <AppButton
          label="완료하기"
          variant={canComplete ? "primary" : "outline"}
          disabled={!canComplete}
          onPress={() =>
            router.replace({
              pathname: "/link-code",
              params: { from: "onboarding" },
            })
          }
        />
      }
    >
      <View style={styles.form}>
        {guardians.map((g, i) => (
          <View key={i} style={styles.guardian}>
            <View style={styles.field}>
              <AppText
                variant="button"
                weight="semibold"
                color={palette.green600}
              >
                {TEXT.name}
              </AppText>
              <TextInput
                style={styles.input}
                value={g.name}
                onChangeText={(name) => update(i, { name })}
                accessibilityLabel={TEXT.name}
              />
            </View>

            <View style={styles.field}>
              <AppText
                variant="button"
                weight="semibold"
                color={palette.green600}
              >
                {TEXT.phone}
              </AppText>
              <TextInput
                style={styles.input}
                value={g.phone}
                onChangeText={(phone) => update(i, { phone })}
                keyboardType="phone-pad"
                accessibilityLabel={TEXT.phone}
              />
            </View>

            <View style={styles.field}>
              <AppText
                variant="button"
                weight="semibold"
                color={palette.green600}
              >
                {TEXT.relation}
              </AppText>
              <Pressable
                style={styles.select}
                onPress={() => setOpenIndex(openIndex === i ? null : i)}
                accessibilityRole="button"
                accessibilityState={{ expanded: openIndex === i }}
                accessibilityLabel={TEXT.relation}
              >
                <AppText
                  variant="button"
                  color={g.relation ? colors.text : colors.disabled}
                >
                  {g.relation ?? TEXT.relationPlaceholder}
                </AppText>
                <Icon name="arrowDown" size={20} color={colors.accent} />
              </Pressable>

              {openIndex === i && (
                <View style={styles.options}>
                  {RELATIONS.map((r) => (
                    <Pressable
                      key={r}
                      style={styles.option}
                      onPress={() => {
                        update(i, { relation: r });
                        setOpenIndex(null);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: g.relation === r }}
                    >
                      <AppText
                        variant="button"
                        color={g.relation === r ? colors.accent : colors.text}
                      >
                        {r}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        <Pressable
          style={styles.add}
          onPress={() => setGuardians((prev) => [...prev, emptyGuardian()])}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="보호자 추가"
        >
          <Icon name="plusSquare" color={colors.accent} />
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 17, paddingTop: 22 },
  guardian: { gap: 17 },
  field: { gap: 8 },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    fontSize: 18,
    fontFamily: fontFamily.regular,
    color: colors.text,
    ...shadow.card,
  },
  select: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow.card,
  },
  options: {
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  option: { height: 48, paddingHorizontal: 14, justifyContent: "center" },
  add: { alignSelf: "center" },
});
