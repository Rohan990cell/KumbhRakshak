import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { KumbhMap } from '../components/map/KumbhMap';
import type { Zone, Alert, Incident, EmergencyUnit, EmergencyTeam, POILocation } from '../types';
import { useAlerts } from '../context/AlertContext';
import {
  Users,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Activity,
  Ambulance,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Radio,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeAlerts, refreshAlerts } = useAlerts();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>({
    totalActiveZones: 10,
    totalPeopleEstimated: 102500,
    highRiskZones: 2,
    activeAlerts: 4,
    emergencyIncidents: 3,
    fieldTeamsActive: 15,
  });

  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [emergencyUnits, setEmergencyUnits] = useState<EmergencyUnit[]>([]);
  const [poiLocations, setPoiLocations] = useState<POILocation[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    timeSeries: [],
    incidentsByCategory: [],
    zonePopulation: [],
  });
  const [weather, setWeather] = useState<any>(null);

  // Selected Zone for Map Detail
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchDashboardData = async () => {
    try {
      const data = await api.get('/dashboard/stats');
      setKpis(data.kpis);
      setZones(data.zones || []);
      setIncidents(data.recentIncidents || []);
      setAnalytics(data.analytics || {});
      setWeather(data.weather);

      // Map assets
      const mapRes = await api.get('/zones/map-data');
      setEmergencyUnits(mapRes.emergencyUnits || []);
      setPoiLocations(mapRes.poiLocations || []);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge`, {
        actionTaken: 'IN_PROGRESS',
        notes: 'Acknowledged directly from Command Center Dashboard',
      });
      await refreshAlerts();
      await fetchDashboardData();
    } catch (err: any) {
      alert(`Could not acknowledge alert: ${err.message}`);
    }
  };

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Top Welcome & Subtitle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Kumbh Mela Emergency Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-mono">
              SECTOR GRID ALPHA
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-sensor crowd monitoring, AI predictive risk scoring, and unified emergency dispatch.
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">WEATHER RADAR</span>
              <span className="font-bold text-amber-300">{weather.condition}</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">TEMP / RAIN</span>
              <span className="font-mono text-slate-200">{weather.temperature}°C • {weather.rainMm}mm</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">ENV RISK</span>
              <span className={`font-bold ${weather.weatherRisk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {weather.weatherRisk}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Active Zones */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Zones</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {kpis.totalActiveZones}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>All 10 Sectors Connected</span>
          </div>
        </div>

        {/* Total People Estimated */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Devotees</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {kpis.totalPeopleEstimated.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+1,840 / 15 min inflow</span>
          </div>
        </div>

        {/* High-Risk Zones */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">High-Risk Zones</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400 mt-2">
            {kpis.highRiskZones}
          </div>
          <div className="text-[11px] text-orange-300 mt-1">
            Sangam & Akshayavat Corridor
          </div>
        </div>

        {/* Active Alerts */}
        <div className={`bg-slate-900/90 border rounded-xl p-3.5 shadow-lg relative overflow-hidden ${
          kpis.criticalAlertsCount > 0 ? 'border-red-600/80 animate-pulse-critical' : 'border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Alerts</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 mt-2">
            {kpis.activeAlerts}
          </div>
          <div className="text-[11px] text-red-300 mt-1 font-bold">
            {kpis.criticalAlertsCount || 0} Critical Priority
          </div>
        </div>

        {/* Emergency Incidents */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Open Incidents</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-2">
            {kpis.emergencyIncidents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Medical, Fire, Bottleneck
          </div>
        </div>

        {/* Field Teams Active */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Field Units Active</span>
            <Ambulance className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {kpis.fieldTeamsActive}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            QRT, NDRF, 108 Ambulance
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD: LEFT MAP (7 COLS) | RIGHT LIVE ALERTS (5 COLS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Large Interactive Map (7 cols) */}
        <div className="xl:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Spatial GIS Map • Triveni Sangam Region
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/map')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Full Screen GIS</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Map */}
          <div className="h-[460px] w-full rounded-lg overflow-hidden border border-slate-800">
            <KumbhMap
              zones={zones}
              emergencyUnits={emergencyUnits}
              poiLocations={poiLocations}
              activeIncidents={incidents}
              selectedZoneId={selectedZone?.id}
              onSelectZone={(z) => setSelectedZone(z)}
              height="100%"
            />
          </div>

          {/* Selected Zone Quick Bar */}
          {selectedZone && (
            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300">{selectedZone.name}</span>
                <span className="text-slate-400 ml-2">
                  Crowd: {selectedZone.currentCrowd.toLocaleString()} / {selectedZone.capacity.toLocaleString()} ({selectedZone.density}%)
                </span>
                <span className={`ml-2 font-bold ${
                  selectedZone.riskLevel === 'CRITICAL' ? 'text-red-400' : selectedZone.riskLevel === 'HIGH' ? 'text-orange-400' : 'text-emerald-400'
                }`}>
                  • {selectedZone.riskLevel} RISK (Score: {selectedZone.riskScore})
                </span>
              </div>
              <button
                onClick={() => onNavigate('/crowd-monitoring')}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Inspect Zone
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Live Alerts Feed (5 cols) */}
        <div className="xl:col-span-5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Alert Feed ({activeAlerts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/alerts')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
            {activeAlerts.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                No unacknowledged alerts. All sectors operating normally.
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const isCrit = alert.severity === 'CRITICAL';
                const isHigh = alert.severity === 'HIGH';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border transition shadow ${
                      isCrit
                        ? 'bg-red-950/40 border-red-600/80 hover:bg-red-950/60'
                        : isHigh
                        ? 'bg-orange-950/30 border-orange-600/60 hover:bg-orange-950/50'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                            isCrit
                              ? 'bg-red-600 text-white'
                              : isHigh
                              ? 'bg-orange-600 text-white'
                              : alert.severity === 'WARNING'
                              ? 'bg-amber-600 text-slate-950'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {alert.type}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-100 font-semibold mt-1.5 line-clamp-1">
                      {alert.title}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {alert.locationText}
                      </span>
                      {alert.densityPercent && (
                        <span className="font-mono text-amber-300 font-bold shrink-0">
                          Density: {alert.densityPercent}%
                        </span>
                      )}
                    </div>

                    {alert.recommendedAction && (
                      <div className="text-[11px] text-amber-200/90 bg-black/30 p-1.5 rounded mt-2 border border-slate-800/80 italic">
                        Action: {alert.recommendedAction}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-[10px] text-slate-400">
                        Status: <b className="text-slate-200">{alert.status}</b>
                      </span>

                      <div className="flex items-center gap-2">
                        {alert.status === 'NEW' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: CROWD ANALYTICS (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crowd Density & Net Flow Over Time (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Crowd Density & Flow Velocity Over Time
              </h3>
              <p className="text-[11px] text-slate-400">
                Triveni Sangam Ghat continuous observation stream (15-min intervals)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Live Feed
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeSeries || []}>
                <defs>
                  <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#densityGrad)"
                  name="Density %"
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#F59E0B"
                  fillOpacity={0.3}
                  fill="#F59E0B"
                  name="Risk Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Category & Zone Capacity (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Emergency Incidents by Category
                </h3>
                <p className="text-[11px] text-slate-400">
                  Distribution across Medical, Fire, Bottleneck, and Lost Persons
                </p>
              </div>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.incidentsByCategory || []}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {(analytics.incidentsByCategory || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL REPORTED: {incidents.length}</span>
            <button
              onClick={() => onNavigate('/incidents')}
              className="text-blue-400 hover:text-blue-300 font-bold"
            >
              View Incident Register →
            </button>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                  {selectedAlert.severity}
                </span>
                <h4 className="font-bold text-white text-sm">{selectedAlert.alertCode}</h4>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-base font-bold text-slate-100">{selectedAlert.title}</div>
              <p className="text-slate-300 leading-relaxed">{selectedAlert.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-400">
                <div>Location: <b className="text-white">{selectedAlert.locationText}</b></div>
                <div>Status: <b className="text-amber-400">{selectedAlert.status}</b></div>
                <div>Crowd Count: <b className="text-white">{selectedAlert.crowdCount?.toLocaleString() || 'N/A'}</b></div>
                <div>Risk Score: <b className="text-red-400">{selectedAlert.riskScore || 'N/A'}/100</b></div>
              </div>

              {selectedAlert.recommendedAction && (
                <div className="p-2.5 rounded bg-slate-950 border border-amber-500/40 text-amber-200 mt-2">
                  <div className="font-bold mb-0.5">Recommended Protocol:</div>
                  <div>{selectedAlert.recommendedAction}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Close
              </button>
              {selectedAlert.status === 'NEW' && (
                <button
                  onClick={() => {
                    handleAcknowledgeAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Acknowledge Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
