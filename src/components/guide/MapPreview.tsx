// src/components/guide/MapPreview.tsx
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { LeafletMap } from "@/components/guardian/LeafletMap";

type Props = {
  caption?: string;
};

/** 길 안내: 지금 내 위치 지도 (위치 권한이 없으면 회색 칸) */
export function MapPreview({ caption = "지도 · 현재 위치" }: Props) {
  const [here, setHere] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (alive)
        setHere({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.map}>
        {here && <LeafletMap elderName="지금 여기" elder={here} />}
      </View>
      <AppText variant="small" color="#828282" style={styles.caption}>
        {caption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  map: {
    width: 268,
    maxWidth: "100%",
    height: 170,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
    borderWidth: 1,
    borderColor: "#A0A0A0",
  },
  caption: { marginTop: 6, fontSize: 13 },
});
