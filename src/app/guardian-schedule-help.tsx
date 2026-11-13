// src/app/guardian-schedule-help.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getScheduleHelpRequest,
  submitScheduleHelp,
  type ScheduleHelpRequest,
} from "@/api/scheduleHelp";
import MascotWave from "@/assets/images/mascot-wave.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { GuardianHeader } from "@/components/guardian/GuardianHeader";
import { HelpInfoCard } from "@/components/guardian/HelpInfoCard";
import { HelpRequestBanner } from "@/components/guardian/HelpRequestBanner";
import { colors, palette } from "@/constants/theme";

/** 보호자: 어르신이 '보호자에게 연락하기'를 눌렀을 때 뜨는 일정 입력 도움 화면 */
export default function GuardianScheduleHelpScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [data, setData] = useState<ScheduleHelpRequest | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getScheduleHelpRequest(id ?? "mock-help").then((req) => {
      setData(req);
      setValue(req.fieldValue);
    });
  }, [id]);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await submitScheduleHelp(data, value.trim());
      router.replace("/guardian-home");
    } catch {
      Alert.alert("보내지 못했어요", "잠시 후 다시 시도해 주세요");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <GuardianHeader elderName={data.elderName} status={data.status} />

        <View style={styles.mascot}>
          <MascotWave width={137} height={137} />
        </View>

        <HelpRequestBanner title={data.title} sub={data.sub} />

        <View style={styles.info}>
          <HelpInfoCard title={data.infoTitle} rows={data.rows} />
        </View>

        <AppText
          variant="button"
          weight="medium"
          color={colors.accent}
          style={styles.fieldLabel}
        >
          {data.fieldLabel}
        </AppText>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={data.fieldLabel}
          placeholderTextColor={palette.green200}
          style={styles.input}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton
          label="저장하고 알려주기"
          variant="primary"
          disabled={!value.trim() || busy}
          onPress={handleSubmit}
        />
      </View>
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
  body: { paddingHorizontal: 30, paddingTop: 14, paddingBottom: 24 },
  mascot: { alignItems: "center", marginTop: 30, marginBottom: 8 },
  info: { marginTop: 25 },
  fieldLabel: { marginTop: 28, marginBottom: 8 },
  input: {
    height: 51,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: "#FFFFFF",
    shadowColor: "#213314",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    fontSize: 18,
    color: colors.accent,
  },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});
