// src/api/appointments.ts
// 병원 문자 → 일정 뽑기(AI) / 일정 저장
import { ApiError, apiRequest } from "@/lib/api";
import { getElderId } from "@/lib/tokenStorage";
import { addAppointment, setAppointments } from "@/store/appointments";
import { Platform } from "react-native";

/** 화면에서 쓰는 일정 (모두 글자) */
export type AppointmentDraft = {
  hospital: string;
  date: string; // 예: '11월 4일(화)'
  time: string; // 예: '오전 10 : 00'
  department: string;
  scale: string; // 소 / 중 / 대
};

export const isDraftComplete = (d: AppointmentDraft) =>
  Object.values(d).every((v) => (v ?? "").trim() !== "");

// ── 서버 값 ↔ 화면 글자 바꾸기
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const SIZE_TO_LABEL: Record<string, string> = {
  SMALL: "소",
  MEDIUM: "중",
  LARGE: "대",
};
const LABEL_TO_SIZE: Record<string, "SMALL" | "MEDIUM" | "LARGE"> = {
  소: "SMALL",
  중: "MEDIUM",
  대: "LARGE",
};

function toDisplayDate(date?: string | null): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEK[d.getDay()]})`;
}

function toDisplayTime(dateTime?: string | null): string {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12} : ${pad(d.getMinutes())}`;
}

/** '11월 4일(화)' → '2026-11-04' (오늘보다 이전 날짜면 내년으로) */
export function parseDate(text: string): string | null {
  const m = text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let year = today.getFullYear();
  if (new Date(year, month - 1, day) < today) year += 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** '오전 10 : 00', '오후 2시 30분' → '14:30' */
export function parseTime(text: string): string | null {
  const m = text.match(/(오전|오후)?\s*(\d{1,2})\s*(?::|시)\s*(\d{1,2})?/);
  if (!m) return null;
  let hour = Number(m[2]);
  const minute = m[3] ? Number(m[3]) : /시\s*반/.test(text) ? 30 : 0;
  if (m[1] === "오후" && hour < 12) hour += 12;
  if (m[1] === "오전" && hour === 12) hour = 0;
  return `${pad(hour)}:${pad(minute)}`;
}

/** 말한 내용 → 날짜·시간 글자 (예: '내일 오전 10시', '다음 주 화요일 2시 반', '11월 4일 오후 3시')
 *  못 알아들은 칸은 빈 글자 */
export function parseWhen(text: string): { date: string; time: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const plus = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  let day: Date | null = null;
  const md = parseDate(text);
  const week = text.match(/(다음\s*주|담주)?\s*([일월화수목금토])요일/);
  if (md) day = new Date(`${md}T00:00:00`);
  else if (/모레/.test(text)) day = plus(2);
  else if (/내일/.test(text)) day = plus(1);
  else if (/오늘/.test(text)) day = today;
  else if (week) {
    const target = WEEK.indexOf(week[2]);
    if (week[1]) {
      // 다음 주 월요일부터 세기
      const toNextMonday = (8 - today.getDay()) % 7 || 7;
      day = plus(toNextMonday + ((target + 6) % 7));
    } else {
      day = plus((target - today.getDay() + 7) % 7 || 7);
    }
  }

  let time = parseTime(text); // 'HH:MM'
  // '2시'처럼 오전/오후를 안 말하면 1~6시는 오후로
  if (time && !/(오전|오후|아침|저녁)/.test(text)) {
    const h = Number(time.slice(0, 2));
    if (h >= 1 && h <= 6) time = `${pad(h + 12)}${time.slice(2)}`;
  }

  const iso = day
    ? `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
    : null;
  return {
    date: iso ? toDisplayDate(iso) : "",
    time: time ? toDisplayTime(`${iso ?? "2000-01-01"}T${time}:00`) : "",
  };
}

// ── 문자에서 일정 뽑기
type ExtractedAppointment = {
  type?: "NEW" | "CHANGE" | "CANCEL";
  clinicName?: string | null;
  clinicSize?: string | null;
  department?: string | null;
  appointmentDate?: string | null;
  appointmentAt?: string | null;
};

/** 서버가 뽑은 일정 → 화면 일정 (못 뽑았으면 오류 → 직접 입력 화면) */
function toDraft(res: { items: ExtractedAppointment[] }): AppointmentDraft {
  const item = res.items?.find((i) => i.type !== "CANCEL");
  if (!item) throw new ApiError(503);
  return {
    hospital: item.clinicName ?? "",
    date: toDisplayDate(
      item.appointmentDate ?? item.appointmentAt?.slice(0, 10),
    ),
    time: toDisplayTime(item.appointmentAt),
    department: item.department ?? "",
    scale: SIZE_TO_LABEL[item.clinicSize ?? ""] ?? "",
  };
}

/** 문자 글자 → 일정: POST /api/v1/appointment-extractions (JSON) */
export async function extractAppointment(
  message: string,
): Promise<AppointmentDraft> {
  const res = await apiRequest<{ items: ExtractedAppointment[] }>(
    "/api/v1/appointment-extractions",
    {
      method: "POST",
      body: JSON.stringify({ text: message }),
    },
  );
  return toDraft(res);
}

/** 캡처 사진 → 일정: 같은 주소에 multipart로 image 보냄 */
export async function extractAppointmentFromImage(
  uri: string,
  mimeType = "image/jpeg",
): Promise<AppointmentDraft> {
  const form = new FormData();
  if (Platform.OS === "web") {
    // 웹: 사진 주소 → 파일 데이터로 바꿔서 첨부
    const blob = await (await fetch(uri)).blob();
    form.append("image", blob, "capture.jpg");
  } else {
    // 폰: 파일 경로를 그대로 첨부
    form.append("image", {
      uri,
      name: "capture.jpg",
      type: mimeType,
    } as unknown as Blob);
  }
  const res = await apiRequest<{ items: ExtractedAppointment[] }>(
    "/api/v1/appointment-extractions",
    {
      method: "POST",
      body: form,
    },
  );
  return toDraft(res);
}

// ── 일정 저장
/** POST /api/v1/appointments → 홈 목록에도 추가하고 서버 일정 id 돌려줌 */
export async function saveAppointment(
  draft: AppointmentDraft,
  source: "SMS" | "MANUAL" | "GUARDIAN" = "SMS",
  opts: {
    helpRequested?: boolean;
    clinicLat?: number;
    clinicLon?: number;
    clinicAddress?: string;
  } = {},
): Promise<string> {
  const elderId = await getElderId();
  if (!elderId) throw new ApiError(400, "NO_ELDER", "어르신 정보가 없어요");

  const date = parseDate(draft.date);
  const time = parseTime(draft.time);

  const saved = await apiRequest<{ appointmentId: string }>(
    "/api/v1/appointments",
    {
      method: "POST",
      body: JSON.stringify({
        elderId,
        source,
        clinicName: draft.hospital.trim(),
        ...(LABEL_TO_SIZE[draft.scale.trim()]
          ? { clinicSize: LABEL_TO_SIZE[draft.scale.trim()] }
          : {}),
        ...(date ? { appointmentDate: date } : {}),
        ...(date && time ? { appointmentAt: `${date}T${time}:00+09:00` } : {}),
        ...(draft.department.trim()
          ? { department: draft.department.trim() }
          : {}),
        ...(opts.helpRequested ? { helpRequested: true } : {}),
        ...(opts.clinicLat != null && opts.clinicLon != null
          ? { clinicLat: opts.clinicLat, clinicLon: opts.clinicLon }
          : {}),
        ...(opts.clinicAddress ? { clinicAddress: opts.clinicAddress } : {}),
      }),
    },
  );

  addAppointment(draft, saved.appointmentId); // 홈 화면 목록 (GET 연동 전까지)
  return saved.appointmentId;
}

// ── 내 일정 불러오기 (홈 목록)
type ServerAppointmentItem = {
  appointmentId: string;
  clinicName?: string | null;
  clinicSize?: string | null;
  department?: string | null;
  appointmentDate?: string | null;
  appointmentAt?: string | null;
  status?: string | null;
  companion?: {
    pickupAt?: string | null;
    pickupPlace?: string | null;
    managerName?: string | null;
  } | null;
};

const timeOf = (a: ServerAppointmentItem) =>
  a.appointmentAt
    ? new Date(a.appointmentAt).getTime()
    : a.appointmentDate
      ? new Date(`${a.appointmentDate}T00:00:00`).getTime()
      : Infinity;

/** GET /api/v1/appointments (오늘부터 90일) → 홈 목록 (가까운 일정부터) */
export async function loadMyAppointments(): Promise<void> {
  const elderId = await getElderId();
  if (!elderId) return;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 90);
  const params = new URLSearchParams({
    elderId,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const list = await apiRequest<ServerAppointmentItem[]>(
    `/api/v1/appointments?${params.toString()}`,
  );

  setAppointments(
    list
      .filter((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED")
      .sort((x, y) => timeOf(x) - timeOf(y))
      .map((a) => {
        const pickup = a.companion?.pickupAt
          ? new Date(a.companion.pickupAt)
          : null;
        return {
          id: a.appointmentId,
          hospital: a.clinicName ?? "",
          date: toDisplayDate(
            a.appointmentDate ?? a.appointmentAt?.slice(0, 10),
          ),
          time: toDisplayTime(a.appointmentAt),
          department: a.department ?? "",
          scale: SIZE_TO_LABEL[a.clinicSize ?? ""] ?? "",
          ...(pickup
            ? {
                companion: {
                  service:
                    `동행 서비스 · ${pickup.getHours()}:${pad(pickup.getMinutes())} ${a.companion?.pickupPlace ?? ""}`.trim(),
                  manager: `${a.companion?.managerName || "동행 매니저"}와 함께`,
                },
              }
            : {}),
        };
      }),
  );
}
