// src/components/guide/DemoGuideMap.tsx
// 앱: WebView 지도에 마커 위치를 injectJavaScript로 전달 (웹은 DemoGuideMap.web.tsx)
import { type ComponentRef, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { DEMO_FULL_PATH, DEMO_POINTS, type LatLng } from "@/api/demoRide";
import { DEMO_DESTINATION } from "@/api/routes";

import { demoMapHtml } from "./demoMapHtml";

type Props = { position: LatLng; zoom: number };

/** 길 안내 고정 지도 (시연 경로 위를 마커가 움직임) */
export function DemoGuideMap({ position, zoom }: Props) {
  const ref = useRef<ComponentRef<typeof WebView>>(null);
  // 지도는 한 번만 만들고 마커만 움직임 (HTML이 바뀌면 지도가 다시 그려짐)
  const html = useMemo(
    () =>
      demoMapHtml(DEMO_FULL_PATH, DEMO_POINTS.HOSPITAL, DEMO_DESTINATION.name),
    [],
  );

  useEffect(() => {
    ref.current?.injectJavaScript(
      `window.setPos && window.setPos(${position[0]}, ${position[1]}, ${zoom}); true;`,
    );
  }, [position, zoom]);

  return (
    <View style={styles.map} pointerEvents="none">
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html }}
        scrollEnabled={false}
        style={styles.web}
      />
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
  web: { flex: 1, backgroundColor: "#E8EBE4" },
});
