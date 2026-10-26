import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { KumbhMap } from '../components/map/KumbhMap';
import type { Zone, CCTV, EmergencyUnit, POILocation, Incident } from '../types';
import { MapPin, RefreshCw, Layers } from 'lucide-react';

export const MapView: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [cctvs, setCctvs] = useState<CCTV[]>([]);
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [pois, setPois] = useState<POILocation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMapData = async () => {
    try {
      const data = await api.get('/zones/map-data');
      setZones(data.zones || []);
      setCctvs(data.cctvs || []);
      setUnits(data.emergencyUnits || []);
      setPois(data.poiLocations || []);
      setIncidents(data.activeIncidents || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1800px] mx-auto h-[calc(100vh-4.5rem)] flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>Interactive GIS Geospatial Command Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Full Prayagraj Triveni Sangam sector boundaries, emergency corridors, CCTVs, and first-responder fleet tracking.
          </p>
        </div>

        <button
          onClick={fetchMapData}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
          title="Refresh Map Layers"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        <KumbhMap
          zones={zones}
          cctvs={cctvs}
          emergencyUnits={units}
          poiLocations={pois}
          activeIncidents={incidents}
          height="100%"
        />
      </div>
    </div>
  );
};
