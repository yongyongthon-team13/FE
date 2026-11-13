// src/api/guide.ts
import {
  findNextLowFloorBus,
  searchFromHere,
  sendTripEvent,
  startTripSession,
} from "./trips";

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
  alightStop: string; // 내릴 정류장, 예: 'OO정류장'
  stopsLeft: number; // 남은 정거장 수
};

// TODO: 다음 화면 디자인이 오면 단계 타입 추가 (하차, 도착 등)
export type GuideStep =
  | WalkStep
  | WaitBusStep
  | OnBusStep
  | AlightStep
  | ArrivedStep
  | CounterHelpStep;

export type GuideSession = {
  id: string;
  destination: string; // 예: 'OO병원 정문'
  expectedArrivalAt: string; // 병원 도착 예상 시각 (ISO 문자열)
  steps: GuideStep[];
  routePlanId?: string; // 서버 경로 id (실시간 버스 도착 정보용)
  destinationPoint?: { name: string; latitude?: number; longitude?: number }; // 병원 위치 ( 다시 안내용 )
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
  try {
    return await startTripSession(routeId, appointmentId);
  } catch {
    return mockSession();
  }
}

function mockSession(): GuideSession {
  return {
    id: "mock-session",
    destination: "OO병원 정문",
    // 목업: 테스트용으로 1분 뒤를 도착 예상 시각으로
    expectedArrivalAt: new Date(Date.now() + 60 * 1000).toISOString(),
    steps: [
      {
        id: "walk-1",
        type: "walk",
        title: "1번 정류장까지",
        direction: "straight",
        distanceM: 120,
        instruction: "편의점이 보이면 왼쪽으로",
        remainingM: 180,
        remainingMin: 4,
      },
      {
        id: "wait-1",
        type: "waitBus",
        stopName: "XX 정류장",
        busNo: "10번",
        arrivalMin: 4,
        lowFloor: true,
      },
      {
        id: "bus-1",
        type: "onBus",
        alightStop: "OO정류장",
        stopsLeft: 5,
      },
      {
        id: "walk-2",
        type: "walk",
        title: "OO병원 정문까지",
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
        hospital: "OO병원",
        date: "11월 4일(화)",
        time: "오전 10 : 00",
        department: "내과",
        scale: "소중대",
      },
      {
        id: "counter-1",
        type: "counterHelp",
        userName: "OOO",
        hospital: "OO병원",
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

// TODO: 실시간 버스 위치 구독(WebSocket 등)으로 교체
// 지금은 목업: 5초마다 남은 정거장 수를 하나씩 줄임. 반환값은 구독 해제 함수
export function subscribeBusRide(
  sessionId: string,
  step: OnBusStep,
  onUpdate: (updated: OnBusStep) => void,
): () => void {
  let stopsLeft = step.stopsLeft;
  const timer = setInterval(() => {
    stopsLeft = Math.max(stopsLeft - 1, 0);
    onUpdate({ ...step, stopsLeft });
  }, 5000);
  return () => clearInterval(timer);
}

// TODO: POST /guide-sessions/{id}/reroute 연동 (현재 위치 기준으로 남은 단계 다시 계산)
export async function rerouteGuideSession(
  session: GuideSession,
  fromStepId: string,
): Promise<GuideSession> {
  await new Promise((r) => setTimeout(r, 300));
  return session;
}

/** '지금 계신 곳에서 다시 안내': 현재 위치에서 병원까지 새 경로 (실패하면 목업) */
export async function rerouteFromHere(
  session: GuideSession,
): Promise<ReroutePlan> {
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
          title: "OO병원 정문까지",
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

// TODO: POST /guide-sessions/{id}/no-response 연동 (현재 위치 전송 + 보호자에게 문자 발송 후 기록 받기)
export async function reportNoResponse(
  session: GuideSession,
): Promise<NoResponseReport> {
  await new Promise((r) => setTimeout(r, 300));
  const lateAt = toHHmm(new Date(session.expectedArrivalAt));
  return {
    timeline: [
      { time: lateAt, label: "도착 시간 지남" },
      { time: lateAt, label: "병원에서 1.2KM" },
      { time: toHHmm(new Date()), label: "전화 알림 / 응답 없음" },
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
      { time: lateAt, label: "병원에서 1.2KM" },
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
