import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { getCompanionRequestDraft } from "@/api/companion";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, fontFamily, palette } from "@/constants/theme";
import { useAppointments } from "@/store/appointments";

type Form = {
  name: string;
  visit: string;
  hospital: string;
  departure: string;
  vehicle: string;
};

const FIELDS: { key: keyof Form; label: string }[] = [
  { key: "name", label: "성함" },
  { key: "visit", label: "진료" },
  { key: "hospital", label: "병원" },
  { key: "departure", label: "출발" },
  { key: "vehicle", label: "차량" },
];

export default function CompanionRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointments().find((a) => a.id === id);
  const [mobilityAid, setMobilityAid] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [estimatedCost, setEstimatedCost] = useState("");
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    getCompanionRequestDraft(id).then((d) => {
      setForm({
        name: d.name,
        visit: appointment ? `${appointment.date} ${appointment.time}` : "",
        hospital: appointment
          ? `${appointment.hospital} ${appointment.department}`
          : "",
        departure: d.departure,
        vehicle: d.vehicle,
      });
      setEstimatedCost(d.estimatedCost);
      setMobilityAid(d.mobilityAid);
      setPhone(d.phone);
      setRequestId(d.requestId);
    });
  }, [id]);

  const isComplete =
    !!form && Object.values(form).every((v) => v.trim() !== "");

  return (
    <ScreenLayout
      bodyPaddingTop={28}
      footer={
        <>
          <AppButton
            label={editing ? "수정 완료" : "수정하기"}
            variant="secondary"
            disabled={editing && !isComplete}
            onPress={() => setEditing((p) => !p)}
          />
          <AppButton
            label="전화로 신청 시작하기"
            variant="primary"
            disabled={!isComplete || editing}
            onPress={() =>
              router.push({
                pathname: "/companion-call",
                params: { ...form!, mobilityAid, phone, id, requestId },
              })
            }
          />
        </>
      }
    >
      <View style={styles.mascot}>
        <MascotWave width={140} height={140} />
      </View>

      <View style={styles.header}>
        <AppText variant="body" color={palette.green200}>
          동행 서비스 신청
        </AppText>
        <AppText variant="heading" weight="semibold" color={palette.green600}>
          이 내용으로 신청해요
        </AppText>
      </View>

      <View style={styles.card}>
        {FIELDS.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <AppText style={styles.label}>{label}</AppText>
            {editing ? (
              <TextInput
                style={styles.value}
                value={form?.[key] ?? ""}
                onChangeText={(text) =>
                  setForm((prev) => (prev ? { ...prev, [key]: text } : prev))
                }
                placeholder="(눌러서 입력)"
                placeholderTextColor={palette.green700}
                accessibilityLabel={label}
              />
            ) : (
              <AppText style={styles.value} numberOfLines={1}>
                {form?.[key] ?? " "}
              </AppText>
            )}
          </View>
        ))}
      </View>

      <AppText variant="body" color={palette.green200} style={styles.notice}>
        {`예상 비용: ${estimatedCost}`}
      </AppText>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: {
    alignItems: "center",
  },
  header: {
    marginTop: 10,
    gap: 6,
  },
  card: {
    marginTop: 37,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.bg,
    gap: 4,
    shadowColor: "#213314",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 64,
    flexShrink: 0,
    fontFamily: fontFamily.regular,
    fontSize: 18,
    color: palette.green300,
  },
  value: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    textAlign: "right",
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: palette.green700,
  },
  notice: {
    marginTop: 11,
  },
});
