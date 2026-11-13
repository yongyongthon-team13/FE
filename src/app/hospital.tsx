import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppText } from "@/components/AppText";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { colors, palette } from "@/constants/theme";

export default function HospitalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Icon name="location" size={30} />
        <AppText variant="body" weight="semibold" color={colors.accent}>
          병원 가기
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.title}>
          <AppText variant="caption" weight="medium" color={palette.green300}>
            병원 가기
          </AppText>
          <AppText variant="heading" weight="bold" color={colors.accent}>
            어떻게 도와드릴까요?
          </AppText>
        </View>

        {/* 진료과 추천 */}
        <View style={styles.mainCard}>
          <MascotWave width={100} height={100} style={styles.mascot} />
          <AppText variant="caption" weight="medium" color={colors.borderSoft}>
            진료과 추천
          </AppText>
          <AppText
            variant="heading"
            weight="bold"
            color="#FFFFFF"
            style={styles.mainTitle}
          >
            어디가 아프신가요?
          </AppText>
          <AppText variant="caption" weight="medium" color={colors.borderSoft}>
            {"아픈 곳을 말씀하시면\n가야 할 진료과를 알려드려요"}
          </AppText>
          <Pressable
            style={styles.mainButton}
            onPress={() => router.push("/symptom")}
            accessibilityRole="button"
          >
            <AppText
              variant="button"
              weight="semibold"
              color={palette.green600}
            >
              말로 알려주기
            </AppText>
          </Pressable>
        </View>

        <OptionCard
          label="병원 문자로 일정 만들기"
          title="병원 문자가 왔어요"
          desc="문자를 붙여넣으면 일정을 만들어요"
          onPress={() => router.push("/onboarding/paste-guide")}
        />
        <OptionCard
          label="직접 일정 만들기"
          title="갈 병원이 정해져 있어요"
          desc="진료과와 날짜를 말씀해 주세요"
          onPress={() =>
            router.push({
              pathname: "/onboarding/appointment-edit",
              params: {
                mode: "new",
                source: "MANUAL",
                hospital: "",
                date: "",
                time: "",
                department: "",
                scale: "",
              },
            })
          }
        />
      </ScrollView>

      <BottomNav active="route" />
    </View>
  );
}

function OptionCard({
  label,
  title,
  desc,
  onPress,
}: {
  label: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.optionCard}
      onPress={onPress}
      accessibilityRole="button"
    >
      <AppText variant="caption" weight="medium" color={palette.green300}>
        {label}
      </AppText>
      <AppText variant="heading" weight="bold" color={colors.accent}>
        {title}
      </AppText>
      <AppText variant="caption" weight="medium" color={palette.green400}>
        {desc}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 12,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 32,
    gap: 24,
  },
  title: { gap: 2, marginBottom: 12 },
  mainCard: {
    backgroundColor: colors.accent,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
    gap: 4,
  },
  mascot: { position: "absolute", top: 8, right: 8 },
  mainTitle: { marginBottom: 6 },
  mainButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 2,
  },
});
