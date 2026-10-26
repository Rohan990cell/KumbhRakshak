import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Alert, Zone, EmergencyTeam } from '../types';
import { useAlerts } from '../context/AlertContext';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Radio,
  UserCheck,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';

export const AlertManagement: React.FC = () => {
  const { refreshAlerts } = useAlerts();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [fieldTeams, setFieldTeams] = useState<EmergencyTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [activeModalAlert, setActiveModalAlert] = useState<Alert | null>(null);
  const [ackNotes, setAckNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form for manual alert creation
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Overcrowding');
  const [newSeverity, setNewSeverity] = useState<'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newLocation, setNewLocation] = useState('Sangam Ghat Western Ramp');
  const [newDesc, setNewDesc] = useState('');
  const [newAction, setNewAction] = useState('Regulate inbound pedestrian flow');

  const fetchAlertsData = async () => {
    try {
      const [alertsRes, zonesRes, teamsRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/zones'),
        api.get('/emergency/teams'),
      ]);
      setAlerts(alertsRes);
      setZones(zonesRes);
      setFieldTeams(teamsRes);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleAcknowledge = async (alertId: string, nextStatus: string) => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge`, {
        actionTaken: nextStatus,
        notes: ackNotes || `Status updated to ${nextStatus}`,
      });
      await fetchAlertsData();
      await refreshAlerts();
      setActiveModalAlert(null);
      setAckNotes('');
    } catch (err: any) {
      alert(`Acknowledgement error: ${err.message}`);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alerts', {
        title: newTitle,
        description: newDesc,
        type: newType,
        severity: newSeverity,
        locationText: newLocation,
        recommendedAction: newAction,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchAlertsData();
      await refreshAlerts();
    } catch (err: any) {
      alert(`Alert creation failed: ${err.message}`);
    }
  };

  // Filtered Alerts
  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.alertCode.toLowerCase().includes(q) ||
        a.locationText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>Emergency Alert Management Registry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time automated incident alert lifecycle from detection through field acknowledgement and resolution.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Manual Alert</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Alert ID, title or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Overcrowding">Overcrowding</option>
            <option value="Stampede Risk">Stampede Risk</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Fire">Fire</option>
            <option value="Infrastructure Failure">Infrastructure Failure</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Weather Emergency">Weather Emergency</option>
          </select>
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Type / Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No alerts found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCrit = alert.severity === 'CRITICAL';
                  const isHigh = alert.severity === 'HIGH';

                  return (
                    <tr key={alert.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {alert.alertCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white line-clamp-1">{alert.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{alert.type}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${
                            isCrit
                              ? 'bg-red-600 text-white animate-pulse'
                              : isHigh
                              ? 'bg-orange-600 text-white'
                              : alert.severity === 'WARNING'
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 truncate max-w-[160px]">
                        {alert.locationText}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {alert.assignedTeam?.name || (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            alert.status === 'RESOLVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : alert.status === 'IN_PROGRESS'
                              ? 'bg-blue-950 text-blue-300 border border-blue-700'
                              : alert.status === 'NEW'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveModalAlert(alert)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                        >
                          Review &amp; Act
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Act Modal */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-red-600 text-white font-bold">
                  {activeModalAlert.severity}
                </span>
                <h4 className="font-bold text-white text-base">{activeModalAlert.alertCode}</h4>
              </div>
              <button
                onClick={() => setActiveModalAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-extrabold text-sm text-slate-100">{activeModalAlert.title}</h5>
                <p className="text-slate-300 mt-1 leading-relaxed">{activeModalAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>Location: <b className="text-white">{activeModalAlert.locationText}</b></div>
                <div>Status: <b className="text-amber-400">{activeModalAlert.status}</b></div>
                <div>Density: <b className="text-white">{activeModalAlert.densityPercent || 'N/A'}%</b></div>
                <div>Risk Score: <b className="text-red-400">{activeModalAlert.riskScore || 'N/A'}</b></div>
                <div>Assigned Team: <b className="text-blue-300">{activeModalAlert.assignedTeam?.name || 'None'}</b></div>
                <div>Acknowledged By: <b className="text-slate-300">{activeModalAlert.acknowledgedBy || 'Pending'}</b></div>
              </div>

              {activeModalAlert.recommendedAction && (
                <div className="p-2.5 rounded bg-blue-950/40 border border-blue-700/60 text-blue-200">
                  <b>Action Directive:</b> {activeModalAlert.recommendedAction}
                </div>
              )}

              {/* Response Notes Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Officer Response Log / Acknowledgement Note
                </label>
                <textarea
                  rows={2}
                  value={ackNotes}
                  onChange={(e) => setAckNotes(e.target.value)}
                  placeholder="e.g. Deployed 4 constables to Western Steps, opening relief exit 3B..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveModalAlert(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {activeModalAlert.status !== 'IN_PROGRESS' && activeModalAlert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleAcknowledge(activeModalAlert.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Set IN_PROGRESS
                  </button>
                )}
                {activeModalAlert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleAcknowledge(activeModalAlert.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Mark RESOLVED
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAlert}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-white text-sm">Issue Manual Command Alert</h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Critical Surge on Pontoon Bridge 2"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Overcrowding">Overcrowding</option>
                  <option value="Stampede Risk">Stampede Risk</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Fire">Fire</option>
                  <option value="Infrastructure Failure">Infrastructure Failure</option>
                  <option value="Missing Person">Missing Person</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e: any) => setNewSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Recommended Action</label>
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Broadcast Alert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
