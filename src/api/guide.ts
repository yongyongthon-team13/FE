// src/api/guide.ts
import { Platform } from "react-native";

import {
  distanceToDestinationKm,
  findNextLowFloorBus,
  searchFromHere,
  sendTripEvent,
  startDemoTripSession,
  startTripSession,
  watchStopsLeft,
} from "./trips";
import { DEMO_WALKS } from "./demoRide";
import { DEMO_DESTINATION, usingDemoRoutes } from "./routes";

export type Direction = "straight" | "left" | "right";

/** 걷기 안내 단계 (정류장까지, 병원 정문까지 등) */
export type WalkStep = {
  id: string;
  type: "walk";
  title: string; // 예: '1번 정류장까지'
  direction: Direction;
  distanceM: number; // 다음 행동까지 거리 (예: 120 → '120m 앞으로')
  instruction: string; // 예: '편의점이 보이면 왼쪽으로'
  remainingM: number; // 이 구간 도착까지 남은 거리
  remainingMin: number; // 이 구간 도착까지 남은 시간(분)
};

/** 정류장에서 버스 기다리기 단계 */
export type WaitBusStep = {
  id: string;
  type: "waitBus";
  stopName: string; // 예: 'XX 정류장'
  busNo: string; // 예: '10번'
  arrivalMin: number; // 도착까지 남은 시간(분)
  lowFloor: boolean; // 저상 버스(계단 없음) 여부
  routeName?: string; // 서버 노선 이름 (실시간 도착 정보 찾기용)
};

/** 버스 타고 가는 중 단계 */
export type OnBusStep = {
  id: string;
  type: "onBus";
  alightStop: string; // 내릴 정류장, 예: '강남대역.강남대입구 정류장'
  stopsLeft: number; // 남은 정거장 수
  stops?: { latitude: number; longitude: number }[]; // 지나가는 정류장 좌표 (남은 정거장 계산용)
};

export type GuideStep =
  | WalkStep
  | WaitBusStep
  | OnBusStep
  | AlightStep
  | ArrivedStep
  | CounterHelpStep;

export type GuideSession = {
  id: string;
  destination: string; // 예: '용인착한마디의원'
  expectedArrivalAt: string; // 병원 도착 예상 시각 (ISO 문자열)
  steps: GuideStep[];
  routePlanId?: string; // 서버 경로 id (실시간 버스 도착 정보용)
  destinationPoint?: { name: string; latitude?: number; longitude?: number }; // 병원 위치 ( 다시 안내용 )
  demo?: boolean; // 시연용 안내 (지도 마커가 시연 경로 위를 움직임)
};

/** 현재 위치 기준 재안내 미리보기 (첫 이동 방향 + 병원까지 남은 거리) */
export type ReroutePreview = {
  direction: Direction;
  distanceM: number;
  totalRemainingM: number;
};

export type ReroutePlan = {
  session: GuideSession;
  preview: ReroutePreview;
};

/** 응답 없음 기록 (보호자에게 보낸 내용) */
export type NoResponseReport = {
  timeline: { time: string; label: string }[]; // 예: { time: '10:15', label: '도착 시간 지남' }
  guardianNotified: boolean; // 보호자에게 문자 발송 여부
};

/** 길 안내 시작: 서버 이동 기록(trips) 만들기. 실패하면 목업으로 안내 (발표·테스트용) */
export async function startGuideSession(
  routeId?: string,
  appointmentId?: string,
): Promise<GuideSession> {
  // 시연용 경로(또는 경로 없이 시작 + 시연 모드)면 시연 안내 (서버 이동 기록은 만들어서 보호자 연동)
  if (routeId?.startsWith("demo-") || (!routeId && usingDemoRoutes())) {
    try {
      return await startDemoTripSession(appointmentId);
    } catch {
      return mockSession();
    }
  }
  try {
    return await startTripSession(routeId, appointmentId);
  } catch {
    return mockSession();
  }
}

function mockSession(): GuideSession {
  return {
    id: "mock-session",
    demo: true,
    destination: DEMO_DESTINATION.name,
    // 목업: 테스트용으로 1분 뒤를 도착 예상 시각으로
    expectedArrivalAt: new Date(Date.now() + 60 * 1000).toISOString(),
    steps: [
      {
        id: "walk-1",
        type: "walk",
        title: "처인구청 정류장까지",
        direction: "straight",
        distanceM: 120,
        instruction: "편의점이 보이면 왼쪽으로",
        remainingM: 180,
        remainingMin: 4,
      },
      {
        id: "wait-1",
        type: "waitBus",
        stopName: "처인구청 정류장",
        busNo: "10번",
        arrivalMin: 4,
        lowFloor: true,
      },
      {
        id: "bus-1",
        type: "onBus",
        alightStop: DEMO_DESTINATION.stopName,
        stopsLeft: 5,
      },
      {
        id: "walk-2",
        type: "walk",
        title: `${DEMO_DESTINATION.name}까지`,
        direction: "left",
        distanceM: 50,
        instruction: "횡단보도를 건너세요",
        remainingM: 150,
        remainingMin: 3,
      },
      {
        id: "arrived-1",
        type: "arrived",
      },
      {
        id: "counter-1",
        type: "counterHelp",
        userName: "OOO",
        hospital: DEMO_DESTINATION.name,
        date: "11월 4일(화)",
        time: "오전 10 : 00",
        department: "내과",
        scale: "소중대",
      },
      {
        id: "counter-1",
        type: "counterHelp",
        userName: "OOO",
        hospital: DEMO_DESTINATION.name,
        date: "11월 4일(화)",
        time: "오전 10 : 00",
        department: "내과",
        scale: "소중대",
      },
    ],
  };
}

/** '버스를 하나 보냈어요': 다음 저상 버스 도착 시간 (서버 경로가 없거나 실패하면 목업 +8분) */
export async function fetchNextLowFloorBus(
  sessionId: string,
  step: WaitBusStep,
  routePlanId?: string,
): Promise<WaitBusStep> {
  if (routePlanId) {
    const found = await findNextLowFloorBus(routePlanId, step).catch(
      () => null,
    );
    if (found) return found;
  }
  return { ...step, arrivalMin: step.arrivalMin + 8 };
}

/** 버스 타는 중: 남은 정거장 수 갱신. 반환값은 구독 해제 함수
 *  정류장 좌표와 위치 권한이 있으면 내 위치로 계산, 아니면 5초마다 하나씩 줄이는 시연용 동작 */
export function subscribeBusRide(
  sessionId: string,
  step: OnBusStep,
  onUpdate: (updated: OnBusStep) => void,
): () => void {
  let stop = () => {};
  const demo = () => {
    let stopsLeft = step.stopsLeft;
    const timer = setInterval(() => {
      stopsLeft = Math.max(stopsLeft - 1, 0);
      onUpdate({ ...step, stopsLeft });
    }, 5000);
    stop = () => clearInterval(timer);
  };
  if (Platform.OS === "web" || (step.stops?.length ?? 0) < 2) demo();
  else stop = watchStopsLeft(step, onUpdate, demo);
  return () => stop();
}

/** '다시 안내': 지금 위치에서 병원까지 남은 길을 다시 찾기 (실패하면 그대로) */
export async function rerouteGuideSession(
  session: GuideSession,
  fromStepId: string,
): Promise<GuideSession> {
  // 시연 안내: 실제 위치로 다시 찾으면 시연 경로가 사라지므로 지금 경로 그대로 (마커는 이어서 움직임)
  if (session.demo) return session;
  try {
    const found = await searchFromHere(session);
    const hospitalSteps = session.steps.filter(
      (s) => s.type === "arrived" || s.type === "counterHelp",
    );
    return {
      ...session,
      expectedArrivalAt: new Date(
        Date.now() + found.durationSeconds * 1000,
      ).toISOString(),
      steps: [...found.steps, ...hospitalSteps],
    };
  } catch {
    return session;
  }
}

/** '지금 계신 곳에서 다시 안내': 현재 위치에서 병원까지 새 경로 (실패하면 목업) */
export async function rerouteFromHere(
  session: GuideSession,
  fromStepId?: string,
): Promise<ReroutePlan> {
  if (session.demo) return demoReroute(session, fromStepId);
  const hospitalSteps = session.steps.filter(
    (s) => s.type === "arrived" || s.type === "counterHelp",
  );
  try {
    const found = await searchFromHere(session);
    const firstWalk = found.steps.find((s): s is WalkStep => s.type === "walk");
    return {
      session: {
        ...session,
        expectedArrivalAt: new Date(
          Date.now() + found.durationSeconds * 1000,
        ).toISOString(),
        steps: [...found.steps, ...hospitalSteps],
      },
      preview: {
        direction: firstWalk?.direction ?? "straight",
        distanceM: firstWalk?.distanceM ?? 0,
        totalRemainingM: found.distanceMeters,
      },
    };
  } catch {
    return mockReroute(session);
  }
}

/** 시연 안내의 '다시 안내': 지금 단계부터 시연 경로 그대로 이어서 (같은 지도·마커 사용) */
function demoReroute(session: GuideSession, fromStepId?: string): ReroutePlan {
  const from = Math.max(
    session.steps.findIndex((s) => s.id === fromStepId),
    0,
  );
  const steps = session.steps.slice(from);
  const walks = steps.filter((s): s is WalkStep => s.type === "walk");
  const firstSeg = walks[0] ? DEMO_WALKS[walks[0].id]?.[0] : undefined;
  const walkM = walks.reduce(
    (sum, w) =>
      sum + (DEMO_WALKS[w.id]?.reduce((a, seg) => a + seg.meters, 0) ?? 0),
    0,
  );
  const busM = steps.some((s) => s.type === "onBus") ? 7000 : 0; // 버스 구간 대략 7km
  return {
    session: { ...session, steps },
    preview: {
      direction: firstSeg?.direction ?? "straight",
      distanceM: firstSeg?.meters ?? 0,
      totalRemainingM: walkM + busM,
    },
  };
}

async function mockReroute(session: GuideSession): Promise<ReroutePlan> {
  const hospitalSteps = session.steps.filter(
    (s) => s.type === "arrived" || s.type === "counterHelp",
  );
  return {
    session: {
      ...session,
      expectedArrivalAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      steps: [
        {
          id: "reroute-walk-1",
          type: "walk",
          title: `${DEMO_DESTINATION.name}까지`,
          direction: "right",
          distanceM: 80,
          instruction: "약국이 보이면 오른쪽으로",
          remainingM: 600,
          remainingMin: 10,
        },
        ...hospitalSteps,
      ],
    },
    preview: { direction: "right", distanceM: 80, totalRemainingM: 600 },
  };
}

const toHHmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** 병원까지 거리 한 줄 (위치를 모르면 빈 목록) */
async function distanceLine(
  session: GuideSession,
): Promise<{ time: string; label: string }[]> {
  const km = await distanceToDestinationKm(session).catch(() => null);
  return km != null
    ? [{ time: toHHmm(new Date()), label: `병원에서 ${km.toFixed(1)}KM` }]
    : [];
}

/** 응답 없음 기록 (보호자 무응답 알림은 서버가 위치로 판단해서 보냄) */
export async function reportNoResponse(
  session: GuideSession,
): Promise<NoResponseReport> {
  const lateAt = toHHmm(new Date(session.expectedArrivalAt));
  return {
    timeline: [
      { time: lateAt, label: "도착 시간 지남" },
      ...(await distanceLine(session)),
      { time: toHHmm(new Date()), label: "응답 없음 · 보호자에게 알림" },
    ],
    guardianNotified: true,
  };
}

/** 도움 요청: HELP_REQUESTED 이벤트 (보호자 알림은 서버가 보냄) */
export async function reportHelpRequest(
  session: GuideSession,
): Promise<NoResponseReport> {
  await sendTripEvent(session.id, "HELP_REQUESTED").catch(() => {});
  const lateAt = toHHmm(new Date(session.expectedArrivalAt));
  return {
    timeline: [
      { time: lateAt, label: "도착 시간 지남" },
      ...(await distanceLine(session)),
      { time: toHHmm(new Date()), label: "도움 요청" },
    ],
    guardianNotified: true,
  };
}

/** 안내 종료: 병원 도착 전이면 CANCELLED 이벤트 */
export async function endGuideSession(
  sessionId: string,
  arrived = false,
): Promise<void> {
  if (!arrived) await sendTripEvent(sessionId, "CANCELLED").catch(() => {});
}

/** 다음 정류장에서 내리기 단계 (하차벨 누르기) */
export type AlightStep = {
  id: string;
  type: "alight";
};

/** 병원 도착 단계 (키오스크가 보이는지 묻기) */
export type ArrivedStep = {
  id: string;
  type: "arrived";
};

/** 창구에 보여줄 화면 (키오스크를 못 찾았을 때) */
export type CounterHelpStep = {
  id: string;
  type: "counterHelp";
  userName: string;
  hospital: string;
  date: string;
  time: string;
  department: string;
  scale: string;
};

/** 병원 도착: ARRIVED 이벤트 (보호자 도착 알림은 서버가 보냄) */
export async function notifyArrival(sessionId: string): Promise<void> {
  await sendTripEvent(sessionId, "ARRIVED").catch(() => {});
}
