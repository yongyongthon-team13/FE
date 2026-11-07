// src/api/guardianHome.ts
// 보호자 홈 화면 데이터

export type ElderStatus = 'beforeDeparture' | 'onTheWay' | 'atHospital' | 'returned' | 'noResponse';

export type NextVisit = {
  dDay: number; // 진료까지 남은 날 (예: 3 → 'D-3')
  dateLabel: string; // 예: '11/4 (화) 오전 10:00'
  summary: string; // 예: 'OO병원 내과 · 동행서비스 8:30 픽업'
};

/** '확인이 필요해요' 항목 */
export type GuardianTodo = {
  id: string;
  kind: 'smsMissing' | 'review'; // 문자 정보 부족 / 진료 후기
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
  badge: { label: string; tone: 'done' | 'warning' }; // 예: '신청 완료' / '정보 부족'
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
};

// 목업: true로 바꾸면 진료 당일(이동 중) 홈 화면을 볼 수 있어요
const MOCK_TODAY = false;

const MOCK_TODAY_TRIP: TodayTrip = {
  nowLabel: '10번 저상버스 안',
  etaLabel: '9:28',
  progress: { total: 6, current: 2, startLabel: '탑승', currentLabel: '남은 정거장 3개', endLabel: '하차' },
  logs: [
    {
      id: 'l1',
      time: '07:40',
      parts: [{ text: '컨디션 응답 · ' }, { text: '보통', bold: true }, { text: ' · 지팡이 사용' }],
      done: true,
    },
    { id: 'l2', time: '08:52', parts: [{ text: '집에서 출발' }], done: true },
    { id: 'l3', time: '09:05', parts: [{ text: '10번 저상버스 탑승' }], done: true },
    { id: 'l4', time: '09:28', parts: [{ text: '병원 도착 예정' }], done: false },
  ],
};

// 목업: 처리 완료한 '확인이 필요해요' 항목 id (실제로는 서버가 목록에서 빼서 내려줌)
const doneTodoIds = new Set<string>();
export function markTodoDone(id: string) {
  doneTodoIds.add(id);
}

// TODO: GET /guardian/home 연동
export async function getGuardianHome(): Promise<GuardianHome> {
  await new Promise(r => setTimeout(r, 300));
  return {
    elderName: '어머니',
    elderPhone: '01012345678',
    status: MOCK_TODAY ? 'onTheWay' : 'beforeDeparture',
    nextVisit: {
      dDay: 3,
      dateLabel: '11/4 (화) 오전 10:00',
      summary: 'OO병원 내과 · 동행서비스 8:30 픽업',
    },
    todos: ([
      { id: 't1', kind: 'smsMissing', title: '병원 문자 일부를 못 읽었어요', sub: '11/18 XX의원 · 시간·진료과', actionLabel: '입력' },
      { id: 't2', kind: 'review', title: '지난 진료는 어떠셨나요?', sub: '10/21 OO병원 · 후기 입력', actionLabel: '작성' },
    ] as GuardianTodo[]).filter(todo => !doneTodoIds.has(todo.id)),
    upcoming: [
      {
        id: 'u1',
        day: 4,
        monthWeek: '11월 화',
        title: 'OO병원 내과 10:00',
        sub: '동행서비스 · 8:30 픽업',
        badge: { label: '신청 완료', tone: 'done' },
      },
      {
        id: 'u2',
        day: 18,
        monthWeek: '11월 화',
        title: 'XX의원 14:00',
        sub: '10번 저상버스 예정',
        badge: { label: '정보 부족', tone: 'warning' },
      },
    ],
    today: MOCK_TODAY ? MOCK_TODAY_TRIP : null,
  };
}