import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Zone } from '../types';
import { getSocket } from '../services/socket';
import {
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Compass,
  Radio
} from 'lucide-react';

export const CrowdMonitoring: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingZoneId, setUpdatingZoneId] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      const data = await api.get('/zones');
      setZones(data);
    } catch (err) {
      console.error('Error fetching zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();

    const socket = getSocket();
    const handleCrowdUpdate = (data: any) => {
      setZones((prev) =>
        prev.map((z) => {
          if (z.id === data.zoneId || z.code === data.zoneId) {
            return {
              ...z,
              currentCrowd: data.crowdCount !== undefined ? data.crowdCount : z.currentCrowd,
              density: data.densityPercent !== undefined ? data.densityPercent : z.density,
              riskLevel: data.riskLevel || z.riskLevel,
              riskScore: data.riskScore !== undefined ? data.riskScore : z.riskScore,
              status: data.status || z.status,
            };
          }
          return z;
        })
      );
    };

    socket.on('crowd:update', handleCrowdUpdate);
    return () => {
      socket.off('crowd:update', handleCrowdUpdate);
    };
  }, []);

  const handleAdjustCrowd = async (zone: Zone, delta: number) => {
    setUpdatingZoneId(zone.id);
    const newCrowd = Math.max(0, zone.currentCrowd + delta);
    try {
      await api.post('/crowd/update', {
        zoneId: zone.id,
        crowdCount: newCrowd,
        inflowRate: delta > 0 ? zone.inflowRate + 40 : Math.max(60, zone.inflowRate - 40),
        outflowRate: zone.outflowRate,
      });
      await fetchZones();
    } catch (err: any) {
      alert(`Adjustment error: ${err.message}`);
    } finally {
      setUpdatingZoneId(null);
    }
  };

  const handleSliderChange = async (zone: Zone, value: number) => {
    setUpdatingZoneId(zone.id);
    try {
      await api.post('/crowd/update', {
        zoneId: zone.id,
        crowdCount: value,
        inflowRate: value > zone.currentCrowd ? zone.inflowRate + 50 : zone.inflowRate,
        outflowRate: zone.outflowRate,
      });
      await fetchZones();
    } catch (err: any) {
      alert(`Slider update error: ${err.message}`);
    } finally {
      setUpdatingZoneId(null);
    }
  };

  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const totalHeadcount = zones.reduce((acc, z) => acc + z.currentCrowd, 0);
  const avgDensity = totalCapacity > 0 ? Math.round((totalHeadcount / totalCapacity) * 1000) / 10 : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Zone-Based Live Crowd Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time headcount, saturation density, movement vectors and threshold breach alert triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">TOTAL OCCUPANCY</span>
              <span className="font-bold text-white">
                {totalHeadcount.toLocaleString()} / {totalCapacity.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">AVG DENSITY</span>
              <span className="font-bold text-amber-400">{avgDensity}%</span>
            </div>
          </div>

          <button
            onClick={fetchZones}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Refresh Zones"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 10 Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const isCritical = zone.riskLevel === 'CRITICAL';
          const isHigh = zone.riskLevel === 'HIGH';
          const isModerate = zone.riskLevel === 'MODERATE';

          const riskBadgeColor = isCritical
            ? 'bg-red-600 text-white animate-pulse'
            : isHigh
            ? 'bg-orange-600 text-white'
            : isModerate
            ? 'bg-amber-500 text-slate-950 font-bold'
            : 'bg-emerald-600 text-white';

          const borderHighlight = isCritical
            ? 'border-red-600/90 shadow-red-900/30 shadow-lg'
            : isHigh
            ? 'border-orange-600/70'
            : 'border-slate-800';

          return (
            <div
              key={zone.id}
              className={`bg-slate-900/90 rounded-xl p-4 border transition-all ${borderHighlight}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {zone.code}
                  </div>
                  <h3 className="font-extrabold text-sm text-white">{zone.name}</h3>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded font-mono ${riskBadgeColor}`}>
                  {zone.riskLevel}
                </span>
              </div>

              {/* Headcount vs Capacity */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Headcount vs Capacity</span>
                  <span className="font-mono font-bold text-slate-200">
                    {zone.currentCrowd.toLocaleString()} / {zone.capacity.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? 'bg-red-500'
                        : isHigh
                        ? 'bg-orange-500'
                        : isModerate
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(zone.density, 100)}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">DENSITY</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {zone.density}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AI RISK SCORE</span>
                  <span className="font-mono text-sm font-bold text-amber-300">
                    {zone.riskScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">INFLOW RATE</span>
                  <span className="font-mono text-xs text-blue-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{zone.inflowRate}/min
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">OUTFLOW RATE</span>
                  <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -{zone.outflowRate}/min
                  </span>
                </div>
              </div>

              {/* Vector Direction & Status */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
                <span className="flex items-center gap-1 text-[11px] truncate max-w-[160px]">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  {zone.movementDirection}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  STATUS: {zone.status}
                </span>
              </div>

              {/* Viva Simulation Slider & Delta Buttons */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    Simulate Crowd Density
                  </span>
                  <span className="font-mono text-slate-300">
                    {zone.currentCrowd.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="500"
                  max={Math.round(zone.capacity * 1.05)}
                  step="250"
                  value={zone.currentCrowd}
                  onChange={(e) => handleSliderChange(zone, parseInt(e.target.value, 10))}
                  disabled={updatingZoneId === zone.id}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAdjustCrowd(zone, 1500)}
                    disabled={updatingZoneId === zone.id}
                    className="flex-1 py-1 px-2 rounded bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-200 text-[11px] font-bold transition disabled:opacity-50"
                  >
                    +1,500 Rush
                  </button>
                  <button
                    onClick={() => handleAdjustCrowd(zone, -1500)}
                    disabled={updatingZoneId === zone.id}
                    className="flex-1 py-1 px-2 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[11px] font-bold transition disabled:opacity-50"
                  >
                    -1,500 Disperse
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
