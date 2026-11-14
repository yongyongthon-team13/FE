// src/api/companion.ts
// 동행 서비스: 필요 판단(규칙) → 신청 → 전화 후 결과
import { ensureElderId } from "@/api/elderProfile";
import { apiRequest } from "@/lib/api";
import { getElderProfile } from "./elderProfile";

const won = (n?: number | null) =>
  n == null ? "" : n === 0 ? "무료" : `${n.toLocaleString()}원`;

// ── 1. 동행이 필요한지
export type CompanionAssessment = {
  recommended: boolean;
  reason: string;
  serviceName: string;
  estimatedCost: string;
};

type AssessmentResponse = {
  recommended: boolean;
  reasonText: string | null;
  serviceName: string | null;
  estimatedCostWon: number | null;
};

/** POST /api/v1/appointments/{id}/companion-assessments */
export async function getCompanionAssessment(
  appointmentId: string,
): Promise<CompanionAssessment> {
  const res = await apiRequest<AssessmentResponse>(
    `/api/v1/appointments/${appointmentId}/companion-assessments`,
    { method: "POST" },
  );
  return {
    recommended: res.recommended,
    reason: res.reasonText ?? "",
    serviceName: res.serviceName ?? "병원 동행 서비스",
    estimatedCost: won(res.estimatedCostWon),
  };
}

// ── 2. 신청서
type RequestResponse = {
  requestId: string;
  applicantName: string | null;
  departureAddress: string | null;
  vehicleNeeded: boolean | null;
  servicePhone: string | null;
  estimatedCostWon: number | null;
  status: "PENDING" | "CONTACTED" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  pickupAt: string | null;
  pickupPlace: string | null;
  managerName: string | null;
};

export type CompanionRequestDraft = {
  requestId: string;
  phone: string; // 기관 전화번호
  name: string;
  departure: string;
  vehicle: string; // '필요' / '불필요'
  mobilityAid: string;
  estimatedCost: string;
};

const AID_LABEL: Record<string, string> = {
  WHEELCHAIR: "휠체어",
  WALKER: "보행기",
  CANE: "지팡이",
  NONE: "",
};

const listRequests = (appointmentId: string) =>
  apiRequest<RequestResponse[]>(
    `/api/v1/appointments/${appointmentId}/companion-requests`,
  );

/** 진행 중인 신청이 있으면 그걸, 없으면 새로 신청 (화면을 다시 열어도 중복 신청 안 되게) */
export async function getCompanionRequestDraft(
  appointmentId: string,
): Promise<CompanionRequestDraft> {
  const existing = (await listRequests(appointmentId)).find(
    (r) => r.status === "PENDING" || r.status === "CONTACTED",
  );
  const req =
    existing ??
    (await apiRequest<RequestResponse>(
      `/api/v1/appointments/${appointmentId}/companion-requests`,
      {
        method: "POST",
        body: JSON.stringify({ bookingMethod: "PHONE" }),
      },
    ));

  // 보조기구는 신청 응답에 없어서 어르신 정보에서 가져옴
  let mobilityAid = "";
  try {
    const elderId = await ensureElderId();
    if (elderId)
      mobilityAid =
        AID_LABEL[
          (await getElderProfile(elderId)).mobility?.mobilityAid ?? ""
        ] ?? "";
  } catch {
    // 못 가져오면 빈칸 (화면에서 직접 입력)
  }

  return {
    requestId: req.requestId,
    phone: req.servicePhone ?? "",
    name: req.applicantName ?? "",
    departure: req.departureAddress ?? "",
    vehicle: req.vehicleNeeded ? "필요" : "불필요",
    mobilityAid,
    estimatedCost: won(req.estimatedCostWon),
  };
}

// ── 3. 전화 후
/** 전화를 걸었음 → PATCH status CONTACTED */
export function markCompanionCalled(
  appointmentId: string,
  requestId: string,
): Promise<void> {
  return apiRequest(
    `/api/v1/appointments/${appointmentId}/companion-requests/${requestId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "CONTACTED" }),
    },
  ).then(() => undefined);
}

export type CompanionRequestResult = {
  pickupTime: string;
  pickupPlace: string;
  companionType: string;
};

/** 가장 최근 신청의 픽업 정보 */
export async function getCompanionRequestResult(
  appointmentId: string,
): Promise<CompanionRequestResult> {
  const list = await listRequests(appointmentId);
  const req = list[list.length - 1];
  const at = req?.pickupAt ? new Date(req.pickupAt) : null;
  return {
    pickupTime: at
      ? `${at.getHours()}:${String(at.getMinutes()).padStart(2, "0")}`
      : "시간 확인 중",
    pickupPlace: req?.pickupPlace ?? "집 앞",
    companionType: req?.managerName
      ? `${req.managerName} 매니저`
      : "동행 매니저",
  };
}

/** 통화로 들은 픽업 정보 저장 → PATCH status CONFIRMED */
export function saveCompanionPickup(
  appointmentId: string,
  requestId: string,
  pickup: { pickupAt?: string; pickupPlace: string },
): Promise<void> {
  return apiRequest(
    `/api/v1/appointments/${appointmentId}/companion-requests/${requestId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "CONFIRMED", ...pickup }),
    },
  ).then(() => undefined);
}
