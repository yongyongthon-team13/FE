// src/api/scheduleHelp.ts
// 어르신이 일정 입력 중 도움을 요청한 일정 → 보호자가 빈 칸을 대신 채움
import { apiRequest } from "@/lib/api";
import { parseDate, parseTime } from "./appointments";
import {
  dateOf,
  getElderName,
  getPendingTasks,
  josa,
  missingFields,
  requireElderId,
  WEEK,
} from "./guardianData";
import type { ElderStatus } from "./guardianHome";

export type ScheduleHelpRequest = {
  id: string; // 일정 id (appointmentId)
  elderName: string;
  status: ElderStatus;
  title: string; // 초록 카드 큰 글씨, 예: '어머니가 도움을 요청했어요'
  sub: string; // 초록 카드 작은 글씨, 예: '병원 문자에서 시간을 못 읽었어요'
  infoTitle: string; // 흰 카드 제목, 예: '어머니가 읽은 정보'
  rows: { label: string; value: string }[]; // 어르신 쪽에서 이미 읽은 정보, 예: 병원 / 날짜
  fieldLabel: string; // 보호자가 채울 항목, 예: '시간'
  fieldValue: string; // 채워 둔 값(있으면)
  appointmentDate: string | null; // 시간 채울 때 날짜와 합치려고 보관
};

/** 보호자: pending-tasks의 helpRequests에서 해당 일정 찾기 */
export async function getScheduleHelpRequest(
  id: string,
): Promise<ScheduleHelpRequest> {
  const elderId = await requireElderId();
  const [elderName, tasks] = await Promise.all([
    getElderName(elderId),
    getPendingTasks(elderId),
  ]);
  const a =
    (tasks.helpRequests ?? []).find((t) => t.appointmentId === id) ??
    tasks.helpRequests?.[0];
  if (!a) throw new Error("도움 요청이 없어요");

  const d = dateOf(a);
  const field = missingFields(a)[0] ?? "시간";
  const rows = [
    a.clinicName ? { label: "병원", value: a.clinicName } : null,
    d
      ? {
          label: "날짜",
          value: `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`,
        }
      : null,
    a.department ? { label: "진료과", value: a.department } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  return {
    id: a.appointmentId,
    elderName,
    status: "beforeDeparture",
    title: `${josa(elderName, "이", "가")} 도움을 요청했어요`,
    sub: `병원 문자에서 ${josa(field, "을", "를")} 못 읽었어요`,
    infoTitle: `${josa(elderName, "이", "가")} 읽은 정보`,
    rows,
    fieldLabel: field,
    fieldValue: "",
    appointmentDate: a.appointmentDate ?? null,
  };
}

/** POST /api/v1/guardian/elder-profiles/{elderId}/appointments/{appointmentId}/assist */
export async function submitScheduleHelp(
  req: ScheduleHelpRequest,
  value: string,
): Promise<void> {
  const elderId = await requireElderId();
  let body: Record<string, string> = {};
  if (req.fieldLabel === "병원") body = { clinicName: value };
  if (req.fieldLabel === "진료과") body = { department: value };
  if (req.fieldLabel === "날짜") {
    const date = parseDate(value);
    if (!date) throw new Error("날짜를 읽지 못했어요");
    body = { appointmentDate: date };
  }
  if (req.fieldLabel === "시간") {
    const time = parseTime(value);
    if (!time || !req.appointmentDate) throw new Error("시간을 읽지 못했어요");
    body = { appointmentAt: `${req.appointmentDate}T${time}:00+09:00` };
  }
  await apiRequest(
    `/api/v1/guardian/elder-profiles/${elderId}/appointments/${req.id}/assist`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
