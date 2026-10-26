import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { RoleType } from '../types';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onSuccess: (targetPath?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('control@kumbhrakshak.gov.in');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('CONTROL_ROOM');
  const [loading, setLoading] = useState(false);

  const rolePaths: Record<RoleType, string> = {
    CONTROL_ROOM: '/dashboard',
    FIELD_STAFF: '/field-team',
    EMERGENCY_SERVICES: '/emergency-services',
    PILGRIM: '/public',
    ADMIN: '/admin/settings',
  };

  const handleQuickRole = async (roleEmail: string, role: RoleType, targetPath: string) => {
    setEmail(roleEmail);
    setSelectedRole(role);
    setLoading(true);
    try {
      await login(roleEmail);
      onSuccess(targetPath);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      const targetPath = rolePaths[selectedRole] || '/dashboard';
      onSuccess(targetPath);
    } finally {
      setLoading(false);
    }
  };

  const demoRoles = [
    {
      role: 'CONTROL_ROOM' as RoleType,
      email: 'control@kumbhrakshak.gov.in',
      name: 'Command Center Authority',
      desc: 'Central operations, alert dispatch, all sectors',
      color: 'border-blue-600/60 bg-blue-950/30 hover:bg-blue-900/50 text-blue-300',
      targetPath: '/dashboard',
    },
    {
      role: 'FIELD_STAFF' as RoleType,
      email: 'field@kumbhrakshak.gov.in',
      name: 'Sector 1 Magistrate / Inspector',
      desc: 'Ground patrol, alert acknowledge & response',
      color: 'border-emerald-600/60 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300',
      targetPath: '/field-team',
    },
    {
      role: 'EMERGENCY_SERVICES' as RoleType,
      email: 'emergency@kumbhrakshak.gov.in',
      name: '108 Ambulance / Police Unit',
      desc: 'Dispatch triage & incident resolution',
      color: 'border-red-600/60 bg-red-950/30 hover:bg-red-900/50 text-red-300',
      targetPath: '/emergency-services',
    },
    {
      role: 'PILGRIM' as RoleType,
      email: 'pilgrim@kumbhrakshak.gov.in',
      name: 'Devotee / Citizen Public App',
      desc: 'Live crowd status, safe ghats & SOS reporting',
      color: 'border-amber-600/60 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300',
      targetPath: '/public',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-10 grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0A192F] via-[#102347] to-[#0A192F] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg">
                <ShieldAlert className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wide text-white">KumbhRakshak</h2>
                <p className="text-xs text-amber-400 font-medium">कुंभ रक्षक आपातकालीन प्रणाली</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100 mb-2">
              Kumbh Mela Emergency Alert System
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Integrated real-time command, crowd density AI risk prediction, automated multi-channel emergency alert dissemination, and coordinated first-responder dispatch.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Simulated CCTV & Sensor Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Explainable AI Risk Engine (0-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Automated Alert & Feedback Loop</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-slate-400 font-mono">
            College Project Prototype • Academic Demonstration
            <br />
            Prayagraj Mahakumbh Simulation Corridor
          </div>
        </div>

        {/* Right Login & Role Demo Selector */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Select Role to Enter
              </h3>
              <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                DEMO MODE — College Prototype
              </span>
            </div>

            {/* Quick 1-Click Role Login Buttons */}
            <div className="mb-5 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>1-Click Role Access (No Password Required):</span>
                <span className="text-[10px] text-emerald-400 font-mono">Instant Open</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoRoles.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleQuickRole(d.email, d.role, d.targetPath)}
                    disabled={loading}
                    className={`p-3 rounded-lg border text-left transition flex flex-col justify-between shadow-sm hover:scale-[1.02] active:scale-[0.99] cursor-pointer ${d.color}`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{d.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-tight">{d.desc}</div>
                    <div className="text-[9px] font-mono mt-1.5 text-amber-300/90">
                      → Opens {d.targetPath}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="officer@kumbhrakshak.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-slate-500 font-normal">(Not required in Demo Mode)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Bypassed in demo mode"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Entering Portal...' : 'Enter Command Portal (Demo)'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-4 border-t border-slate-800/80 pt-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Academic Demonstration Prototype • All Data Simulated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
