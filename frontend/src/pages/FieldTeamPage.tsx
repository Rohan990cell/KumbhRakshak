import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { EmergencyTeam, Alert, Incident } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Users,
  AlertTriangle,
  Flame,
  Phone,
  Navigation,
  Check
} from 'lucide-react';

export const FieldTeamPage: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<EmergencyTeam | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [teamStatus, setTeamStatus] = useState<string>('AVAILABLE');
  const [loading, setLoading] = useState(true);

  const fetchFieldData = async () => {
    try {
      const [teamsRes, alertsRes, incRes] = await Promise.all([
        api.get('/emergency/teams'),
        api.get('/alerts'),
        api.get('/incidents'),
      ]);

      // Match user's field team or default to Team Alpha
      const assigned = teamsRes.find((t: any) => t.teamCode === 'TEAM-QRT-01') || teamsRes[0];
      setTeam(assigned);
      if (assigned) setTeamStatus(assigned.status);

      // Filter alerts for this team's sector or assigned
      setAlerts(alertsRes.filter((a: Alert) => a.status !== 'RESOLVED'));
      setIncidents(incRes.filter((i: Incident) => i.status !== 'RESOLVED'));
    } catch (err) {
      console.error('Failed to load field staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldData();
  }, []);

  const handleActionWorkflow = async (alertId: string, action: string) => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge`, {
        actionTaken: action,
        notes: `Field Staff ${user?.name || 'Officer'} updated status to ${action}`,
      });
      await fetchFieldData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleUpdateTeamStatus = async (newStatus: string) => {
    if (!team) return;
    try {
      await api.patch(`/emergency/teams/${team.id}`, { status: newStatus });
      setTeamStatus(newStatus);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>Field Staff Ground Console • Mobile Tactical Unit</span>
          </h2>
          <p className="text-xs text-slate-400">
            Assigned to: <b className="text-white">{team?.name || 'Quick Response Team Alpha'}</b> • Sector: <b className="text-amber-300">{team?.zone?.name || 'Sangam Ghat Core'}</b>
          </p>
        </div>

        {/* Team Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">MY STATUS:</span>
          <select
            value={teamStatus}
            onChange={(e) => handleUpdateTeamStatus(e.target.value)}
            className="bg-slate-900 border border-emerald-600/70 text-emerald-300 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="AVAILABLE">AVAILABLE (READY)</option>
            <option value="ASSIGNED">ASSIGNED (EN ROUTE)</option>
            <option value="ON_SCENE">ON SCENE (HOLDING)</option>
            <option value="OFF_DUTY">OFF DUTY</option>
          </select>
        </div>
      </div>

      {/* Team Info Strip */}
      {team && (
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">TEAM LEADER</span>
            <span className="font-bold text-white">{team.leaderName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">DEPARTMENT / WING</span>
            <span className="text-slate-300">{team.department}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">MEMBERS ON GROUND</span>
            <span className="font-bold text-amber-300">{team.membersCount} Armed Officers / Volunteers</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">EMERGENCY WIRELESS</span>
            <span className="font-mono text-emerald-400">{team.contactPhone}</span>
          </div>
        </div>
      )}

      {/* Assigned Alerts with Exact Requested Buttons:
          [ACCEPT ALERT]
          [REACHED LOCATION]
          [START RESPONSE]
          [RESOLVE INCIDENT]
      */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Active Sector Alerts Requiring Field Response ({alerts.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Order by urgency</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            All alerts acknowledged. Sector perimeter safe.
          </div>
        ) : (
          <div className="space-y-3.5">
            {alerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';

              return (
                <div
                  key={alert.id}
                  className={`bg-slate-900/90 rounded-xl p-4 border shadow-xl transition space-y-3 ${
                    isCrit ? 'border-red-600/80 shadow-red-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCrit ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-bold text-white text-sm">{alert.title}</span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alert.locationText}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {alert.description}
                  </p>

                  {alert.recommendedAction && (
                    <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
                      <b>Command Directive:</b> {alert.recommendedAction}
                    </div>
                  )}

                  {/* 4 Dedicated Required Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {/* 1. ACCEPT ALERT */}
                    <button
                      onClick={() => handleActionWorkflow(alert.id, 'ACKNOWLEDGED')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>[ACCEPT ALERT]</span>
                    </button>

                    {/* 2. REACHED LOCATION */}
                    <button
                      onClick={() => handleActionWorkflow(alert.id, 'ON_SCENE')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>[REACHED LOCATION]</span>
                    </button>

                    {/* 3. START RESPONSE */}
                    <button
                      onClick={() => handleActionWorkflow(alert.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>[START RESPONSE]</span>
                    </button>

                    {/* 4. RESOLVE INCIDENT */}
                    <button
                      onClick={() => handleActionWorkflow(alert.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>[RESOLVE INCIDENT]</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
