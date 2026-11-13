// src/components/guardian/LeafletMap.web.tsx
// 웹: iframe으로 지도 HTML 띄우기 (react-native-webview는 웹을 지원하지 않음)
import { createElement } from "react";

import { leafletHtml, type ElderMapProps } from "./leafletHtml";

export function LeafletMap(props: ElderMapProps) {
  return createElement("iframe", {
    srcDoc: leafletHtml(props),
    title: "어르신 위치 지도",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      border: 0,
      pointerEvents: props.interactive ? "auto" : "none",
    },
  });
}
