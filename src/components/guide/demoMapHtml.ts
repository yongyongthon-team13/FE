// src/components/guide/demoMapHtml.ts
// 길 안내 고정 지도 HTML: 시연 경로 선 + 병원 + 움직이는 내 위치 마커
// 마커 위치는 앱이 setPos(위도, 경도)로 바꿈 (앱: injectJavaScript, 웹: postMessage)
import type { LatLng } from "@/api/demoRide";

export function demoMapHtml(path: LatLng[], hospital: LatLng, hospitalName: string): string {
  const data = JSON.stringify({ path, hospital, hospitalName });
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
  var map = L.map("map", { zoomControl: false, dragging: false, scrollWheelZoom: false,
    doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  L.polyline(d.path, { color: "#729259", weight: 5, opacity: 0.85 }).addTo(map);
  L.circleMarker(d.hospital, { radius: 8, color: "#fff", weight: 3, fillColor: "#2F471D", fillOpacity: 1 })
    .addTo(map).bindTooltip(d.hospitalName, { permanent: true, direction: "top", offset: [0, -8] });
  var me = L.circleMarker(d.path[0], { radius: 10, color: "#fff", weight: 3, fillColor: "#E4675F", fillOpacity: 1 })
    .addTo(map).bindTooltip("지금 여기", { permanent: true, direction: "top", offset: [0, -10] });
  map.setView(d.path[0], 17);
  window.setPos = function (lat, lng, zoom) {
    me.setLatLng([lat, lng]);
    map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
  };
  window.addEventListener("message", function (e) {
    var m = e.data;
    if (m && m.type === "pos") window.setPos(m.lat, m.lng, m.zoom);
  });
</script>
</body></html>`;
}
