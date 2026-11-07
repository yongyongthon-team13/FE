export type RoutePlan = {
  id: string;
  buses: string[];
  walkMeters: number;
  transfers: number;
  minutes: number;
  recommended?: boolean;
};

// TODO: POST /route-plans/search 연동 (excludeIds 전달)
const MOCK_POOL: RoutePlan[] = [
  { id: '1', buses: ['10번'], walkMeters: 180, transfers: 0, minutes: 35, recommended: true },
  { id: '2', buses: ['66번', '10번'], walkMeters: 90, transfers: 1, minutes: 42 },
  { id: '3', buses: ['66번', '10번'], walkMeters: 90, transfers: 1, minutes: 42 },
  { id: '4', buses: ['5번'], walkMeters: 250, transfers: 0, minutes: 40 },
  { id: '5', buses: ['820번', '10번'], walkMeters: 120, transfers: 1, minutes: 45 },
  { id: '6', buses: ['66번'], walkMeters: 300, transfers: 0, minutes: 48 },
];

export async function searchRoutePlans(excludeIds: string[] = []): Promise<RoutePlan[]> {
  await new Promise(r => setTimeout(r, 800));
  return MOCK_POOL.filter(p => !excludeIds.includes(p.id)).slice(0, 3);
}
export type RouteStep = {
  type: 'walk' | 'bus';
  title: string;
  summary: string;
};

// TODO: GET /route-plans/{id} 연동
export async function getRoutePlan(id: string): Promise<(RoutePlan & { steps: RouteStep[] }) | null> {
  await new Promise(r => setTimeout(r, 500));
  const plan = MOCK_POOL.find(p => p.id === id);
  if (!plan) return null;

  const steps: RouteStep[] = [
    { type: 'walk', title: '집 → OO 정류장', summary: `걸어서 ${plan.walkMeters}m · 4분` },
    ...plan.buses.map(bus => ({ type: 'bus' as const, title: `${bus} 저상버스`, summary: '5개의 정거장 · 25분' })),
    { type: 'walk', title: 'XX정류장 → 병원', summary: '걸어서 150m · 3분' },
  ];
  return { ...plan, steps };
}

export type DeparturePlan = {
  date: string; // 병원 가는 날 'YYYY-MM-DD'
  departAt: string;
  arriveAt: string;
};

// TODO: route-plans/{id} 응답의 날짜·출발·도착 시간으로 교체
export async function getDeparturePlan(routeId: string): Promise<DeparturePlan> {
  await new Promise(r => setTimeout(r, 300));
  const d = new Date();
  d.setDate(d.getDate() + 1); // 목업: 내일
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date, departAt: '오전 8:45', arriveAt: '9:28' };
}