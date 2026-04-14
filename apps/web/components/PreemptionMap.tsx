'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PreemptionZone {
  id: string;
  name: string;
  code: string;
  geom: any; // PostGIS geometry
}

export default function PreemptionMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map centered on Douala
    map.current = L.map(mapContainer.current).setView([4.0511, 9.7679], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Demo preemption zones (using approximate coordinates)
    const zones = [
      {
        name: 'Zone Préemption - Centre-Ville',
        code: 'DOUALA_CBD',
        bounds: [[4.0400, 9.7412], [4.0511, 9.7550]],
        color: '#FF6B6B',
      },
      {
        name: 'Zone Préemption - Akwa',
        code: 'DOUALA_AKWA',
        bounds: [[4.0150, 9.7300], [4.0300, 9.7450]],
        color: '#4ECDC4',
      },
      {
        name: 'Zone Préemption - Bonamoussadi',
        code: 'DOUALA_BONAMOUSSADI',
        bounds: [[3.9750, 9.7600], [3.9900, 9.7750]],
        color: '#FFE66D',
      },
      {
        name: 'Zone Préemption - Deido',
        code: 'DOUALA_DEIDO',
        bounds: [[4.0450, 9.7200], [4.0600, 9.7350]],
        color: '#95E1D3',
      },
    ];

    // Add zones as rectangles
    zones.forEach((zone) => {
      const rectangle = L.rectangle(zone.bounds, {
        color: zone.color,
        weight: 2,
        opacity: 0.7,
        fill: true,
        fillColor: zone.color,
        fillOpacity: 0.2,
      }).addTo(map.current!);

      rectangle.bindPopup(
        `<strong>${zone.name}</strong><br/>Code: ${zone.code}`
      );
    });

    // Add some demo properties
    const properties = [
      {
        name: 'Terrain - Akwa',
        lat: 4.0305,
        lng: 9.7375,
        status: 'En zone de préemption',
        zone: 'DOUALA_AKWA',
      },
      {
        name: 'Parcelle - Bonamoussadi',
        lat: 3.9825,
        lng: 9.7675,
        status: 'En zone de préemption',
        zone: 'DOUALA_BONAMOUSSADI',
      },
      {
        name: 'Terrain - Logpom',
        lat: 3.9500,
        lng: 9.7500,
        status: 'Hors zones de préemption',
        zone: 'NONE',
      },
    ];

    properties.forEach((prop) => {
      const marker = L.marker([prop.lat, prop.lng], {
        icon: L.icon({
          iconUrl:
            prop.status === 'En zone de préemption'
              ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjRkY2QjZCIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNS41OS01LjU5TDE3IDEwbC03IDd6Ii8+PC9zdmc+'
              : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNDRBRjY5IiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAyYzIuMjEgMCA0IDEuNzkgNCA0cy0xLjc5IDQtNCA0LTQtMS43OS00LTQgMS43OS00IDQtNHptNiAxMGgtMTJ2LTJjMC0yIDQtMyA2LTNzNiAxIDYgM3YyeiIvPjwvc3ZnPg==',
          iconSize: [32, 32],
          className:
            prop.status === 'En zone de préemption'
              ? 'preemption-marker'
              : 'normal-marker',
        }),
      }).addTo(map.current!);

      marker.bindPopup(
        `<strong>${prop.name}</strong><br/><strong>Status:</strong> ${prop.status}`
      );
    });

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-control-layers');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.2);">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Légende</p>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 20px; height: 20px; background-color: rgba(255,107,107,0.3); border: 2px solid #FF6B6B;"></div>
            <span>Zones de Préemption</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="color: #FF6B6B; font-size: 20px;">📍</span>
            <span>Propriété en zone</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #44AF69; font-size: 20px;">📍</span>
            <span>Propriété normale</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map.current);
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}
