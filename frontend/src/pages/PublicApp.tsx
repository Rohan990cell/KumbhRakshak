import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Zone, Alert, POILocation } from '../types';
import {
  Smartphone,
  PhoneCall,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Shield,
  Hospital,
  Flame,
  Send,
  PlusCircle,
  HelpCircle,
  Volume2
} from 'lucide-react';

export const PublicApp: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pois, setPois] = useState<POILocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Citizen Report Form State
  const [showReportForm, setShowReportForm] = useState(false);
  const [emergencyType, setEmergencyType] = useState('Medical');
  const [location, setLocation] = useState('Sangam Ghat Western Steps');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const fetchPublicData = async () => {
    try {
      const [zonesRes, alertsRes, poisRes] = await Promise.all([
        api.get('/zones'),
        api.get('/alerts?status=NEW'),
        api.get('/zones/map-data'),
      ]);
      setZones(zonesRes);
      setAlerts(alertsRes);
      setPois(poisRes.poiLocations || []);
    } catch (err) {
      console.error('Failed to load public portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) return;
    try {
      const res = await api.post('/reports', {
        emergencyType,
        location,
        description,
        reporterName: reporterName || 'Anonymous Devotee',
        reporterPhone,
      });
      setSubmittedReportId(res.reportId || res.data?.reportCode || 'REP-9921');
      setDescription('');
    } catch (err: any) {
      alert(`Report failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 p-4 max-w-md mx-auto space-y-4 pb-16">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-2xl border border-blue-700/60 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
              कुंभ रक्षा
            </span>
            <h1 className="text-base font-black text-white">KumbhRakshak Devotee App</h1>
          </div>
          <p className="text-[11px] text-blue-200 mt-1 font-medium">
            Official Pilgrim Safety &amp; Emergency SOS Portal
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-700/60 border border-amber-400/50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-300" />
        </div>
      </div>

      {/* Emergency Hotline Speed Dial Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <a
          href="tel:112"
          className="p-2.5 rounded-xl bg-blue-950 border border-blue-600/70 text-blue-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow"
        >
          <PhoneCall className="w-4 h-4 text-blue-400" />
          <span className="font-extrabold text-sm text-white">112</span>
          <span className="text-[9px] text-slate-400">Police / SOS</span>
        </a>

        <a
          href="tel:108"
          className="p-2.5 rounded-xl bg-red-950 border border-red-600/70 text-red-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow"
        >
          <Hospital className="w-4 h-4 text-red-400" />
          <span className="font-extrabold text-sm text-white">108</span>
          <span className="text-[9px] text-slate-400">Ambulance</span>
        </a>

        <a
          href="tel:1920"
          className="p-2.5 rounded-xl bg-amber-950 border border-amber-600/70 text-amber-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-sm text-white">1920</span>
          <span className="text-[9px] text-slate-400">Mela Helpline</span>
        </a>
      </div>

      {/* Big Emergency SOS Button */}
      <button
        onClick={() => {
          setShowReportForm(!showReportForm);
          setSubmittedReportId(null);
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm transition shadow-xl flex items-center justify-center gap-2 border border-red-400/60 active:scale-98"
      >
        <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
        <span>REPORT AN EMERGENCY / SOS</span>
      </button>

      {/* Emergency Report Form / Confirmation */}
      {showReportForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in">
          {submittedReportId ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Emergency report submitted successfully.</div>
              <div className="text-xs text-slate-300">
                Your Tracking Ticket ID: <b className="text-amber-300 font-mono text-sm">{submittedReportId}</b>
              </div>
              <p className="text-[11px] text-slate-400">
                The central control room has received your alert. The nearest response team has been notified.
              </p>
              <button
                onClick={() => {
                  setSubmittedReportId(null);
                  setShowReportForm(false);
                }}
                className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSOS} className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-xs">Submit Instant Devotee SOS</span>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Emergency Type</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Medical">Medical / Fainting / Injury</option>
                  <option value="Overcrowding">Severe Overcrowding / Stampede Risk</option>
                  <option value="Lost Child/Elder">Lost Child or Elderly Relative</option>
                  <option value="Fire">Fire / Smoke</option>
                  <option value="Obstruction">Blocked Exit / Barricade Collapse</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Exact Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sangam Ghat Western Steps Pier 2"
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Details</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what happened..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Devotee Name"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-lg mt-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Emergency Report</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Live Crowd & Safe/Unsafe Zones */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Live Ghat &amp; Sector Safety Advisory
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">LIVE UPDATES</span>
        </div>

        <div className="space-y-2">
          {zones.slice(0, 5).map((z) => {
            const isDanger = z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH';
            return (
              <div
                key={z.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDanger
                    ? 'bg-red-950/40 border-red-700/70 text-red-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-white">{z.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Density: {z.density}% • {z.movementDirection}
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                    isDanger ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  }`}
                >
                  {isDanger ? 'AVOID AREA' : 'SAFE ROUTE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby Medical & Police Camps */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Hospital className="w-3.5 h-3.5 text-blue-400" />
          Nearby Medical Posts &amp; Assistance Kiosks
        </span>

        <div className="space-y-1.5 text-xs">
          {pois.slice(0, 4).map((p) => (
            <div key={p.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-[10px] text-slate-400">{p.description}</div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                OPEN 24x7
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
