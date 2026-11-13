// src/components/guardian/ElderMapPreview.tsx
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";

import { LeafletMap } from "./LeafletMap";
import type { ElderMapProps } from "./leafletHtml";

/** 진료 당일 이동 중: 어르신 마지막 위치 지도 (+ 오늘 가는 병원) */
export function ElderMapPreview(props: ElderMapProps) {
  const { elderName, elder, height = 96 } = props;
  return (
    <View style={[styles.box, { height }]}>
      {elder ? (
        <LeafletMap {...props} />
      ) : (
        <AppText variant="small" color="#9AA391">
          {`${elderName} 위치를 아직 받지 못했어요`}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EBE4",
  },
});
