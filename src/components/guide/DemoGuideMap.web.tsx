// src/components/guide/DemoGuideMap.web.tsx
// 웹: iframe 지도에 마커 위치를 postMessage로 전달
import { createElement, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { DEMO_FULL_PATH, DEMO_POINTS, type LatLng } from "@/api/demoRide";
import { DEMO_DESTINATION } from "@/api/routes";

import { demoMapHtml } from "./demoMapHtml";

type Props = { position: LatLng; zoom: number };

export function DemoGuideMap({ position, zoom }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const html = useMemo(
    () =>
      demoMapHtml(DEMO_FULL_PATH, DEMO_POINTS.HOSPITAL, DEMO_DESTINATION.name),
    [],
  );

  useEffect(() => {
    ref.current?.contentWindow?.postMessage(
      { type: "pos", lat: position[0], lng: position[1], zoom },
      "*",
    );
  }, [position, zoom]);

  return (
    <View style={styles.map}>
      {createElement("iframe", {
        ref,
        srcDoc: html,
        title: "길 안내 지도",
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          pointerEvents: "none",
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCE4D6",
    backgroundColor: "#E8EBE4",
  },
});
