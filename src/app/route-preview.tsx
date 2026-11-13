import { searchRoutePlans } from "@/api/routes";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Icon } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette } from "@/constants/theme";
import { useAppointments } from "@/store/appointments";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type RoutePlan = {
  id: string;
  buses: string[];
  walkMeters: number;
  transfers: number;
  minutes: number;
  recommended?: boolean;
  hasSubway?: boolean;
};

const planTitle = (p: RoutePlan) =>
  `${p.recommended ? "추천 · " : ""}${p.buses.join(" → ")}${p.hasSubway ? "" : " 저상버스"}`;

const planSummary = (p: RoutePlan) =>
  `걷기 ${p.walkMeters}m · 갈아타기 ${p.transfers === 0 ? "없음" : `${p.transfers}번`} · ${p.minutes}분`;

export default function RoutePreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const appointments = useAppointments();
  const appointmentId = id ?? appointments[0]?.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plans, setPlans] = useState<RoutePlan[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async (exclude: string[]) => {
    if (!appointmentId) return;
    setLoading(true);
    setError(false);
    try {
      let next = await searchRoutePlans(appointmentId, exclude);
      // 더 이상 새 경로가 없으면 처음부터 다시 보여주기
      if (next.length === 0) {
        exclude = [];
        next = await searchRoutePlans(appointmentId);
      }
      setPlans(next);
      setSeenIds([...exclude, ...next.map((p) => p.id)]);
      setSelectedId(null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load([]);
  }, [appointmentId]);

  return (
    <ScreenLayout
      bodyPaddingTop={80}
      footer={
        <>
          <AppButton
            label={loading ? "길을 찾는 중..." : "다른 길 추천하기"}
            variant="secondary"
            disabled={loading}
            onPress={() => load(seenIds)}
          />
          {/* TODO: 선택한 경로(selectedId)로 이동 시작 (trips) */}
          <AppButton
            label="이 방법으로 출발"
            variant="primary"
            disabled={!selectedId || loading}
            onPress={() =>
              router.push({
                pathname: "/route-detail",
                params: {
                  id: selectedId!,
                  ...(appointmentId ? { appointmentId } : {}),
                },
              })
            }
          />
        </>
      }
    >
      <AppText variant="heading" weight="semibold" color={palette.green600}>
        이렇게 가시면 돼요
      </AppText>

      {error && (
        <AppText
          variant="button"
          color={palette.green300}
          style={{ marginTop: 12 }}
        >
          길을 찾지 못했어요. 다른 길 추천하기를 눌러 다시 시도해 주세요
        </AppText>
      )}

      <View style={styles.list}>
        {plans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <Pressable
              key={plan.id}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => setSelectedId(plan.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <View style={styles.titleRow}>
                <AppText
                  variant="body"
                  weight="bold"
                  color={selected ? colors.textOnPrimary : palette.green600}
                  style={styles.titleText}
                >
                  {planTitle(plan)}
                </AppText>
                <Icon
                  name="bus"
                  size={25}
                  color={selected ? colors.textOnPrimary : colors.accent}
                />
              </View>
              <AppText
                variant="button"
                color={selected ? colors.textOnPrimary : palette.green300}
              >
                {planSummary(plan)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 48, gap: 20 },
  card: {
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 22,
    paddingHorizontal: 11,
    paddingVertical: 14,
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: palette.green400,
    borderColor: palette.green600,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleText: { flexShrink: 1 },
});
