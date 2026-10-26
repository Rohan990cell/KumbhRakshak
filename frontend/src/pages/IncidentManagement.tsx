import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Incident, EmergencyUnit, EmergencyTeam } from '../types';
import {
  FileWarning,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Ambulance,
  Radio,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [emergencyUnits, setEmergencyUnits] = useState<EmergencyUnit[]>([]);
  const [fieldTeams, setFieldTeams] = useState<EmergencyTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Medical');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newLocation, setNewLocation] = useState('Sangam Ghat Western Steps Pier 2');
  const [newDesc, setNewDesc] = useState('');

  const fetchIncidents = async () => {
    try {
      const [incRes, unitsRes, teamsRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/emergency/units'),
        api.get('/emergency/teams'),
      ]);
      setIncidents(incRes);
      setEmergencyUnits(unitsRes);
      setFieldTeams(teamsRes);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (incidentId: string, nextStatus: string) => {
    try {
      await api.patch(`/incidents/${incidentId}`, {
        status: nextStatus,
        responseNotes: responseNotes || `Status advanced to ${nextStatus}`,
      });
      await fetchIncidents();
      setSelectedIncident(null);
      setResponseNotes('');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/incidents', {
        title: newTitle,
        category: newCategory,
        severity: newSeverity,
        locationText: newLocation,
        description: newDesc,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchIncidents();
    } catch (err: any) {
      alert(`Incident creation failed: ${err.message}`);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incidentCode.toLowerCase().includes(q) ||
        inc.locationText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const timelineSteps = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-amber-500" />
            <span>Emergency Incident Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Lifecycle tracking: Reported → Verified → Team Assigned → Response Started → Resolved.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, title, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">REPORTED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Medical">Medical</option>
            <option value="Fire">Fire</option>
            <option value="Crowd Surge">Crowd Surge</option>
            <option value="Structural">Structural</option>
            <option value="Lost Person">Lost Person</option>
            <option value="Law and Order">Law and Order</option>
          </select>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredIncidents.map((inc) => {
          const isCrit = inc.severity === 'CRITICAL';
          const stepIndex = timelineSteps.indexOf(inc.status);

          return (
            <div
              key={inc.id}
              className={`bg-slate-900/90 rounded-xl p-4 border transition-all flex flex-col justify-between shadow-lg ${
                isCrit ? 'border-red-600/80 shadow-red-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    {inc.incidentCode} • {inc.category}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                      isCrit ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{inc.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {inc.description}
                </p>

                <div className="text-[11px] text-slate-300 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{inc.locationText}</span>
                </div>

                {/* Timeline Visualizer */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>PROGRESSION</span>
                    <span className="text-amber-400 font-bold">{inc.status}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {timelineSteps.map((st, i) => (
                      <div
                        key={st}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= stepIndex ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                        title={st}
                      />
                    ))}
                  </div>
                </div>

                {/* Assigned Resources */}
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Dispatched Unit:</span>
                    <span className="text-blue-300 font-medium">
                      {inc.assignedUnit?.name || 'Pending assignment'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Field Team:</span>
                    <span className="text-slate-200">
                      {inc.assignedTeam?.name || 'Pending deployment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => setSelectedIncident(inc)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  Manage Lifecycle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lifecycle Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-white text-sm">
                Incident Lifecycle: {selectedIncident.incidentCode}
              </h4>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-bold text-slate-100">{selectedIncident.title}</h5>
                <p className="text-slate-300 mt-0.5">{selectedIncident.description}</p>
              </div>

              {/* Step Progression Buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                  Advance Status Step:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {timelineSteps.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedIncident.id, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                        selectedIncident.status === st
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Incident Action &amp; Response Notes
                </label>
                <textarea
                  rows={2}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Record on-ground intervention notes..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateIncident}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Report Emergency Incident</h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Acute Dehydration in Sector 2"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Medical">Medical</option>
                  <option value="Fire">Fire</option>
                  <option value="Crowd Surge">Crowd Surge</option>
                  <option value="Structural">Structural</option>
                  <option value="Lost Person">Lost Person</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e: any) => setNewSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
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
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Submit Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
