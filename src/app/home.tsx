import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { loadMyAppointments } from "@/api/appointments";
import { getPrimaryGuardian } from "@/api/guardian";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { colors, palette, radius, shadow } from "@/constants/theme";
import { callPhone } from "@/lib/call";
import { useAppointments, type Appointment } from "@/store/appointments";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const appointments = useAppointments();

  // 연결된 보호자에게 전화
  const callGuardian = async () => {
    const guardian = await getPrimaryGuardian();
    if (guardian) {
      callPhone(guardian.phone, guardian.name || "보호자");
      return;
    }
    const title = "연결된 보호자가 없어요";
    const message =
      "내 정보에서 '보호자 연결 번호 보기'를 눌러 보호자와 연결해 주세요";
    if (Platform.OS === "web") window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };
  // 홈에 올 때마다 서버 일정 다시 불러오기
  useFocusEffect(
    useCallback(() => {
      loadMyAppointments().catch(() => {});
    }, []),
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="home" size={30} />
          <AppText variant="body" weight="semibold" color={colors.accent}>
            홈
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.map((item, i) => (
          <AppointmentCard key={item.id} item={item} showRoute={i === 0} />
        ))}

        <AppButton
          label="일정 추가하기"
          variant="outline"
          icon="plusSquare"
          onPress={() => router.push("/onboarding/paste-guide")}
        />

        <Pressable
          style={styles.pill}
          onPress={callGuardian}
          accessibilityRole="button"
        >
          <AppText variant="caption" weight="semibold" color={colors.accent}>
            보호자에게 연락
          </AppText>
          <Icon name="phone" />
        </Pressable>
      </ScrollView>

      <BottomNav active="home" />
    </View>
  );
}

function AppointmentCard({
  item,
  showRoute,
}: {
  item: Appointment;
  showRoute: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <AppText variant="caption" weight="medium" color={palette.green300}>
          다음 병원 일정
        </AppText>
        <AppText
          variant="heading"
          weight="bold"
          color={colors.accent}
        >{`${item.date} ${item.time}`}</AppText>
        <AppText
          variant="caption"
          weight="medium"
          color={palette.green300}
        >{`${item.hospital} ${item.department}`}</AppText>
      </View>

      {item.companion && (
        <View style={styles.companion}>
          <View style={styles.companionRow}>
            <Icon name="van" color={colors.textOnPrimary} />
            <AppText
              variant="caption"
              weight="medium"
              color={colors.textOnPrimary}
              style={styles.companionText}
            >
              {item.companion.service}
            </AppText>
          </View>
          <View style={styles.companionRow}>
            <Icon name="person" color={colors.textOnPrimary} />
            <AppText
              variant="caption"
              weight="medium"
              color={colors.textOnPrimary}
              style={styles.companionText}
            >
              {item.companion.manager}
            </AppText>
          </View>
        </View>
      )}

      {showRoute && (
        <Pressable
          style={({ pressed }) => [
            styles.routeButton,
            pressed && { backgroundColor: palette.green600 },
          ]}
          onPress={() =>
            router.push({ pathname: "/route-preview", params: { id: item.id } })
          }
          accessibilityRole="button"
        >
          <AppText
            variant="button"
            weight="semibold"
            color={colors.textOnPrimary}
          >
            병원까지 경로 미리보기
          </AppText>
          <Icon name="play" color={colors.textOnPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 11,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  content: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  info: { paddingHorizontal: 6, gap: 2 },
  companion: {
    backgroundColor: colors.accent,
    borderRadius: radius.base,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  companionRow: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  companionText: { flex: 1, minWidth: 0 },
  routeButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadow.button,
  },
  pill: {
    alignSelf: "flex-start",
    height: 33,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
