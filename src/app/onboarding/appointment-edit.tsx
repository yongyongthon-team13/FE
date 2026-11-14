import {
  saveAppointment,
  type AppointmentDraft,
} from "@/api/appointments";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { colors, palette, radius } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Params = AppointmentDraft & {
  mode?: "missing" | "edit" | "new"; // new: 병원 가기 → 직접 일정 만들기
  lat?: string; // 병원 좌표·주소 (진료과 추천에서 넘어온 경우)
  lon?: string;
  address?: string;
  source?: "SMS" | "MANUAL"; // 저장할 때 출처 (진료과 추천에서 오면 MANUAL)
};

const FIELDS: { key: keyof AppointmentDraft; label: string }[] = [
  { key: "hospital", label: "병원" },
  { key: "date", label: "날짜" },
  { key: "time", label: "시간" },
  { key: "department", label: "진료과" },
  { key: "scale", label: "규모" },
];

const notify = (title: string, message: string) => {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

export default function AppointmentEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [draft, setDraft] = useState<AppointmentDraft>({
    hospital: params.hospital ?? "",
    date: params.date ?? "",
    time: params.time ?? "",
    department: params.department ?? "",
    scale: params.scale ?? "",
  });

  const title =
    params.mode === "new"
      ? "일정을 입력해주세요"
      : params.mode === "edit"
        ? "일정을 수정해주세요"
        : "일부를 못 읽었어요";

  const [asking, setAsking] = useState(false);

  // 읽은 만큼 저장 + 도움 요청 표시 → 보호자 홈 '확인이 필요해요'에 뜸
  const handleAskGuardian = async () => {
    setAsking(true);
    try {
      await saveAppointment(draft, "MANUAL", { helpRequested: true });
      notify("보호자에게 부탁했어요", "보호자가 입력하면 일정에 반영돼요");
      router.replace("/home");
    } catch {
      notify("부탁하지 못했어요", "잠시 후 다시 시도해 주세요");
    } finally {
      setAsking(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.header}>
          <AppText variant="body" color={palette.green200}>
            병원 일정 등록
          </AppText>
          <AppText variant="heading" weight="semibold" color={colors.heading}>
            {title}
          </AppText>
        </View>

        <View style={styles.box}>
          {FIELDS.map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <AppText variant="button" color={colors.subtle}>
                {label}
              </AppText>
              <TextInput
                style={styles.input}
                value={draft[key]}
                onChangeText={(text) =>
                  setDraft((prev) => ({ ...prev, [key]: text }))
                }
                placeholder="(눌러서 입력)"
                placeholderTextColor={palette.green700}
                accessibilityLabel={label}
              />
            </View>
          ))}
        </View>

        <AppText variant="body" color={palette.green200} style={styles.notice}>
          {"보호자에게 대신 입력을\n부탁할 수 있어요"}
        </AppText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton
          label="보호자에게 부탁하기"
          variant="secondary"
          disabled={asking}
          onPress={handleAskGuardian}
        />
        <AppButton
          label="완료하기"
          variant="primary"
          onPress={async () => {
            try {
              const id = await saveAppointment(
                draft,
                params.source ?? (params.mode === "missing" ? "MANUAL" : "SMS"),
                {
                  clinicLat: params.lat ? Number(params.lat) : undefined,
                  clinicLon: params.lon ? Number(params.lon) : undefined,
                  clinicAddress: params.address || undefined,
                },
              );
              router.replace({ pathname: "/companion", params: { id } });
            } catch {
              notify(
                "저장 실패",
                "일정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요",
              );
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "space-between",
  },
  body: { paddingHorizontal: 30, paddingTop: 160 },
  header: { gap: 4 },
  box: {
    marginTop: 34,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.base,
    paddingVertical: 25,
    paddingLeft: 20,
    paddingRight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 56, // 라벨 고정 폭
    flexShrink: 0, // 라벨은 절대 안 줄어들게
  },
  input: {
    flex: 1, // 남은 공간만 차지
    minWidth: 0, // 좁으면 줄어들 수 있게
    textAlign: "right",
    // width: ...  ← 고정 width 있으면 삭제
  },
  notice: { marginTop: 8 },
  footer: { paddingHorizontal: 30, gap: 10 },
});
