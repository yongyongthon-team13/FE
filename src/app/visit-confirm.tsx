import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  isDraftComplete,
  parseWhen,
  saveAppointment,
  type AppointmentDraft,
} from "@/api/appointments";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { colors, palette } from "@/constants/theme";

const notify = (title: string, message: string) => {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

/** 진료과 추천: 만든 일정 확인 → 저장 */
export default function VisitConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { hospital, size, department, when, lat, lon, address } =
    useLocalSearchParams<{
      hospital: string;
      size: string;
      department: string;
      when?: string;
      lat?: string;
      lon?: string;
      address?: string;
    }>();

  // 말한 내용(when)에서 날짜·시간 뽑기 (못 뽑으면 빈 칸 → 수정하기에서 입력)
  const { date, time } = parseWhen(when ?? "");
  const draft: AppointmentDraft = {
    hospital: hospital ?? "",
    date,
    time,
    department: department ?? "",
    scale: size ?? "",
  };
  const clinic = { lat: lat ?? "", lon: lon ?? "", address: address ?? "" };
  const [saving, setSaving] = useState(false);

  const rows: [string, string][] = [
    ["병원", draft.hospital],
    ["날짜", draft.date || "정해지지 않음"],
    ["시간", draft.time || "정해지지 않음"],
    ["진료과", draft.department],
    ["규모", draft.scale],
  ];

  /** 수정하기 (또는 빈 칸이 있을 때): 일정 직접 입력 화면 → 저장까지 거기서 */
  const goEdit = (mode: "edit" | "missing") =>
    router.push({
      pathname: "/onboarding/appointment-edit",
      params: { ...draft, mode, source: "MANUAL", ...clinic },
    });

  const handleDone = async () => {
    if (!isDraftComplete(draft)) {
      goEdit("missing");
      return;
    }
    setSaving(true);
    try {
      await saveAppointment(draft, "MANUAL", {
        clinicLat: lat ? Number(lat) : undefined,
        clinicLon: lon ? Number(lon) : undefined,
        clinicAddress: address || undefined,
      });
      router.dismissTo("/hospital");
    } catch {
      notify("저장하지 못했어요", "잠시 후 다시 시도해 주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.mascot}>
        <MascotWave width={124} height={124} />
      </View>

      <AppText variant="body" color={palette.green200}>
        진료과 추천
      </AppText>
      <AppText variant="heading" weight="bold" color={palette.green600}>
        해당 일정이 맞나요?
      </AppText>

      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <AppText variant="body" color={palette.green300}>
              {label}
            </AppText>
            <AppText
              variant="heading"
              weight="semibold"
              color={palette.green700}
            >
              {value}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="body" color={palette.green200} style={styles.notice}>
        {"잘못된 정보가 있다면\n수정하기를 통해 고쳐주세요"}
      </AppText>

      <View style={styles.buttons}>
        <AppButton
          label="수정하기"
          variant="secondary"
          onPress={() => goEdit("edit")}
        />
        <AppButton
          label="완료하기"
          variant="primary"
          disabled={saving}
          onPress={handleDone}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 30 },
  mascot: { alignItems: "center", marginBottom: 8 },
  card: {
    marginTop: 32,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 8,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    shadowColor: "#213314",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notice: { marginTop: 14 },
  buttons: { marginTop: "auto", gap: 10 },
});
