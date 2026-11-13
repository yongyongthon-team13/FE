// src/components/guardian/LeafletMap.tsx
// 앱(안드로이드·iOS): WebView로 지도 HTML 띄우기 (웹은 LeafletMap.web.tsx)
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { leafletHtml, type ElderMapProps } from "./leafletHtml";

export function LeafletMap(props: ElderMapProps) {
  return (
    // 미리보기는 터치를 막아서 바깥 Pressable이 눌리게
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={props.interactive ? "auto" : "none"}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: leafletHtml(props) }}
        scrollEnabled={false}
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: "#E8EBE4" },
});
