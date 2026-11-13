// src/hooks/useGuideSession.ts
import { useCallback, useEffect, useState } from "react";

import {
  endGuideSession,
  fetchNextLowFloorBus,
  notifyArrival,
  reportHelpRequest,
  reportNoResponse,
  rerouteFromHere,
  rerouteGuideSession,
  startGuideSession,
  subscribeBusRide,
  type GuideSession,
  type GuideStep,
  type NoResponseReport,
  type ReroutePlan,
} from "@/api/guide";

import { sendCheckIn, sendTripEvent, sendTripLocation } from "@/api/trips";
import * as Location from "expo-location";

/** '괜찮아요, 가는 중이에요'를 누른 뒤 다시 물어볼 때까지 기다리는 시간 */
const LATE_RECHECK_MS = 5 * 60 * 1000;
/** '아직 도착하지 않으셨어요'에서 이 시간 동안 응답이 없으면 보호자에게 알림 */
const NO_RESPONSE_MS = 3 * 60 * 1000;

export function useGuideSession(routeId?: string, appointmentId?: string) {
  const [session, setSession] = useState<GuideSession | null>(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startGuideSession(routeId, appointmentId).then((s) => {
      setSession(s);
      setIndex(0);
    });
    // 이동 중 실시간 갱신: 위치는 아래에서 30초마다 서버로, 버스 안 남은 정거장은 subscribeBusRide가 계산
  }, [routeId, appointmentId]);

  const step: GuideStep | null = session?.steps[index] ?? null;
  const isLast = session ? index >= session.steps.length - 1 : false;

  /** 현재 단계 내용만 바꾸기 (도착 시간 갱신 등) */
  const replaceStep = useCallback((updated: GuideStep) => {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            steps: prev.steps.map((s) => (s.id === updated.id ? updated : s)),
          }
        : prev,
    );
  }, []);

  /** 사용자가 '도착했어요', '버스를 탑승했어요' 등으로 현재 단계를 끝냈을 때 */
  const next = useCallback(() => {
    if (!session) return;
    // 서버 이동 기록: '버스를 탑승했어요' → BOARDED, '내렸어요' → ALIGHTED
    if (step?.type === "waitBus")
      sendTripEvent(session.id, "BOARDED").catch(() => {});
    if (step?.type === "alight")
      sendTripEvent(session.id, "ALIGHTED").catch(() => {});
    setIndex((i) => Math.min(i + 1, session.steps.length - 1));
  }, [session, step]);

  /** 갈림길 단계로 이동 (예: 도착 → '창구에 화면 보여주기') */
  const goTo = useCallback(
    (type: GuideStep["type"]) => {
      if (!session) return;
      const target = session.steps.findIndex(
        (s, i) => i > index && s.type === type,
      );
      if (target >= 0) setIndex(target);
    },
    [session, index],
  );

  /** '다시 안내': 현재 위치 기준으로 남은 경로 다시 받기 */
  const reroute = useCallback(async () => {
    if (!session || !step) return;
    setBusy(true);
    try {
      const updated = await rerouteGuideSession(session, step.id);
      const newIndex = updated.steps.findIndex((s) => s.id === step.id);
      setSession(updated);
      setIndex(newIndex >= 0 ? newIndex : 0);
    } finally {
      setBusy(false);
    }
  }, [session, step]);

  /** '버스를 하나 보냈어요': 다음 저상 버스 도착 정보 다시 받기 */
  const skipBus = useCallback(async () => {
    if (!session || step?.type !== "waitBus") return;
    setBusy(true);
    try {
      replaceStep(
        await fetchNextLowFloorBus(session.id, step, session.routePlanId),
      );
    } finally {
      setBusy(false);
    }
  }, [session, step, replaceStep]);

  /** 버스 타는 중: 남은 정거장 수 실시간 갱신, 다음 정류장에서 내릴 차례가 되면 다음 단계로 */
  const busStepId = step?.type === "onBus" ? step.id : null;
  useEffect(() => {
    if (!session || !step || step.type !== "onBus") return;
    const unsubscribe = subscribeBusRide(session.id, step, (updated) => {
      if (updated.stopsLeft <= 1) {
        unsubscribe();
        next();
      } else {
        replaceStep(updated);
      }
    });
    return unsubscribe;
    // 같은 버스 단계 안에서는 다시 구독하지 않도록 단계 id 기준으로만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busStepId]);

  /** '지금 계신 곳에서 다시 안내할게요' 화면 */
  const [rerouteOpen, setRerouteOpen] = useState(false);
  const [reroutePlan, setReroutePlan] = useState<ReroutePlan | null>(null);

  const openReroute = useCallback(async () => {
    if (!session) return;
    setLateCheck(false);
    setRerouteOpen(true);
    setReroutePlan(null);
    setReroutePlan(await rerouteFromHere(session));
  }, [session]);

  /** '안내 시작': 새 경로로 처음부터 안내 */
  const startReroute = useCallback(() => {
    if (!reroutePlan) return;
    setSession(reroutePlan.session);
    setIndex(0);
    setReroutePlan(null);
    setRerouteOpen(false);
  }, [reroutePlan]);

  /** '사용자가 응답하지 않아요' 화면 */
  const [noResponseOpen, setNoResponseOpen] = useState(false);
  const [noResponseReport, setNoResponseReport] =
    useState<NoResponseReport | null>(null);

  /** true면 '도와주세요'로 연 화면, false면 응답 없음으로 연 화면 */
  const [helpRequested, setHelpRequested] = useState(false);

  /** 도착 예상 시각이 지났는데 아직 병원 도착 단계가 아니면 '아직 도착하지 않으셨어요' 띄우기 */
  const [lateCheck, setLateCheck] = useState(false);
  const [lateDeadline, setLateDeadline] = useState<number | null>(null);
  useEffect(() => {
    if (session) setLateDeadline(new Date(session.expectedArrivalAt).getTime());
  }, [session?.expectedArrivalAt]);

  const hasArrived = step?.type === "arrived" || step?.type === "counterHelp";
  /** 안내 중(병원 도착 전) 30초마다 위치 보내기 → 보호자 지도·지연 감지 */
  const tripId = session?.id;
  useEffect(() => {
    if (!tripId || hasArrived) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30_000,
          distanceInterval: 20,
        },
        (pos) => {
          sendTripLocation(tripId, pos.coords).catch(() => {});
        },
      );
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [tripId, hasArrived]);

  useEffect(() => {
    if (
      lateDeadline == null ||
      hasArrived ||
      lateCheck ||
      rerouteOpen ||
      noResponseOpen
    )
      return;
    const timer = setTimeout(
      () => setLateCheck(true),
      Math.max(lateDeadline - Date.now(), 0),
    );
    return () => clearTimeout(timer);
  }, [lateDeadline, hasArrived, lateCheck, rerouteOpen, noResponseOpen]);

  /** '괜찮아요, 가는 중이에요': 화면 닫고 잠시 뒤 다시 확인 */
  const dismissLate = useCallback(() => {
    setLateCheck(false);
    setLateDeadline(Date.now() + LATE_RECHECK_MS);
  }, []);

  /** 늦음 확인 화면에서 일정 시간 아무 버튼도 안 누르면 → 보호자에게 문자 + 응답 없음 화면 */
  useEffect(() => {
    if (!lateCheck || !session) return;
    const timer = setTimeout(async () => {
      setLateCheck(false);
      setNoResponseOpen(true);
      setNoResponseReport(await reportNoResponse(session));
    }, NO_RESPONSE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lateCheck]);

  /** '도와주세요': 보호자에게 도움 요청 문자 + 안내 화면 */
  const requestHelp = useCallback(async () => {
    if (!session) return;
    setLateCheck(false);
    setHelpRequested(true);
    setNoResponseOpen(true);
    setNoResponseReport(await reportHelpRequest(session));
  }, [session]);

  /** '안내 종료' */
  const end = useCallback(async () => {
    if (session) await endGuideSession(session.id, hasArrived);
  }, [session, hasArrived]);

  /** 늦음 확인에서 '괜찮아요' → 체크인 OK */
  const checkIn = useCallback(
    (response: "OK" | "NEED_HELP") => {
      if (session) sendCheckIn(session.id, response).catch(() => {});
    },
    [session],
  );

  /** 병원 도착: 보호자에게 도착 알림 보내기 (도착 단계에 들어갈 때 한 번) */
  const [arrivalNotified, setArrivalNotified] = useState(false);
  const arrivedStepId = step?.type === "arrived" ? step.id : null;
  useEffect(() => {
    if (!session || !arrivedStepId) return;
    notifyArrival(session.id).then(() => setArrivalNotified(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivedStepId]);

  return {
    session,
    step,
    index,
    isLast,
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
    dismissLate,
    openReroute,
    startReroute,
    requestHelp,
    end,
    checkIn,
  };
}
