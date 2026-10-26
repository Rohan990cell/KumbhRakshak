import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { UserReport } from '../types';
import {
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  RefreshCw,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReports = async () => {
    try {
      const data = await api.get('/reports');
      setReports(data);
    } catch (err) {
      console.error('Error fetching user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async (reportId: string, nextStatus: string, escalate = false) => {
    try {
      await api.patch(`/reports/${reportId}`, {
        status: nextStatus,
        escalateToIncident: escalate,
      });
      await fetchReports();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.reportCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q)
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
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Citizen SOS Reports &amp; Crowd Crowdsourcing Triage</span>
          </h2>
          <p className="text-xs text-slate-400">
            Emergency incidents submitted directly by pilgrims, lost child reports, and ground crowd observations.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
          title="Refresh Reports"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search report by code, devotee name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">SUBMITTED (NEW)</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="ESCALATED">ESCALATED TO INCIDENT</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Devotee / Contact</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No citizen reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const isCrit = rep.priority === 'CRITICAL';
                  const isHigh = rep.priority === 'HIGH';

                  return (
                    <tr key={rep.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {rep.reportCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{rep.reporterName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rep.reporterPhone || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-300">
                        {rep.emergencyType}
                      </td>
                      <td className="py-3 px-4 text-slate-300 truncate max-w-[140px]">
                        {rep.location}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[240px] truncate" title={rep.description}>
                        {rep.description}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${
                            isCrit
                              ? 'bg-red-600 text-white animate-pulse'
                              : isHigh
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rep.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rep.status === 'RESOLVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : rep.status === 'ESCALATED'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : rep.status === 'VERIFIED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {rep.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'VERIFIED')}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                              title="Mark Verified"
                            >
                              Verify
                            </button>
                          )}
                          {rep.status !== 'ESCALATED' && rep.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'ESCALATED', true)}
                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px]"
                              title="Escalate to Incident"
                            >
                              Escalate
                            </button>
                          )}
                          {rep.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'RESOLVED')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                              title="Mark Resolved"
                            >
                              Resolve
                            </button>
                          )}
                          {rep.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px]"
                              title="Mark False Alarm"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
