import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { EmergencyUnit } from '../types';
import {
  Ambulance,
  Shield,
  Flame,
  Radio,
  MapPin,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';

export const EmergencyServices: React.FC = () => {
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchUnits = async () => {
    try {
      const data = await api.get('/emergency/units');
      setUnits(data);
    } catch (err) {
      console.error('Failed to load emergency units:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleToggleStatus = async (unit: EmergencyUnit, newStatus: string) => {
    try {
      await api.patch(`/emergency/units/${unit.id}`, { status: newStatus });
      await fetchUnits();
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const filteredUnits = units.filter((u) => {
    if (typeFilter !== 'ALL' && u.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.unitCode.toLowerCase().includes(q);
    }
    return true;
  });

  const availableCount = units.filter((u) => u.status === 'AVAILABLE').length;
  const busyCount = units.filter((u) => u.status === 'BUSY' || u.status === 'DISPATCHED').length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-red-500" />
            <span>Emergency Services &amp; First Responder Fleet</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dispatch coordination across 108 Ambulances, Dial 112 Police Vans, Fire Tenders, and NDRF Water Rescue Boats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">AVAILABLE UNITS</span>
              <span className="font-bold text-emerald-400">{availableCount} / {units.length}</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">DISPATCHED / ACTIVE</span>
              <span className="font-bold text-red-400">{busyCount} Units</span>
            </div>
          </div>

          <button
            onClick={fetchUnits}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Refresh Fleet"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search unit by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All Fleet
          </button>
          <button
            onClick={() => setTypeFilter('AMBULANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'AMBULANCE' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Ambulances (108)
          </button>
          <button
            onClick={() => setTypeFilter('POLICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'POLICE' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Police PCR (112)
          </button>
          <button
            onClick={() => setTypeFilter('FIRE_BRIGADE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'FIRE_BRIGADE' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Fire Brigade (101)
          </button>
          <button
            onClick={() => setTypeFilter('DISASTER_RESPONSE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'DISASTER_RESPONSE' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            NDRF Water Rescue
          </button>
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUnits.map((unit) => {
          const isAvailable = unit.status === 'AVAILABLE';
          const isDispatched = unit.status === 'DISPATCHED' || unit.status === 'BUSY';

          const iconChar =
            unit.type === 'AMBULANCE'
              ? '🚑'
              : unit.type === 'FIRE_BRIGADE'
              ? '🚒'
              : unit.type === 'DISASTER_RESPONSE'
              ? '🚤'
              : '🚓';

          return (
            <div
              key={unit.id}
              className={`bg-slate-900/90 rounded-xl p-4 border transition-all flex flex-col justify-between shadow-lg ${
                isDispatched ? 'border-red-600/70 shadow-red-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{iconChar}</span>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        {unit.unitCode} • {unit.vehicleNumber}
                      </div>
                      <h3 className="font-extrabold text-sm text-white">{unit.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                      isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 my-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deployed Sector:</span>
                    <span className="font-semibold text-white">{unit.zone?.name || 'Central Transit'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ETA Distance to Confluence:</span>
                    <span className="font-mono text-amber-300 font-bold">{unit.distanceKm} km (~{Math.round(unit.distanceKm * 3.5)} min)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direct Wireless / Hotline:</span>
                    <span className="font-mono text-slate-200">{unit.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Status Switch Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Quick Status Override:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(unit, 'AVAILABLE')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                      isAvailable
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleToggleStatus(unit, 'DISPATCHED')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                      unit.status === 'DISPATCHED'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Dispatched
                  </button>
                  <button
                    onClick={() => handleToggleStatus(unit, 'BUSY')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                      unit.status === 'BUSY'
                        ? 'bg-amber-600 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Busy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
