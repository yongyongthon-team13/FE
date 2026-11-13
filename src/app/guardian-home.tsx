// src/app/guardian-home.tsx
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { recordGuardianContact } from "@/api/guardianData";
import {
  getGuardianHome,
  type ElderStatus,
  type GuardianHome,
} from "@/api/guardianHome";
import { ElderMapPreview } from "@/components/guardian/ElderMapPreview";
import { GuardianBottomNav } from "@/components/guardian/GuardianBottomNav";
import { GuardianHeader } from "@/components/guardian/GuardianHeader";
import { NextVisitCard } from "@/components/guardian/NextVisitCard";
import { QuickActions } from "@/components/guardian/QuickActions";
import { TodayLogList } from "@/components/guardian/TodayLogList";
import { TodayTripCard } from "@/components/guardian/TodayTripCard";
import { TodoList } from "@/components/guardian/TodoList";
import { UpcomingList } from "@/components/guardian/UpcomingList";
import { colors } from "@/constants/theme";
import { callPhone, textPhone } from "@/lib/call";

/** 보호자 홈 (평소 / 진료 당일 이동 중) */
export default function GuardianHomeScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<GuardianHome | null>(null);

  const prevStatus = useRef<ElderStatus | null>(null);

  // 30초마다 다시 불러오기 (이동 중 상태·위치 확인 시각 갱신)
  // 보고 있는 중에 '이동 중' → '도착 완료'로 바뀌면 도착 화면 띄우기
  useEffect(() => {
    const load = () =>
      getGuardianHome()
        .then((next) => {
          const was = prevStatus.current;
          if (
            next.status === "atHospital" &&
            (was === "onTheWay" || was === "noResponse")
          ) {
            router.push("/guardian-arrived");
          }
          // 보고 있는 중에 '이동 중' → '응답 없음(도움 요청)'으로 바뀌면 그 화면 띄우기
          if (next.status === "noResponse" && was === "onTheWay") {
            router.push("/guardian-no-response");
          }
          prevStatus.current = next.status;
          setData(next);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const message = () => {
    if (textPhone(data.elderPhone, data.elderName) && data.tripId) {
      recordGuardianContact(data.tripId, "MESSAGE").catch(() => {});
    }
  };

  const call = () => {
    // 이동 중에 전화하면 서버에 연락 기록 남기기
    if (callPhone(data.elderPhone, data.elderName) && data.tripId) {
      recordGuardianContact(data.tripId, "CALL").catch(() => {});
    }
  };

  // 평소에는 위치를 보지 않고, 병원 가는 날 이동 중일 때만 위치를 보여줌
  const showLocationOff = () => {
    const title = "지금은 위치를 볼 수 없어요";
    const message = `${data.elderName}가 병원에 가려고 출발하면 위치를 볼 수 있어요.`;
    if (Platform.OS === "web") window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <GuardianHeader elderName={data.elderName} status={data.status} />

        {data.today ? (
          // 진료 당일 이동 중
          <>
            <TodayTripCard trip={data.today} />
            <ElderMapPreview
              elderName={data.elderName}
              elder={data.elderLocation}
              hospital={data.hospitalLocation}
            />
            <QuickActions
              actions={[
                { label: "전화", icon: "phone", onPress: call },
                {
                  label: "위치 크게",
                  icon: "location",
                  onPress: () => router.push("/guardian-moving"),
                },
                { label: "메시지", icon: "chat", onPress: message },
              ]}
            />
            <TodayLogList logs={data.today.logs} />
          </>
        ) : (
          // 평소
          <>
            {data.nextVisit && <NextVisitCard visit={data.nextVisit} />}
            <QuickActions
              actions={[
                { label: "전화", icon: "phone", onPress: call },
                {
                  label: "위치 보기",
                  icon: "location",
                  onPress: showLocationOff,
                },
                {
                  label: "일정 추가",
                  icon: "plusSquare",
                  onPress: () => router.push("/onboarding/paste-guide"),
                },
              ]}
            />
            <TodoList
              todos={data.todos}
              onPressTodo={(todo) => {
                if (todo.kind === "ride") {
                  const [appointmentId, requestId] = todo.id.split(":");
                  router.push({
                    pathname: "/guardian-ride-help",
                    params: { appointmentId, requestId },
                  });
                }
                if (todo.kind === "review")
                  router.push({
                    pathname: "/guardian-review",
                    params: { id: todo.id },
                  });
                if (todo.kind === "smsMissing")
                  router.push({
                    pathname: "/guardian-schedule-help",
                    params: { id: todo.id },
                  });
              }}
            />
            <UpcomingList
              visits={data.upcoming}
              onSeeAll={() => router.push("/guardian-schedule")}
            />
          </>
        )}
      </ScrollView>

      <GuardianBottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 29, paddingTop: 14, paddingBottom: 40 },
});
