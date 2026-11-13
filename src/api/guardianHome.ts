// src/api/guardianHome.ts
// 보호자 홈 화면 데이터
import {
  ampm,
  clinicText,
  dateOf,
  elderPointOf,
  etaOf,
  getActiveTrip,
  getElderAppointments,
  getElderContact,
  getPendingTasks,
  hm,
  md,
  missingFields,
  moveText,
  nowLabel,
  requireElderId,
  todayHospitalOf,
  toElderStatus,
  upcomingOf,
  WEEK,
  type ActiveTrip,
  type ServerAppointment,
} from "./guardianData";
import { findPendingRides, toRideTodo } from "./rideHelp";

export type ElderStatus =
  | "beforeDeparture"
  | "onTheWay"
  | "atHospital"
  | "returned"
  | "noResponse";

export type NextVisit = {
  dDay: number; // 진료까지 남은 날 (예: 3 → 'D-3')
  dateLabel: string; // 예: '11/4 (화) 오전 10:00'
  summary: string; // 예: 'OO병원 내과 · 동행서비스 8:30 픽업'
};

/** '확인이 필요해요' 항목 */
export type GuardianTodo = {
  id: string; // 일정 id (appointmentId)
  kind: "smsMissing" | "review" | "ride"; // 문자 정보 부족 / 진료 후기 / 차 부탁
  title: string; // 예: '병원 문자 일부를 못 읽었어요'
  sub: string; // 예: '11/18 XX의원 · 시간·진료과'
  actionLabel: string; // 예: '입력', '작성'
};

/** '다가오는 일정' 항목 */
export type UpcomingVisit = {
  id: string;
  day: number; // 예: 4
  monthWeek: string; // 예: '11월 화'
  title: string; // 예: 'OO병원 내과 10:00'
  sub: string; // 예: '동행서비스 · 8:30 픽업'
  badge: { label: string; tone: "done" | "warning" }; // 예: '신청 완료' / '정보 부족'
};

/** 진료 당일: 지금 이동 상황 */
export type TodayTrip = {
  nowLabel: string; // 예: '10번 저상버스 안'
  etaLabel: string; // 병원 도착 예상 시각, 예: '9:28'
  progress: {
    total: number; // 진행 단계(점) 개수, 예: 6
    current: number; // 지금 단계 (0부터), 예: 2
    startLabel: string; // 예: '탑승'
    currentLabel: string; // 예: '남은 정거장 3개'
    endLabel: string; // 예: '하차'
  };
  logs: TodayLog[];
};

/** 진료 당일: '오늘 기록' 한 줄 */
export type TodayLog = {
  id: string;
  time: string; // 예: '07:40'
  parts: { text: string; bold?: boolean }[]; // 예: [{text:'컨디션 응답 · '}, {text:'보통', bold:true}]
  done: boolean; // false면 예정(흐리게)
};

export type GuardianHome = {
  elderName: string; // 보호자가 부르는 이름 (예: '어머니')
  elderPhone: string;
  status: ElderStatus;
  nextVisit: NextVisit | null;
  todos: GuardianTodo[];
  upcoming: UpcomingVisit[];
  today: TodayTrip | null; // 진료 당일 이동 중일 때만 값이 있음
  tripId: string | null; // 이동 중일 때 이동 기록 id (보호자 연락 기록용 )
  elderLocation: { latitude: number; longitude: number } | null; // 이동 중 어르신 마지막 위치
  hospitalLocation: {
    latitude: number;
    longitude: number;
    name: string;
  } | null; // 오늘 가는 병원
};

// 목업: true로 바꾸면 진료 당일(이동 중) 홈 화면을 볼 수 있어요 (10단계 active-trip 연동 전까지)
const MOCK_TODAY = false;

const MOCK_TODAY_TRIP: TodayTrip = {
  nowLabel: "10번 저상버스 안",
  etaLabel: "9:28",
  progress: {
    total: 6,
    current: 2,
    startLabel: "탑승",
    currentLabel: "남은 정거장 3개",
    endLabel: "하차",
  },
  logs: [
    {
      id: "l1",
      time: "07:40",
      parts: [
        { text: "컨디션 응답 · " },
        { text: "보통", bold: true },
        { text: " · 지팡이 사용" },
      ],
      done: true,
    },
    { id: "l2", time: "08:52", parts: [{ text: "집에서 출발" }], done: true },
    {
      id: "l3",
      time: "09:05",
      parts: [{ text: "10번 저상버스 탑승" }],
      done: true,
    },
    {
      id: "l4",
      time: "09:28",
      parts: [{ text: "병원 도착 예정" }],
      done: false,
    },
  ],
};

// ── 서버 일정 → 화면 항목
function toNextVisit(a: ServerAppointment): NextVisit {
  const d = dateOf(a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = d ? new Date(d) : null;
  day?.setHours(0, 0, 0, 0);
  return {
    dDay: day ? Math.round((day.getTime() - today.getTime()) / 86400000) : 0,
    dateLabel: d
      ? `${md(d)} (${WEEK[d.getDay()]})${a.appointmentAt ? ` ${ampm(d)}` : ""}`
      : "날짜 미정",
    summary: [clinicText(a), moveText(a).replace(" · ", " ")]
      .filter(Boolean)
      .join(" · "),
  };
}

function toUpcoming(a: ServerAppointment): UpcomingVisit {
  const d = dateOf(a);
  const missing = missingFields(a);
  return {
    id: a.appointmentId,
    day: d ? d.getDate() : 0,
    monthWeek: d ? `${d.getMonth() + 1}월 ${WEEK[d.getDay()]}` : "",
    title: `${clinicText(a)}${d && a.appointmentAt ? ` ${hm(d)}` : ""}`,
    sub: moveText(a),
    badge:
      missing.length > 0
        ? { label: "정보 부족", tone: "warning" }
        : a.companion
          ? { label: "신청 완료", tone: "done" }
          : { label: "예정", tone: "done" },
  };
}

function toHelpTodo(a: ServerAppointment): GuardianTodo {
  const d = dateOf(a);
  return {
    id: a.appointmentId,
    kind: "smsMissing",
    title: "병원 문자 일부를 못 읽었어요",
    sub:
      [d && md(d), a.clinicName].filter(Boolean).join(" ") +
      ` · ${missingFields(a).join("·")}`,
    actionLabel: "입력",
  };
}

function toReviewTodo(a: ServerAppointment): GuardianTodo {
  const d = dateOf(a);
  return {
    id: a.appointmentId,
    kind: "review",
    title: "지난 진료는 어떠셨나요?",
    sub: [d && md(d), a.clinicName].filter(Boolean).join(" ") + " · 후기 입력",
    actionLabel: "작성",
  };
}

// ── 이동 중 카드 (active-trip → 화면)
const PROGRESS = ["DEPARTED", "BOARDED", "ALIGHTED", "ARRIVED"] as const;

function toTodayTrip(trip: ActiveTrip): TodayTrip {
  const eta = etaOf(trip);
  const current = Math.max(
    PROGRESS.indexOf(trip.lastEventType as (typeof PROGRESS)[number]),
    0,
  );
  const logs: TodayLog[] = [];
  if (trip.startedAt) {
    logs.push({
      id: "start",
      time: hm(new Date(trip.startedAt)),
      parts: [{ text: "집에서 출발" }],
      done: true,
    });
  }
  if (trip.lastEventType && trip.lastEventType !== "DEPARTED") {
    logs.push({
      id: "last",
      time: trip.lastLocationAt ? hm(new Date(trip.lastLocationAt)) : "",
      parts: [{ text: nowLabel(trip), bold: true }],
      done: true,
    });
  }
  if (eta) {
    logs.push({
      id: "eta",
      time: hm(new Date(eta)),
      parts: [{ text: "병원 도착 예정" }],
      done: false,
    });
  }
  return {
    nowLabel: nowLabel(trip),
    etaLabel: eta ? hm(new Date(eta)) : "-",
    progress: {
      total: PROGRESS.length,
      current,
      startLabel: "출발",
      currentLabel: nowLabel(trip),
      endLabel: "병원 도착",
    },
    logs,
  };
}

/** 보호자 홈: 연결 어르신 이름 + 일정 + 할 일 */
export async function getGuardianHome(): Promise<GuardianHome> {
  const elderId = await requireElderId();
  const [elder, list, tasks, trip] = await Promise.all([
    getElderContact(elderId),
    getElderAppointments(elderId),
    getPendingTasks(elderId),
    getActiveTrip(elderId),
  ]);
  const moving = trip?.status === "ACTIVE" || trip?.status === "HELP_REQUESTED";
  const upcoming = upcomingOf(list);
  // 가까운 일정 3개에서 아직 답하지 않은 차 부탁
  const rides = await findPendingRides(upcoming.slice(0, 3));

  return {
    elderName: elder.name,
    elderPhone: elder.phone,
    status: MOCK_TODAY ? "onTheWay" : toElderStatus(trip),
    nextVisit: upcoming[0] ? toNextVisit(upcoming[0]) : null,
    todos: [
      ...(tasks.helpRequests ?? []).map(toHelpTodo),
      ...(tasks.visitReviews ?? []).map(toReviewTodo),
      ...rides.map((r) => toRideTodo(elder.name, r)),
    ],
    upcoming: upcoming.slice(0, 3).map(toUpcoming),
    today: MOCK_TODAY
      ? MOCK_TODAY_TRIP
      : moving && trip
        ? toTodayTrip(trip)
        : null,
    tripId: moving && trip ? trip.tripId : null,
    elderLocation: moving ? elderPointOf(trip) : null,
    hospitalLocation: todayHospitalOf(list),
  };
}
