// src/components/guardian/leafletHtml.ts
// 지도 HTML (Leaflet + OpenStreetMap, API 키 필요 없음) — 앱은 WebView, 웹은 iframe으로 띄움

export type MapPoint = { latitude: number; longitude: number };

export type ElderMapProps = {
  elderName: string; // 예: '어머니'
  elder: MapPoint | null; // 어르신 마지막 위치 (없으면 안내 문구)
  hospital?: (MapPoint & { name: string }) | null; // 오늘 가는 병원
  height?: number;
  interactive?: boolean; // false면 손으로 움직일 수 없는 미리보기
};

export function leafletHtml({
  elderName,
  elder,
  hospital,
  interactive,
}: ElderMapProps): string {
  const data = JSON.stringify({
    elder: elder ? [elder.latitude, elder.longitude] : null,
    elderName,
    hospital: hospital ? [hospital.latitude, hospital.longitude] : null,
    hospitalName: hospital?.name ?? "병원",
    interactive: !!interactive,
  });
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { margin: 0; height: 100%; background: #E8EBE4; }
  .leaflet-tooltip { font: 600 12px sans-serif; color: #2F471D; border-radius: 8px; }
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var d = ${data};
  var on = d.interactive;
  var map = L.map("map", {
    zoomControl: on, dragging: on, scrollWheelZoom: on, doubleClickZoom: on,
    touchZoom: on, boxZoom: on, keyboard: on, attributionControl: true,
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap",
  }).addTo(map);
  var pts = [];
  if (d.hospital) {
    L.circleMarker(d.hospital, { radius: 8, color: "#fff", weight: 3, fillColor: "#2F471D", fillOpacity: 1 })
      .addTo(map).bindTooltip(d.hospitalName, { permanent: true, direction: "top", offset: [0, -8] });
    pts.push(d.hospital);
  }
  if (d.elder) {
    L.circleMarker(d.elder, { radius: 10, color: "#fff", weight: 3, fillColor: "#4F7730", fillOpacity: 1 })
      .addTo(map).bindTooltip(d.elderName, { permanent: true, direction: "top", offset: [0, -10] });
    pts.push(d.elder);
  }
  if (pts.length > 1) map.fitBounds(pts, { padding: [36, 36] });
  else if (pts.length === 1) map.setView(pts[0], 16);
</script>
</body></html>`;
}
