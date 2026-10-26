import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Zone, CCTV, EmergencyUnit, POILocation, Incident } from '../../types';
import { Layers, Shield, Eye, Flame, Ambulance, Video, AlertTriangle } from 'lucide-react';

interface KumbhMapProps {
  zones: Zone[];
  cctvs?: CCTV[];
  emergencyUnits?: EmergencyUnit[];
  poiLocations?: POILocation[];
  activeIncidents?: Incident[];
  selectedZoneId?: string | null;
  onSelectZone?: (zone: Zone) => void;
  height?: string;
}

export const KumbhMap: React.FC<KumbhMapProps> = ({
  zones,
  cctvs = [],
  emergencyUnits = [],
  poiLocations = [],
  activeIncidents = [],
  selectedZoneId,
  onSelectZone,
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter toggles
  const [showZones, setShowZones] = useState(true);
  const [showCCTV, setShowCCTV] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Triveni Sangam, Prayagraj
    const map = L.map(mapContainerRef.current, {
      center: [25.4300, 81.8800],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark styled OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when data or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Render Zones
    if (showZones) {
      zones.forEach((zone) => {
        const riskColor =
          zone.riskLevel === 'CRITICAL'
            ? '#EF4444'
            : zone.riskLevel === 'HIGH'
            ? '#F97316'
            : zone.riskLevel === 'MODERATE'
            ? '#F59E0B'
            : '#10B981';

        // Outer pulsing circle for critical/high
        if (zone.riskLevel === 'CRITICAL' || zone.riskLevel === 'HIGH') {
          const pulseCircle = L.circle([zone.latitude, zone.longitude], {
            radius: zone.riskLevel === 'CRITICAL' ? 350 : 250,
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: zone.riskLevel === 'CRITICAL' ? 0.25 : 0.15,
            weight: 2,
            dashArray: '4, 8',
          });
          pulseCircle.addTo(layerGroup);
        }

        // Zone Center Marker
        const zoneIcon = L.divIcon({
          className: 'custom-zone-marker',
          html: `
            <div style="
              background-color: ${riskColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              color: white;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            ">
              ${Math.round(zone.density)}%
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([zone.latitude, zone.longitude], { icon: zoneIcon });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #F8FAFC; width: 220px; line-height: 1.4;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #FCD34D;">
              ${zone.name}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
              ${zone.code} • ${zone.movementDirection || 'Inflow'}
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94A3B8;">Current Crowd:</span>
              <span style="font-weight: 700;">${zone.currentCrowd.toLocaleString()} / ${zone.capacity.toLocaleString()}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94A3B8;">Crowd Density:</span>
              <span style="font-weight: 800; color: ${riskColor};">${zone.density}% (${zone.riskLevel})</span>
            </div>

            <div style="width: 100%; background: #334155; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
              <div style="width: ${Math.min(zone.density, 100)}%; background: ${riskColor}; height: 100%;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94A3B8;">Risk Score:</span>
              <span style="font-weight: 700; color: #FCD34D;">${zone.riskScore} / 100</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94A3B8;">Flow Dynamics:</span>
              <span style="font-size: 11px;">+${zone.inflowRate}/m | -${zone.outflowRate}/m</span>
            </div>

            <div style="font-size: 11px; padding: 4px; background: rgba(0,0,0,0.3); border-radius: 4px; border: 1px solid #334155; margin-top: 6px;">
              Status: <span style="font-weight: bold; color: ${riskColor};">${zone.status}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });

        marker.addTo(layerGroup);
      });
    }

    // 2. Render CCTVs
    if (showCCTV) {
      cctvs.forEach((cam) => {
        const camIcon = L.divIcon({
          className: 'cctv-marker',
          html: `
            <div style="
              background: #0284C7;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              font-size: 12px;
            ">
              📹
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([cam.latitude, cam.longitude], { icon: camIcon });
        marker.bindPopup(`
          <div style="font-size: 12px; color: #F8FAFC;">
            <div style="font-weight: bold; color: #38BDF8;">${cam.cameraCode} - ${cam.name}</div>
            <div>Status: <span style="color: #34D399;">${cam.status}</span> • ${cam.resolution}</div>
            <div>Crowd Count: <b>${cam.crowdEstimate.toLocaleString()}</b> (${cam.densityPercent}%)</div>
            <div style="margin-top: 4px; font-size: 11px; color: #94A3B8;">Live feed stream active</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 3. Render Emergency Units (Ambulances, Police, Fire, NDRF)
    if (showUnits) {
      emergencyUnits.forEach((unit) => {
        const iconChar =
          unit.type === 'AMBULANCE'
            ? '🚑'
            : unit.type === 'FIRE_BRIGADE'
            ? '🚒'
            : unit.type === 'DISASTER_RESPONSE'
            ? '🚤'
            : '🚓';

        const bg =
          unit.type === 'AMBULANCE'
            ? '#DC2626'
            : unit.type === 'FIRE_BRIGADE'
            ? '#EA580C'
            : unit.type === 'DISASTER_RESPONSE'
            ? '#0284C7'
            : '#2563EB';

        const unitIcon = L.divIcon({
          className: 'unit-marker',
          html: `
            <div style="
              background: ${bg};
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              font-size: 13px;
            ">
              ${iconChar}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([unit.latitude, unit.longitude], { icon: unitIcon });
        marker.bindPopup(`
          <div style="font-size: 12px; color: #F8FAFC;">
            <div style="font-weight: bold; color: #FCD34D;">${unit.name}</div>
            <div>Code: <b>${unit.unitCode}</b> (${unit.vehicleNumber})</div>
            <div>Status: <span style="color: ${unit.status === 'AVAILABLE' ? '#34D399' : '#F87171'}; font-weight: bold;">${unit.status}</span></div>
            <div>ETA Distance: <b>${unit.distanceKm} km</b></div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">Contact: ${unit.contactNumber}</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 4. Render POIs (Hospital, Police, Exits)
    if (showPOIs) {
      poiLocations.forEach((poi) => {
        const iconSymbol =
          poi.type === 'MEDICAL_CAMP'
            ? '🏥'
            : poi.type === 'POLICE_POST'
            ? '👮'
            : poi.type === 'FIRE_STATION'
            ? '🔥'
            : poi.type === 'EMERGENCY_EXIT'
            ? '🚪'
            : '📍';

        const poiIcon = L.divIcon({
          className: 'poi-marker',
          html: `
            <div style="
              background: #1E293B;
              border: 1px solid #475569;
              width: 22px;
              height: 22px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
            ">
              ${iconSymbol}
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([poi.latitude, poi.longitude], { icon: poiIcon });
        marker.bindPopup(`
          <div style="font-size: 12px; color: #F8FAFC;">
            <div style="font-weight: bold; color: #F8FAFC;">${poi.name}</div>
            <div style="color: #94A3B8; font-size: 11px;">${poi.description || ''}</div>
            <div style="color: #38BDF8; font-size: 10px; margin-top: 4px;">${poi.contactInfo || ''}</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 5. Render Active Incidents
    if (showIncidents) {
      activeIncidents.forEach((inc) => {
        const incIcon = L.divIcon({
          className: 'incident-marker',
          html: `
            <div style="
              background: #DC2626;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid #FEE2E2;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              box-shadow: 0 0 10px rgba(220, 38, 38, 0.8);
            ">
              ⚠️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: incIcon });
        marker.bindPopup(`
          <div style="font-size: 12px; color: #F8FAFC;">
            <div style="font-weight: bold; color: #F87171;">⚠️ ${inc.title}</div>
            <div>Category: <b>${inc.category}</b> • Severity: <b>${inc.severity}</b></div>
            <div>Status: <span style="font-weight: bold; color: #FBBF24;">${inc.status}</span></div>
            <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">${inc.description}</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }
  }, [zones, cctvs, emergencyUnits, poiLocations, activeIncidents, showZones, showCCTV, showUnits, showPOIs, showIncidents]);

  // Center on selectedZoneId if provided
  useEffect(() => {
    if (!selectedZoneId || !mapInstanceRef.current) return;
    const target = zones.find((z) => z.id === selectedZoneId);
    if (target) {
      mapInstanceRef.current.setView([target.latitude, target.longitude], 15, { animate: true });
    }
  }, [selectedZoneId, zones]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900" style={{ height }}>
      {/* Map Filter Controls Floating Header */}
      <div className="absolute top-3 right-3 z-[20] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 shadow-xl text-xs">
        <button
          onClick={() => setShowZones(!showZones)}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
            showZones ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Zones"
        >
          <span>Zones</span>
        </button>

        <button
          onClick={() => setShowCCTV(!showCCTV)}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
            showCCTV ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle CCTV"
        >
          <span>CCTV</span>
        </button>

        <button
          onClick={() => setShowUnits(!showUnits)}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
            showUnits ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Units"
        >
          <span>Fleet</span>
        </button>

        <button
          onClick={() => setShowPOIs(!showPOIs)}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
            showPOIs ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle POIs"
        >
          <span>POIs</span>
        </button>

        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
            showIncidents ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Incidents"
        >
          <span>Incidents</span>
        </button>
      </div>

      {/* Legend Badge at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[20] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-xl text-[11px] flex items-center gap-3">
        <span className="font-bold text-slate-300">Density Risk:</span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Safe &lt;50%
        </span>
        <span className="flex items-center gap-1 text-amber-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Moderate
        </span>
        <span className="flex items-center gap-1 text-orange-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> High
        </span>
        <span className="flex items-center gap-1 text-red-400 font-semibold animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Critical &gt;85%
        </span>
      </div>

      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
