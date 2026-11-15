// src/api/demoRide.ts
// 시연용 길 안내: 지도 위 마커가 움직일 경로 (처인구청 부근 → 용인착한마디의원)
// 걷기 구간은 꺾이는 지점마다 나눠서, 마커가 어느 구간에 있는지에 따라 안내 문구가 바뀜
import type { Direction } from "./guide";

export type LatLng = [number, number];

/** 걷기 안내 한 구간: 이 구간을 걷는 동안 보여줄 방향·문구 */
export type WalkSegment = {
  path: LatLng[];
  meters: number;
  direction: Direction;
  instruction: string;
};

const HOME: LatLng = [37.2342, 127.2017]; // 집 (처인구청 부근)
const TURN_1: LatLng = [37.2346, 127.2012];
const STOP_FROM: LatLng = [37.2349, 127.2008]; // 처인구청 정류장
const STOP_TO: LatLng = [37.2707, 127.1256]; // 강남대역.강남대입구 정류장
const TURN_2: LatLng = [37.2709, 127.1257];
const HOSPITAL: LatLng = [37.271, 127.126]; // 용인착한마디의원

/** 단계 id별 걷기 구간 (trips.ts의 시연 안내 단계 id와 같음) */
export const DEMO_WALKS: Record<string, WalkSegment[]> = {
  "walk-1": [
    {
      path: [HOME, TURN_1],
      meters: 70,
      direction: "straight",
      instruction: "편의점이 보이면 왼쪽으로",
    },
    {
      path: [TURN_1, STOP_FROM],
      meters: 50,
      direction: "left",
      instruction: "정류장 표지판이 보일 때까지 쭉 가세요",
    },
  ],
  "walk-2": [
    {
      path: [STOP_TO, TURN_2],
      meters: 30,
      direction: "straight",
      instruction: "횡단보도를 건너 강남대역 쪽으로",
    },
    {
      path: [TURN_2, HOSPITAL],
      meters: 30,
      direction: "right",
      instruction: "건물 1층 입구로 들어가세요",
    },
  ],
};

/** 버스 구간 (처인구청 정류장 → 강남대역.강남대입구 정류장) */
export const DEMO_BUS_PATH: LatLng[] = [
  STOP_FROM,
  [37.2365, 127.1935],
  [37.241, 127.1776],
  [37.252, 127.16],
  [37.264, 127.142],
  [37.269, 127.13],
  STOP_TO,
];

/** 지도에 그릴 전체 경로 선 */
export const DEMO_FULL_PATH: LatLng[] = [
  ...DEMO_WALKS["walk-1"].flatMap((s, i) =>
    i === 0 ? s.path : s.path.slice(1),
  ),
  ...DEMO_BUS_PATH.slice(1),
  ...DEMO_WALKS["walk-2"].flatMap((s) => s.path.slice(1)),
];

export const DEMO_POINTS = { HOME, STOP_FROM, STOP_TO, HOSPITAL };

// ── 선 위의 위치 계산
const dist = (a: LatLng, b: LatLng) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** 선(path)을 처음부터 비율 t(0~1)만큼 간 위치 */
export function pointAlong(path: LatLng[], t: number): LatLng {
  if (path.length === 1) return path[0];
  const lens = path.slice(1).map((p, i) => dist(path[i], p));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (left <= lens[i] || i === lens.length - 1) {
      const r = lens[i] === 0 ? 0 : Math.min(left / lens[i], 1);
      const [a, b] = [path[i], path[i + 1]];
      return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
    }
    left -= lens[i];
  }
  return path[path.length - 1];
}
