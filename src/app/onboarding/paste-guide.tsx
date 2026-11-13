// src/app/onboarding/paste-guide.tsx
import {
  extractAppointment,
  extractAppointmentFromImage,
  isDraftComplete,
  type AppointmentDraft,
} from "@/api/appointments";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { colors, fontFamily, radius } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function PasteGuideScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 뽑은 결과에 따라 확인 / 직접 입력 화면으로
  const goNext = (draft: AppointmentDraft) => {
    router.push({
      pathname: isDraftComplete(draft)
        ? "/onboarding/appointment-confirm"
        : "/onboarding/appointment-edit",
      params: isDraftComplete(draft) ? draft : { ...draft, mode: "missing" },
    });
  };
  const goManual = () =>
    router.push({
      pathname: "/onboarding/appointment-edit",
      params: { mode: "missing" },
    });

  const handleCreate = async () => {
    setLoading(true);
    try {
      goNext(await extractAppointment(message));
    } catch {
      goManual(); // 503 등 실패 → 직접 입력
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    setLoading(true);
    try {
      goNext(
        await extractAppointmentFromImage(
          asset.uri,
          asset.mimeType ?? "image/jpeg",
        ),
      );
    } catch {
      goManual();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          accessibilityLabel="병원 문자 붙여넣기"
        />

        <AppText
          variant="body"
          weight="bold"
          color={colors.accent}
          style={styles.text}
        >
          {"병원 문자를 복사하고\n위에 붙여넣어주세요"}
        </AppText>

        <View style={styles.buttons}>
          <AppButton
            label={loading ? "문자를 읽는 중..." : "일정으로 만들기"}
            variant="primary"
            disabled={message.trim() === "" || loading}
            onPress={handleCreate}
          />
          <AppButton
            label="캡처 사진으로 만들기"
            variant="outline"
            disabled={loading}
            onPress={handlePickImage}
          />
          <AppButton
            label="나중에"
            variant="secondary"
            onPress={() => router.replace("/home")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#1A2E0F",
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  input: {
    width: 250,
    height: 170,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.base,
    backgroundColor: colors.bg,
    padding: 14,
    fontSize: 18,
    fontFamily: fontFamily.regular,
    color: colors.text,
  },
  text: {
    textAlign: "center",
    lineHeight: 28,
    marginTop: 12,
    marginBottom: 13,
  },
  buttons: {
    width: "100%",
    gap: 10,
  },
});
