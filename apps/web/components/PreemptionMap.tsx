'use client';

import { useEffect, useRef } from 'react';

const ZONES = [
  { name: 'Centre-Ville', code: 'DOUALA_CBD', bounds: [[4.0400, 9.7412], [4.0511, 9.7550]] as [[number,number],[number,number]] },
  { name: 'Akwa', code: 'DOUALA_AKWA', bounds: [[4.0150, 9.7300], [4.0300, 9.7450]] as [[number,number],[number,number]] },
  { name: 'Bonamoussadi', code: 'DOUALA_BONAMOUSSADI', bounds: [[3.9750, 9.7600], [3.9900, 9.7750]] as [[number,number],[number,number]] },
  { name: 'Deido', code: 'DOUALA_DEIDO', bounds: [[4.0450, 9.7200], [4.0600, 9.7350]] as [[number,number],[number,number]] },
];

const PROPERTIES = [
  { name: 'Terrain — Akwa', lat: 4.0305, lng: 9.7375, inZone: true },
  { name: 'Parcelle — Bonamoussadi', lat: 3.9825, lng: 9.7675, inZone: true },
  { name: 'Terrain — Logpom', lat: 3.9500, lng: 9.7500, inZone: false },
];

function makeMarkerSvg(inZone: boolean): string {
  const fill = inZone ? '#E8A000' : '#007A5E';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22S28 23.63 28 14C28 6.27 21.73 0 14 0z" fill="${fill}"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function PreemptionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

      const map = L.map(containerRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView([4.0300, 9.7450], 12);

      mapRef.current = map;

      // Dark tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Subtle attribution bottom-left
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright" style="color:rgba(255,255,255,0.3)">OSM</a> · © <a href="https://carto.com" style="color:rgba(255,255,255,0.3)">CARTO</a>')
        .addTo(map);

      // Zoom control — top-right, styled
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Preemption zones
      ZONES.forEach((zone) => {
        L.rectangle(zone.bounds, {
          color: '#00A67E',
          weight: 1.5,
          opacity: 0.8,
          fill: true,
          fillColor: '#007A5E',
          fillOpacity: 0.18,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:'DM Sans',sans-serif;padding:4px 0">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#007A5E;margin-bottom:4px">Zone de préemption</div>
              <div style="font-size:14px;font-weight:700;color:#0F1F1A">${zone.name}</div>
              <div style="font-size:11px;color:#6B7280;font-family:monospace;margin-top:2px">${zone.code}</div>
            </div>`,
            { className: 'predem-popup' }
          );
      });

      // Property markers
      PROPERTIES.forEach((prop) => {
        const icon = L.icon({
          iconUrl: makeMarkerSvg(prop.inZone),
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

        L.marker([prop.lat, prop.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:'DM Sans',sans-serif;padding:4px 0">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${prop.inZone ? '#E8A000' : '#007A5E'};margin-bottom:4px">
                ${prop.inZone ? 'En zone de préemption' : 'Hors zone'}
              </div>
              <div style="font-size:13px;font-weight:700;color:#0F1F1A">${prop.name}</div>
            </div>`,
            { className: 'predem-popup' }
          );
      });

      // Legend — bottom-right
      const legend = (L.control as any)({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div');
        div.innerHTML = `
          <div style="background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.18);min-width:180px;font-family:'DM Sans',system-ui,sans-serif">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007A5E;margin-bottom:10px">Légende</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div style="width:16px;height:16px;border-radius:3px;background:rgba(0,122,94,0.18);border:1.5px solid #00A67E;flex-shrink:0"></div>
              <span style="font-size:12px;color:#374151">Zone de préemption</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <div style="width:10px;height:10px;border-radius:50%;background:#E8A000;box-shadow:0 0 0 3px rgba(232,160,0,0.2)"></div>
              </div>
              <span style="font-size:12px;color:#374151">Bien en zone</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <div style="width:10px;height:10px;border-radius:50%;background:#007A5E;box-shadow:0 0 0 3px rgba(0,122,94,0.2)"></div>
              </div>
              <span style="font-size:12px;color:#374151">Bien hors zone</span>
            </div>
          </div>`;
        return div;
      };
      legend.addTo(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      <style>{`
        .predem-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.14);
          padding: 0;
        }
        .predem-popup .leaflet-popup-content { margin: 12px 16px; }
        .predem-popup .leaflet-popup-tip { background: white; }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          background: rgba(15,31,26,0.85) !important;
          color: rgba(255,255,255,0.8) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(0,122,94,0.85) !important; }
        .leaflet-control-attribution { background: transparent !important; font-size: 10px; }
      `}</style>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '520px',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
    </>
  );
}
