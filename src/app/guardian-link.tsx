// src/app/guardian-link.tsx
import { router } from "expo-router";
import { type ComponentRef, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { linkGuardian } from "@/api/link";
import LinkGuide from "@/assets/images/link-guide.svg";
import MascotHeart from "@/assets/images/mascot-heart.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { colors, palette } from "@/constants/theme";

const CODE_LENGTH = 6;

/** 보호자: 어르신 앱에 뜬 연결 번호 입력 */
export default function GuardianLinkScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (text: string) => {
    setCode(text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
  };

  const handleLink = async () => {
    setBusy(true);
    try {
      await linkGuardian(code);
      router.replace("/guardian-home");
    } catch {
      const title = "연결 번호가 맞지 않아요";
      const message = "어르신 화면의 번호를 다시 확인해 주세요";
      // 웹에서는 Alert.alert가 동작하지 않아 브라우저 알림창 사용
      if (Platform.OS === "web") window.alert(`${title}\n${message}`);
      else Alert.alert(title, message);
      setCode("");
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
        <View style={styles.mascot}>
          <MascotHeart width={115} height={117} />
        </View>

        <AppText
          variant="button"
          weight="medium"
          color={palette.green200}
          style={styles.eyebrow}
        >
          보호자
        </AppText>
        <AppText variant="heading" weight="bold" color={palette.green600}>
          어머니의 앱과 연동 중...
        </AppText>

        <View style={styles.guide}>
          <LinkGuide width={268} height={132} />
        </View>

        <AppText
          variant="button"
          weight="medium"
          color={colors.accent}
          style={styles.description}
        >
          {"어머니의 화면에서 보이는\n연결 번호를 아래에 입력하세요"}
        </AppText>

        <Pressable
          style={styles.codeBox}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <View key={i} style={styles.slot}>
              {code[i] ? (
                <AppText variant="title" weight="bold" color="#000000">
                  {code[i]}
                </AppText>
              ) : (
                <View style={styles.dash} />
              )}
            </View>
          ))}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            textContentType="oneTimeCode"
            autoFocus
            style={styles.hiddenInput}
          />
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
        <AppButton
          label="연동하기"
          variant="primary"
          disabled={code.length < CODE_LENGTH || busy}
          onPress={handleLink}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 30, paddingTop: 50, paddingBottom: 24 },
  mascot: { alignItems: "center" },
  eyebrow: { marginTop: 22 },
  guide: { marginTop: 16, alignItems: "center" },
  description: { marginTop: 20, textAlign: "center", lineHeight: 28 },
  codeBox: {
    alignSelf: "center",
    width: 221,
    maxWidth: "100%",
    height: 78,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  slot: { width: 22, alignItems: "center", justifyContent: "center" },
  dash: { width: 12, height: 3, backgroundColor: "#000000" },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
  footer: { paddingHorizontal: 30, paddingTop: 12 },
});
