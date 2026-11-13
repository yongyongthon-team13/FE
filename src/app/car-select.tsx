import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { getPrimaryGuardian, type Guardian } from "@/api/guardian";
import { getRideAnswer, requestRide, type RideAnswer } from "@/api/rideHelp";
import MascotHeart from "@/assets/images/mascot-heart.svg";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Icon, type IconName } from "@/components/Icon";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette } from "@/constants/theme";
import { useAppointments } from "@/store/appointments";

type CarOption = "taxi" | "guardian" | "special";

// 용인시 교통약자 이동지원센터 (용인누리) 콜센터
const SPECIAL_TRANSPORT_TEL = "16660420";

// TODO: 카카오T 딥링크 실제 동작 확인
const TAXI_APP_URL = "kakaot://taxi";
const TAXI_STORE_URL =
  Platform.OS === "ios"
    ? "https://apps.apple.com/kr/app/id981110422"
    : "https://play.google.com/store/apps/details?id=com.kakao.taxi";

export default function CarSelectScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const appointments = useAppointments();
  const apptId = appointmentId ?? appointments[0]?.id; // id 없이 오면 가장 가까운 일정
  const [selected, setSelected] = useState<CarOption | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  // 보호자에게 부탁한 뒤: 요청 id와 보호자 답
  const [waitingId, setWaitingId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<RideAnswer | null>(null);

  useEffect(() => {
    getPrimaryGuardian().then(setGuardian);
  }, []);

  const options: {
    key: CarOption;
    icon: IconName;
    title: string;
    summary: string;
  }[] = [
    {
      key: "taxi",
      icon: "car",
      title: "택시 부르기",
      summary: "집 앞으로 바로 와요",
    },
    {
      key: "guardian",
      icon: "companion",
      title: "보호자에게 부탁하기",
      summary: guardian
        ? `${guardian.name} (${guardian.relation}) 에게 알림`
        : " ",
    },
    {
      key: "special",
      icon: "wheelchair",
      title: "특별교통수단",
      summary: "휠체어 이용시 · 미리 예약 필요",
    },
  ];

  const callTaxi = async () => {
    try {
      await Linking.openURL(TAXI_APP_URL);
    } catch {
      await Linking.openURL(TAXI_STORE_URL);
    }
  };

  /** 서버로 부탁했으면 true (이 화면에서 답 기다림), 문자로 보냈으면 false */
  const askGuardian = async (): Promise<boolean> => {
    if (!guardian) return false;
    // 서버로 부탁 → 보호자 앱에 알림 + '확인이 필요해요'에 뜸
    if (apptId) {
      try {
        const { requestId } = await requestRide(apptId);
        setWaitingId(requestId);
        return true;
      } catch {
        // 실패하면 아래 문자로
      }
    }
    const body =
      "오늘 병원 가는 날인데 날씨가 안 좋아서 차로 데려다줄 수 있을까?";
    const sep = Platform.OS === "ios" ? "&" : "?";
    try {
      await Linking.openURL(
        `sms:${guardian.phone}${sep}body=${encodeURIComponent(body)}`,
      );
    } catch {
      Alert.alert(
        "문자를 보낼 수 없어요",
        `${guardian.name}님께 직접 연락해주세요.`,
      );
    }
    return false;
  };

  const callSpecial = async () => {
    try {
      await Linking.openURL(`tel:${SPECIAL_TRANSPORT_TEL}`);
    } catch {
      Alert.alert("전화를 걸 수 없어요", "1666-0420 으로 직접 전화해주세요.");
    }
  };

  const goNext = () =>
    router.replace({
      pathname: "/today-condition",
      params: {
        car: selected ?? "",
        ...(appointmentId ? { appointmentId } : {}),
      },
    });

  // 보호자 답 기다리기: 5초마다 확인
  useEffect(() => {
    if (!waitingId || !apptId || answer) return;
    const timer = setInterval(() => {
      getRideAnswer(apptId, waitingId)
        .then((a) => a && setAnswer(a))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [waitingId, apptId, answer]);

  const handleSelect = async () => {
    if (selected === "taxi") await callTaxi();
    if (selected === "guardian" && (await askGuardian())) return; // 이 화면에서 답 기다림
    if (selected === "special") await callSpecial();
    goNext();
  };

  const guardianName = guardian?.name ?? "보호자";
  const ANSWER_TEXT: Record<RideAnswer, string> = {
    PICKUP_BY_GUARDIAN: `${guardianName}님이\n모시러 오신대요`,
    CALL_TAXI: `${guardianName}님이\n택시를 불러주신대요`,
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={22}
      footer={
        waitingId ? (
          <>
            {!answer && (
              <AppButton
                label="기다리지 않고 넘어갈게요"
                variant="secondary"
                onPress={goNext}
              />
            )}
            <AppButton
              label={answer ? "다음으로" : "답을 기다리고 있어요"}
              variant="primary"
              disabled={!answer}
              onPress={goNext}
            />
          </>
        ) : (
          <AppButton
            label="선택하기"
            variant="primary"
            disabled={!selected || (selected === "guardian" && !guardian)}
            onPress={handleSelect}
          />
        )
      }
    >
      <View style={styles.mascot}>
        <MascotHeart width={100} height={111} />
      </View>

      <AppText
        variant="body"
        weight="bold"
        color={palette.green600}
        style={styles.title}
      >
        {waitingId
          ? answer
            ? ANSWER_TEXT[answer]
            : `${guardianName}님께 부탁했어요`
          : "어떤 차를 부를까요?"}
      </AppText>

      {waitingId && !answer && (
        <AppText variant="button" color={palette.green300} style={styles.title}>
          답이 오면 바로 알려드릴게요
        </AppText>
      )}

      <View style={[styles.list, waitingId ? { display: "none" } : null]}>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(opt.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={styles.titleRow}>
                <Icon
                  name={opt.icon}
                  size={30}
                  color={isSelected ? colors.textOnPrimary : colors.accent}
                />
                <AppText
                  variant="body"
                  weight="bold"
                  color={isSelected ? colors.textOnPrimary : palette.green600}
                  style={styles.titleText}
                >
                  {opt.title}
                </AppText>
              </View>
              <AppText
                variant="button"
                color={isSelected ? colors.textOnPrimary : palette.green300}
              >
                {opt.summary}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: "center" },
  title: { marginTop: 18 },
  list: { marginTop: 22, gap: 20 },
  card: {
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    gap: 8,
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
