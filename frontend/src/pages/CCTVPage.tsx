import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CCTV } from '../types';
import { Video, RefreshCw, AlertTriangle, Play, Sparkles, Activity, ShieldCheck, Eye } from 'lucide-react';

export const CCTVPage: React.FC = () => {
  const [cctvs, setCctvs] = useState<CCTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const fetchCCTV = async () => {
    try {
      const data = await api.get('/cctv');
      setCctvs(data);
    } catch (err) {
      console.error('Failed to load CCTVs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCCTV();
  }, []);

  const handleSimulateSurge = async (camera: CCTV) => {
    setSimulatingId(camera.id);
    try {
      await api.post(`/cctv/${camera.id}/simulate`, { crowdDelta: 1800 });
      await fetchCCTV();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <span>CCTV Video Surveillance &amp; AI Computer Vision Simulation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulated 4K camera network with automated crowd density bounding analysis and real-time alert triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            20 CAMERAS ONLINE
          </span>
          <button
            onClick={fetchCCTV}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Refresh Cameras"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cctvs.map((cam) => {
          const isCrit = cam.riskLevel === 'CRITICAL';
          const isHigh = cam.riskLevel === 'HIGH';

          return (
            <div
              key={cam.id}
              className={`bg-slate-900/90 rounded-xl overflow-hidden border shadow-lg transition flex flex-col justify-between ${
                isCrit
                  ? 'border-red-600/80 shadow-red-950/30'
                  : isHigh
                  ? 'border-orange-600/60'
                  : 'border-slate-800'
              }`}
            >
              {/* Simulated Video Canvas Frame */}
              <div className="relative aspect-video bg-slate-950 flex flex-col justify-between p-2.5 overflow-hidden group">
                {/* Background Grid Pattern simulating camera feed */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#3B82F6 1px, transparent 1px), radial-gradient(#3B82F6 1px, #030712 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Animated Scan Line */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400/40 animate-pulse pointer-events-none" />

                {/* Top Video HUD */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    REC • {cam.cameraCode}
                  </span>
                  <span>30 FPS • {cam.resolution}</span>
                </div>

                {/* Center Bounding Box Mockup */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <div
                    className={`border-2 rounded px-3 py-1.5 text-center backdrop-blur-xs transition ${
                      isCrit
                        ? 'border-red-500 bg-red-950/40 text-red-300'
                        : isHigh
                        ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                        : 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold">
                      HEADCOUNT: {cam.crowdEstimate.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-mono">DENSITY: {cam.densityPercent}%</div>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                  <span className="truncate max-w-[140px]">{cam.name}</span>
                  <span className={isCrit ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    AI: {cam.riskLevel}
                  </span>
                </div>
              </div>

              {/* Card Meta & Control */}
              <div className="p-3.5 space-y-3 bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cam.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {cam.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Location: <span className="text-slate-200">{cam.zone?.name || 'Sector'}</span>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Saturation Level:</span>
                    <span className="font-mono font-bold text-white">{cam.densityPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCrit ? 'bg-red-500' : isHigh ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(cam.densityPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Viva Demo Simulation Button */}
                <button
                  onClick={() => handleSimulateSurge(cam)}
                  disabled={simulatingId === cam.id}
                  className="w-full py-1.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  title="Simulate sudden crowd rush on this camera"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {simulatingId === cam.id ? 'Computing...' : 'Simulate Crowd Increase'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
