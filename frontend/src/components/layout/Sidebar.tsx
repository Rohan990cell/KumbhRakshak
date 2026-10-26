import React from 'react';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  AlertOctagon,
  FileWarning,
  Video,
  CloudRain,
  MapPin,
  Ambulance,
  Radio,
  FileText,
  BellRing,
  Smartphone,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onToggleSimulator: () => void;
  simulatorOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onToggleSimulator,
  simulatorOpen,
}) => {
  const { user } = useAuth();
  const { activeAlerts } = useAlerts();

  const navSections = [
    {
      title: 'COMMAND & CONTROL',
      items: [
        { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
        { path: '/crowd-monitoring', label: 'Crowd Monitoring', icon: Users },
        { path: '/risk-analysis', label: 'AI Risk Engine', icon: BrainCircuit, badge: 'AI/ML' },
        {
          path: '/alerts',
          label: 'Live Alerts',
          icon: AlertOctagon,
          count: activeAlerts.length,
          countColor: 'bg-red-600',
        },
        { path: '/incidents', label: 'Incident Management', icon: FileWarning },
      ],
    },
    {
      title: 'SENSORS & SURVEILLANCE',
      items: [
        { path: '/cctv', label: 'CCTV Feeds (Sim)', icon: Video },
        { path: '/map', label: 'Interactive GIS Map', icon: MapPin },
        { path: '/weather', label: 'Weather Radar', icon: CloudRain },
      ],
    },
    {
      title: 'RESPONSE & FIELD OPS',
      items: [
        { path: '/emergency-services', label: 'Emergency Fleet', icon: Ambulance },
        { path: '/field-team', label: 'Field Staff Console', icon: Radio },
        { path: '/reports', label: 'Citizen SOS Reports', icon: FileText },
        { path: '/notifications', label: 'Notification Center', icon: BellRing },
      ],
    },
    {
      title: 'PUBLIC & ADMIN',
      items: [
        { path: '/public', label: 'Pilgrim Mobile Portal', icon: Smartphone, highlight: true },
        { path: '/admin/settings', label: 'System Admin', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0A101D] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4 px-3 overflow-y-auto space-y-6">
        {/* Viva Demo Simulation Trigger Button */}
        <div className="px-1">
          <button
            onClick={onToggleSimulator}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition shadow-lg cursor-pointer ${
              simulatorOpen
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border border-red-400'
                : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-amber-200 border border-blue-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{simulatorOpen ? 'Hide Simulation Panel' : 'Demo Simulation Mode'}</span>
            </div>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white font-mono">
              VIVA
            </span>
          </button>
        </div>

        {/* Navigation Sections */}
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition font-medium text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                  } ${item.highlight ? 'border border-amber-500/30 bg-amber-950/20' : ''}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                          item.countColor || 'bg-blue-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#080D18] border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
          <span>DEMO STORE (LOCAL)</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate">
          Active Role: <span className="text-amber-300 font-semibold">{user?.role || 'Guest'}</span>
        </div>
      </div>
    </aside>
  );
};
