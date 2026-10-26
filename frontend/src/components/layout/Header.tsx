import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import type { RoleType } from '../../types';
import {
  ShieldAlert,
  Bell,
  Radio,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { user, logout, switchRoleQuick } = useAuth();
  const { activeAlerts, criticalAlertCount } = useAlerts();
  const [time, setTime] = useState<string>('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const rolesList: { role: RoleType; label: string; badgeColor: string }[] = [
    { role: 'CONTROL_ROOM', label: 'Control Room / Authority', badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700' },
    { role: 'FIELD_STAFF', label: 'Field Staff / Magistrate', badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
    { role: 'EMERGENCY_SERVICES', label: 'Emergency Services (108/112/NDRF)', badgeColor: 'bg-red-900/60 text-red-300 border-red-700' },
    { role: 'PILGRIM', label: 'Pilgrim / Public Portal', badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700' },
    { role: 'ADMIN', label: 'System Administrator', badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-700/80 px-4 lg:px-6 py-2.5 flex items-center justify-between text-slate-100 shadow-xl">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-blue-700 to-slate-900 border border-amber-500/40 shadow-inner">
          <ShieldAlert className="w-6 h-6 text-amber-400 drop-shadow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg lg:text-xl tracking-wide bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
              KumbhRakshak
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-950 border border-blue-600/50 text-blue-300 uppercase">
              कुंभ रक्षक
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block font-medium">
            Kumbh Mela Emergency Command Center • Prayagraj
          </p>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden xl:flex items-center gap-5 text-xs">
        {/* Live Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-700/50 text-emerald-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide">LIVE 24x7 MONITORING</span>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlertCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-950/70 border border-red-600/80 text-red-300 animate-pulse-critical">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="font-bold">{criticalAlertCount} CRITICAL ALERT{criticalAlertCount > 1 ? 'S' : ''} ACTIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sectors Stable</span>
          </div>
        )}

        {/* Live Clock */}
        <div className="text-right font-mono text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
          {time}
        </div>
      </div>

      {/* Right Controls: Role Switcher, Notification, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for Viva Demo */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 transition"
            title="Switch User Role for Evaluation"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{user?.roleLabel || 'Switch Role'}</span>
            <span className="md:hidden">{user?.role?.slice(0, 5) || 'Role'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Viva Quick Role Switch
              </div>
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRoleQuick(r.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between transition ${
                    user?.role === r.role ? 'bg-slate-800/80 font-bold text-amber-300' : 'text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {user?.role === r.role && <span className="text-amber-400 text-xs">● Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          title="Alert Notifications"
        >
          <Bell className="w-4 h-4" />
          {activeAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
              {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
            </span>
          )}
        </button>

        {/* User Badge / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[130px]">
              {user?.name || 'Command Officer'}
            </div>
            <div className="text-[10px] text-amber-400/90 font-mono">
              {user?.role || 'CONTROL_ROOM'}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-red-950/50 hover:text-red-400 text-slate-400 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
