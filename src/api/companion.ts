export type CompanionProvider = {
  name: string;
  phone: string;
};

export type CompanionAssessment = {
  reason: string;
  serviceName: string;
  estimatedCost: string;
  provider: CompanionProvider;
};

// TODO: POST /appointments/{id}/companion-assessments 연동
// AI가 고른 기관의 번호는 백엔드가 공공데이터에서 꺼내서 내려줌
export async function getCompanionAssessment(appointmentId: string): Promise<CompanionAssessment> {
  await new Promise(r => setTimeout(r, 500));
  return {
    reason: '추천 이유',
    serviceName: '고령 어르신 동행 서비스',
    estimatedCost: '',
    provider: { name: '처인구 OO복지관', phone: '031-000-0000' }, // 목업
  };
}

export type CompanionRequestDraft = {
  name: string;
  departure: string;
  vehicle: string;
  mobilityAid: string;
  estimatedCost: string;
};

// TODO: elder-profiles + companion-assessments 결과로 교체
export async function getCompanionRequestDraft(appointmentId: string): Promise<CompanionRequestDraft> {
  await new Promise(r => setTimeout(r, 300));
  return { name: '김영자', departure: '처인구 OO로', vehicle: '필요', mobilityAid: '지팡이', estimatedCost: '' };
}

export type CompanionRequestResult = {
  pickupTime: string;
  pickupPlace: string;
  companionType: string;
};

// TODO: GET /appointments/{id}/companion-requests 결과로 교체
export async function getCompanionRequestResult(appointmentId: string): Promise<CompanionRequestResult> {
  await new Promise(r => setTimeout(r, 300));
  return { pickupTime: '8:30', pickupPlace: '집 앞', companionType: '동행 매니저' };
}