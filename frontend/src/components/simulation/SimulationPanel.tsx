import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  Ambulance,
  CloudRain,
  UserPlus,
  RotateCcw,
  Play,
  CheckCircle,
  X,
  FastForward,
  Info
} from 'lucide-react';

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ isOpen, onClose }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Auto Viva Scenario Walkthrough State
  const [scenarioActive, setScenarioActive] = useState(false);
  const [scenarioStep, setScenarioStep] = useState<number>(0);

  const scenarioSteps = [
    { title: 'Normal Baseline', desc: 'Sangam Ghat has moderate morning crowd (~18,450 / 74%). Status: Caution.' },
    { title: 'Inflow Surging', desc: 'Inflow spikes to 420 persons/min as special trains arrive. Density rises to 82%.' },
    { title: 'Risk High Threshold', desc: 'Density crosses 85%. AI Risk Score climbs to 78. Alert engine flags Warning.' },
    { title: 'Critical Stampede Risk', desc: 'Density hits 96% (24,000+). AI Engine switches to CRITICAL. Emergency alert emitted.' },
    { title: 'Alert Received & Dispatched', desc: 'Control room receives alarm. Nearest QRT Alpha recommended and paged.' },
    { title: 'Field Staff Acknowledges', desc: 'Ground Inspector acknowledges via mobile. Status changes to IN_PROGRESS.' },
    { title: 'Flow Diversion & Containment', desc: 'Radial egress opened on Ramp 4. Inflow restricted at Parade Ground.' },
    { title: 'Resolved & Restored', desc: 'Crowd density eases back below 75%. Incident archived as RESOLVED.' },
  ];

  const handleAction = async (type: string, label: string) => {
    setLoadingAction(type);
    try {
      const res = await api.post('/simulation/trigger', { scenarioType: type });
      setLastResult(`Triggered: ${label}`);
    } catch (err: any) {
      setLastResult(`Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const runStep = async (stepIndex: number) => {
    setScenarioStep(stepIndex);
    if (stepIndex === 0) {
      await api.post('/simulation/trigger', { scenarioType: 'RESET_NORMAL' });
    } else if (stepIndex === 1) {
      await api.post('/crowd/update', { zoneId: 'ZONE-SANGAM', crowdCount: 20500, inflowRate: 420, outflowRate: 230 });
    } else if (stepIndex === 2) {
      await api.post('/crowd/update', { zoneId: 'ZONE-SANGAM', crowdCount: 21500, inflowRate: 460, outflowRate: 210 });
    } else if (stepIndex === 3) {
      await api.post('/simulation/trigger', { scenarioType: 'CRITICAL_CROWD_SURGE' });
    } else if (stepIndex === 4) {
      // Alert already generated, show dispatch confirmation
    } else if (stepIndex === 5) {
      // Find latest critical alert and acknowledge
      try {
        const alerts = await api.get('/alerts?status=NEW');
        if (alerts.length > 0) {
          await api.post(`/alerts/${alerts[0].id}/acknowledge`, { actionTaken: 'IN_PROGRESS', notes: 'QRT Alpha deployed at Western Ramp' });
        }
      } catch {}
    } else if (stepIndex === 6) {
      await api.post('/crowd/update', { zoneId: 'ZONE-SANGAM', crowdCount: 19800, inflowRate: 250, outflowRate: 380 });
    } else if (stepIndex === 7) {
      await api.post('/simulation/trigger', { scenarioType: 'RESET_NORMAL' });
    }
  };

  const advanceScenario = () => {
    const nextStep = (scenarioStep + 1) % scenarioSteps.length;
    runStep(nextStep);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-slate-900 border-2 border-amber-500/70 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-3.5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              College Viva Demo Simulator
            </h3>
            <p className="text-[11px] text-amber-300/80 font-mono">
              Simulate Emergency Events Without Hardware
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Step-by-Step Viva Demonstration Scenario */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Viva Walkthrough Flow (Step {scenarioStep + 1} of 8)
            </span>
            <button
              onClick={advanceScenario}
              className="px-2.5 py-1 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow"
            >
              <span>Next Step</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-slate-200">
              {scenarioSteps[scenarioStep].title}
            </div>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              {scenarioSteps[scenarioStep].desc}
            </div>
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-between gap-1 mt-2.5 px-1">
            {scenarioSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => runStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === scenarioStep
                    ? 'w-6 bg-amber-400'
                    : i < scenarioStep
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-700'
                }`}
                title={`Jump to Step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Quick One-Click Simulated Emergency Triggers */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Instant One-Click Injections
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Surge Crowd Event */}
            <button
              onClick={() => handleAction('CRITICAL_CROWD_SURGE', 'Critical Crowd Surge (Sangam Ghat 97%)')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-600/70 text-left text-xs font-semibold text-red-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
                <span className="text-[9px] bg-red-800 px-1 py-0.2 rounded text-white font-mono">97% CRIT</span>
              </div>
              <span>Surge Crowd (Sangam)</span>
            </button>

            {/* Fire Hazard */}
            <button
              onClick={() => handleAction('FIRE_ALERT', 'Fire Alarm (Sector 2 Akhada)')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-orange-950/70 hover:bg-orange-900/80 border border-orange-600/70 text-left text-xs font-semibold text-orange-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
                <span className="text-[9px] bg-orange-800 px-1 py-0.2 rounded text-white font-mono">FIRE</span>
              </div>
              <span>Akhada Tent Fire</span>
            </button>

            {/* Medical Emergency */}
            <button
              onClick={() => handleAction('MEDICAL_EMERGENCY', 'Medical Heatstroke Cluster')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 border border-blue-600/70 text-left text-xs font-semibold text-blue-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <Ambulance className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[9px] bg-blue-800 px-1 py-0.2 rounded text-white font-mono">108 EMS</span>
              </div>
              <span>Medical Heatstroke</span>
            </button>

            {/* Weather Squall */}
            <button
              onClick={() => handleAction('WEATHER_SQUALL', 'Severe Weather Squall & Thunderstorm')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-600/70 text-left text-xs font-semibold text-indigo-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <CloudRain className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                <span className="text-[9px] bg-indigo-800 px-1 py-0.2 rounded text-white font-mono">28mm</span>
              </div>
              <span>Squall & Heavy Rain</span>
            </button>

            {/* Citizen SOS */}
            <button
              onClick={() => handleAction('PILGRIM_SOS', 'Citizen SOS Report Generated')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/70 text-left text-xs font-semibold text-emerald-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <span className="text-[9px] bg-emerald-800 px-1 py-0.2 rounded text-white font-mono">CITIZEN</span>
              </div>
              <span>Simulate Citizen SOS</span>
            </button>

            {/* Reset to Normal */}
            <button
              onClick={() => handleAction('RESET_NORMAL', 'System Reset to Normal Baseline')}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-left text-xs font-semibold text-slate-200 flex flex-col gap-1 transition shadow group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <RotateCcw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-all duration-500" />
                <span className="text-[9px] bg-slate-700 px-1 py-0.2 rounded text-slate-300 font-mono">RESET</span>
              </div>
              <span>Reset All to Normal</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {lastResult && (
          <div className="p-2 rounded bg-slate-800 border border-slate-700 text-xs text-amber-300 flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lastResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
