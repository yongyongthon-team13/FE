// src/app/guide.tsx
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import { getPrimaryGuardian } from "@/api/guardian";
import { AppButton } from "@/components/AppButton";
import { AlightStepView } from "@/components/guide/AlightStepView";
import { ArrivedStepView } from "@/components/guide/ArrivedStepView";
import { CounterHelpStepView } from "@/components/guide/CounterHelpStepView";
import { GuideLayout } from "@/components/guide/GuideLayout";
import { LateCheckView } from "@/components/guide/LateCheckView";
import { NoResponseView } from "@/components/guide/NoResponseView";
import { OnBusStepView } from "@/components/guide/OnBusStepView";
import { RerouteView } from "@/components/guide/RerouteView";
import { WaitBusStepView } from "@/components/guide/WaitBusStepView";
import { WalkStepView } from "@/components/guide/WalkStepView";
import { colors } from "@/constants/theme";
import { useGuideSession } from "@/hooks/useGuideSession";
import { useAppointments } from "@/store/appointments";

export default function GuideScreen() {
  const { routeId, appointmentId } = useLocalSearchParams<{
    routeId?: string;
    appointmentId?: string;
  }>();
  const appointments = useAppointments();
  const {
    session,
    step,
    busy,
    arrivalNotified,
    lateCheck,
    rerouteOpen,
    reroutePlan,
    noResponseOpen,
    noResponseReport,
    helpRequested,
    next,
    goTo,
    reroute,
    skipBus,
    openReroute,
    startReroute,
    requestHelp,
    end,
    checkIn,
  } = useGuideSession(routeId, appointmentId ?? appointments[0]?.id);

  const handleEnd = () => {
    const finish = async () => {
      await end();
      router.dismissTo("/home");
    };
    const title = "안내를 그만할까요?";
    const message = "그만하면 길 안내와 보호자 알림이 멈춰요.";

    // 웹에서는 Alert.alert가 동작하지 않아 브라우저 확인창 사용
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${message}`)) finish();
      return;
    }

    Alert.alert(title, message, [
      { text: "계속 안내받기", style: "cancel" },
      { text: "그만하기", style: "destructive", onPress: finish },
    ]);
  };

  const callGuardian = async () => {
    const guardian = await getPrimaryGuardian();
    if (!guardian) {
      Alert.alert("등록된 보호자가 없어요");
      return;
    }
    Linking.openURL(`tel:${guardian.phone}`);
  };

  if (!session || !step) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (noResponseOpen) {
    return (
      <GuideLayout destination={session.destination} onEnd={handleEnd}>
        {noResponseReport ? (
          <NoResponseView
            report={noResponseReport}
            title={helpRequested ? "보호자에게 도움을 요청했어요" : undefined}
          />
        ) : (
          <ActivityIndicator color={colors.accent} />
        )}
      </GuideLayout>
    );
  }

  if (lateCheck) {
    return (
      <GuideLayout
        hideHeader
        tone="alert"
        destination={session.destination}
        onEnd={handleEnd}
      >
        <LateCheckView
          onOk={() => {
            checkIn("OK");
            openReroute();
          }}
          onLost={openReroute}
          // TODO: 보호자 연락 화면 연결
          onHelp={requestHelp}
        />
      </GuideLayout>
    );
  }

  if (rerouteOpen) {
    return (
      <GuideLayout
        destination={session.destination}
        onEnd={handleEnd}
        footer={
          <>
            <AppButton
              label="보호자에게 전화하기"
              variant="secondary"
              onPress={callGuardian}
            />
            <AppButton
              label="안내 시작"
              variant="primary"
              disabled={!reroutePlan}
              onPress={startReroute}
            />
          </>
        }
      >
        <RerouteView preview={reroutePlan?.preview ?? null} />
      </GuideLayout>
    );
  }

  switch (step.type) {
    case "walk":
      return (
        <GuideLayout
          destination={session.destination}
          onEnd={handleEnd}
          footer={
            <>
              <AppButton
                label="다시 안내"
                variant="secondary"
                disabled={busy}
                onPress={reroute}
              />
              <AppButton
                label="도착했어요"
                variant="primary"
                disabled={busy}
                onPress={next}
              />
            </>
          }
        >
          <WalkStepView step={step} />
        </GuideLayout>
      );

    case "waitBus":
      return (
        <GuideLayout
          destination={session.destination}
          onEnd={handleEnd}
          footer={
            <>
              <AppButton
                label="버스를 하나 보냈어요"
                variant="secondary"
                disabled={busy}
                onPress={skipBus}
              />
              <AppButton
                label="버스를 탑승했어요"
                variant="primary"
                disabled={busy}
                onPress={next}
              />
            </>
          }
        >
          <WaitBusStepView step={step} />
        </GuideLayout>
      );

    case "onBus":
      // 버튼 없음: 남은 정거장 수는 실시간으로 바뀌고, 내릴 때가 되면 자동으로 다음 단계로 넘어감
      return (
        <GuideLayout destination={session.destination} onEnd={handleEnd}>
          <OnBusStepView step={step} />
        </GuideLayout>
      );

    case "alight":
      return (
        <GuideLayout
          destination={session.destination}
          onEnd={handleEnd}
          tone="alert"
        >
          <AlightStepView onAlighted={next} />
        </GuideLayout>
      );

    case "arrived":
      return (
        <GuideLayout destination={session.destination} onEnd={handleEnd}>
          <ArrivedStepView
            arrivalNotified={arrivalNotified}
            // TODO: 키오스크 사용법 화면 연결
            onSeeKiosk={() => {}}
            onNoKiosk={() => goTo("counterHelp")}
          />
        </GuideLayout>
      );

    case "counterHelp":
      return (
        <GuideLayout
          hideHeader
          destination={session.destination}
          onEnd={handleEnd}
          footer={
            <>
              {/* TODO: 키오스크 사용법 화면 연결 */}
              <AppButton
                label="키오스크 사용법 보기"
                variant="secondary"
                onPress={() => {}}
              />
              <AppButton
                label="안내를 종료해요"
                variant="primary"
                onPress={async () => {
                  await end();
                  router.dismissTo("/home");
                }}
              />
            </>
          }
        >
          <CounterHelpStepView step={step} />
        </GuideLayout>
      );

    // TODO: 다음 단계 화면들 추가
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
