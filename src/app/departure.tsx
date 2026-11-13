import { getDeparturePlan, type DeparturePlan } from "@/api/routes";
import MascotHeart from "@/assets/images/mascot-heart.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Icon, type IconName } from "@/components/Icon";
import { colors, palette } from "@/constants/theme";
import { scheduleDepartureAlarm, type AlarmOption } from "@/lib/alarm";
import { useAppointments } from "@/store/appointments";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OPTIONS: { key: AlarmOption; icon: IconName; label: string }[] = [
  { key: "nightBefore", icon: "night", label: "전날 저녁에\n알림을 받을래요" },
  {
    key: "hourBefore",
    icon: "alarm",
    label: "출발 1시간 전에\n알림을 받을래요",
  },
];

export default function DepartureScreen() {
  const insets = useSafeAreaInsets();
  const { id, appointmentId } = useLocalSearchParams<{
    id: string;
    appointmentId?: string;
  }>();
  const appointments = useAppointments();
  const apptId = appointmentId ?? appointments[0]?.id; // id 없이 오면 가장 가까운 일정
  const [plan, setPlan] = useState<DeparturePlan | null>(null);
  const [failed, setFailed] = useState(false);
  const [alarm, setAlarm] = useState<AlarmOption | null>(null);

  useEffect(() => {
    if (!apptId) return;
    getDeparturePlan(id, apptId)
      .then(setPlan)
      .catch(() => setFailed(true));
  }, [id, apptId]);

  const handleSave = async () => {
    if (!plan || !alarm || !apptId) return;
    const base = {
      appointmentId: apptId,
      departDate: plan.departDate,
      departAt: plan.departAt,
      hospital: plan.hospital,
      appointmentTime: plan.appointmentTime,
    };
    // 당일 안내 화면으로 이어지는 '출발 1시간 전' 알림은 항상 예약
    await scheduleDepartureAlarm({ ...base, option: "hourBefore" });
    // '전날 저녁'을 고르면 전날 알림도 함께
    if (alarm === "nightBefore")
      await scheduleDepartureAlarm({ ...base, option: "nightBefore" });
    router.dismissTo("/home");
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <View style={styles.top}>
          <View style={styles.pill}>
            <AppText variant="small" weight="medium" color="#2B2B2B">
              이때 나가시면 돼요
            </AppText>
          </View>
          <MascotHeart width={115} height={128} />
        </View>

        <View style={styles.timeCard}>
          <AppText variant="title" weight="bold" color={colors.accent}>
            {plan?.departAt ?? (failed ? "-" : " ")}
          </AppText>
          <AppText variant="button" weight="medium" color={colors.accent}>
            {plan
              ? `${plan.arriveAt} 병원 도착 예상`
              : failed
                ? "진료 시간을 확인하지 못했어요"
                : " "}
          </AppText>
        </View>

        <View style={styles.notice}>
          <AppText
            variant="button"
            weight="medium"
            color={palette.green400}
            style={styles.noticeText}
          >
            {"당일 아침 버스 상황을 고려하여\n다시 알려드립니다"}
          </AppText>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const selected = alarm === opt.key;
            const color = selected ? colors.textOnPrimary : colors.accent;
            return (
              <Pressable
                key={opt.key}
                style={[styles.tile, selected && styles.tileSelected]}
                onPress={() => setAlarm(opt.key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={opt.label.replace("\n", " ")}
              >
                <Icon name={opt.icon} size={45} color={color} />
                <AppText
                  variant="button"
                  weight="medium"
                  color={color}
                  style={styles.tileText}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton
          label="저장하기"
          variant="primary"
          disabled={!alarm || !plan}
          onPress={handleSave}
        />
      </View>
    </View>
  );
}

const shadowCard = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 30, paddingTop: 48, paddingBottom: 24 },
  top: { alignItems: "center", gap: 14 },
  pill: {
    height: 32,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#7A7A7A",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  timeCard: {
    marginTop: 43,
    minHeight: 111,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    ...shadowCard,
  },
  notice: { marginTop: 40 },
  noticeText: { lineHeight: 28 },
  options: { marginTop: 40, flexDirection: "row", gap: 20 },
  tile: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 6,
    ...shadowCard,
  },
  tileSelected: { backgroundColor: colors.accent },
  tileText: { textAlign: "center", lineHeight: 26 },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});
