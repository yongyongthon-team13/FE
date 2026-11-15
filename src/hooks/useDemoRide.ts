// src/hooks/useDemoRide.ts
// 시연용 길 안내: 시간에 따라 마커를 경로 위로 움직이고, 마커 위치에 맞춰 걷기 안내 문구를 바꿈
import { useEffect, useRef, useState } from "react";

import {
  DEMO_BUS_PATH,
  DEMO_POINTS,
  DEMO_WALKS,
  pointAlong,
  type LatLng,
} from "@/api/demoRide";
import type { GuideStep, WalkStep } from "@/api/guide";

const TICK_MS = 500;
const WALK_MPS = 6; // 시연용 걷는 속도 (실제보다 빠르게: 120m를 20초에)
const REAL_WALK_MPM = 67; // 남은 시간 표시용 실제 걷는 속도 (분당 m)
const BUS_STOP_MS = 5000; // 버스 한 정거장 (subscribeBusRide 시연 동작과 같은 간격)
const ZOOM_WALK = 17;
const ZOOM_BUS = 13;

export function useDemoRide(active: boolean, step: GuideStep | null) {
  const [elapsed, setElapsed] = useState(0);
  const busStops = useRef(0); // 버스 단계 시작 때 남은 정거장 수

  // 단계가 바뀌면 처음부터, 걷기·버스 단계에서만 시간 흐름
  useEffect(() => {
    setElapsed(0);
    if (step?.type === "onBus") busStops.current = step.stopsLeft;
    if (!active || (step?.type !== "walk" && step?.type !== "onBus")) return;
    const t = setInterval(() => setElapsed((e) => e + TICK_MS), TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step?.id]);

  let position: LatLng = DEMO_POINTS.HOME;
  let zoom = ZOOM_WALK;
  let walk: WalkStep | null = null;

  if (step?.type === "walk") {
    const segs = DEMO_WALKS[step.id];
    if (segs) {
      const total = segs.reduce((s, x) => s + x.meters, 0);
      const traveled = Math.min((elapsed / 1000) * WALK_MPS, total);
      let left = traveled;
      let i = 0;
      while (i < segs.length - 1 && left >= segs[i].meters) {
        left -= segs[i].meters;
        i++;
      }
      const seg = segs[i];
      position = pointAlong(seg.path, seg.meters ? left / seg.meters : 1);
      const remain = total - traveled;
      walk = {
        ...step,
        direction: seg.direction,
        instruction: seg.instruction,
        distanceM: Math.max(Math.round((seg.meters - left) / 10) * 10, 0),
        remainingM: Math.round(remain),
        remainingMin: Math.ceil(remain / REAL_WALK_MPM),
      };
      if (remain <= 0)
        walk = {
          ...walk,
          distanceM: 0,
          instruction: "다 왔어요! '도착했어요'를 눌러 주세요",
        };
    }
  } else if (step?.type === "waitBus") {
    position = DEMO_POINTS.STOP_FROM;
  } else if (step?.type === "onBus") {
    const duration = Math.max(busStops.current - 1, 1) * BUS_STOP_MS;
    position = pointAlong(DEMO_BUS_PATH, elapsed / duration);
    zoom = ZOOM_BUS;
  } else if (step?.type === "alight") {
    position = DEMO_POINTS.STOP_TO;
  } else if (step) {
    position = DEMO_POINTS.HOSPITAL;
  }

  return { position, zoom, walk };
}
