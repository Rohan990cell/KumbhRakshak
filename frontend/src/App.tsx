import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider, useAlerts } from './context/AlertContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { mockStore } from './services/mockStore';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CrowdMonitoring } from './pages/CrowdMonitoring';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { AlertManagement } from './pages/AlertManagement';
import { IncidentManagement } from './pages/IncidentManagement';
import { CCTVPage } from './pages/CCTVPage';
import { WeatherPage } from './pages/WeatherPage';
import { MapView } from './pages/MapView';
import { EmergencyServices } from './pages/EmergencyServices';
import { FieldTeamPage } from './pages/FieldTeamPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PublicApp } from './pages/PublicApp';
import { AdminSettings } from './pages/AdminSettings';

import { X, Flame, AlertTriangle, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

const DemoBanner: React.FC = () => {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    setResetting(true);
    mockStore.resetDemoData();
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 px-3 py-1 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2 shadow-inner z-50">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3 text-slate-950" />
          DEMO / SIMULATED DATA
        </span>
        <span className="text-[11px] text-amber-300 font-medium hidden md:inline">
          College Project Prototype • Fictional Simulation • Not connected to real emergency services or live CCTV
        </span>
        <span className="text-[11px] text-amber-300 font-medium md:hidden">
          Academic Prototype • Simulated Data
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-amber-900/60 hover:bg-amber-800/80 px-2.5 py-0.5 rounded border border-amber-600/50 transition cursor-pointer disabled:opacity-50"
          title="Reset all demo alerts, crowd, and incidents to baseline"
        >
          <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { toasts, dismissToast } = useAlerts();

  // Navigation route state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname !== '/' ? window.location.pathname : '/dashboard';
  });

  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Sync browser url on navigation
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-white text-sm font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading KumbhRakshak Demo Systems...</span>
        </div>
      </div>
    );
  }

  // If not logged in and not on public app, show login
  if (!user && currentPath !== '/public') {
    return <Login onSuccess={(targetPath) => navigateTo(targetPath || '/dashboard')} />;
  }

  // Public app standalone mobile-first view
  if (currentPath === '/public') {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col">
        <DemoBanner />
        <div className="p-2.5 bg-slate-900 border-b border-slate-800 text-xs text-center text-slate-400 flex items-center justify-between px-4 max-w-md mx-auto w-full">
          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Devotee Public Portal (Demo)
          </span>
          <button
            onClick={() => navigateTo('/dashboard')}
            className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            ← Command Center
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PublicApp />
        </div>
      </div>
    );
  }

  // Render appropriate page
  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case '/crowd-monitoring':
        return <CrowdMonitoring />;
      case '/risk-analysis':
        return <RiskAnalysis />;
      case '/alerts':
        return <AlertManagement />;
      case '/incidents':
        return <IncidentManagement />;
      case '/cctv':
        return <CCTVPage />;
      case '/weather':
        return <WeatherPage />;
      case '/map':
        return <MapView />;
      case '/emergency-services':
        return <EmergencyServices />;
      case '/field-team':
        return <FieldTeamPage />;
      case '/reports':
        return <ReportsPage />;
      case '/notifications':
        return <NotificationsPage />;
      case '/admin/settings':
        return <AdminSettings />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] flex flex-col text-slate-100">
      {/* Persistent College Demo Safety Banner */}
      <DemoBanner />

      {/* Top Header */}
      <Header
        onOpenNotifications={() => navigateTo('/notifications')}
        onNavigate={navigateTo}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onToggleSimulator={() => setSimulatorOpen(!simulatorOpen)}
          simulatorOpen={simulatorOpen}
        />

        <main className="flex-1 overflow-y-auto bg-[#0A101D]/90">
          {renderPage()}
        </main>
      </div>

      {/* Floating Demo Simulation Modal */}
      <SimulationPanel isOpen={simulatorOpen} onClose={() => setSimulatorOpen(false)} />

      {/* Floating Real-Time Emergency Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-md w-full pointer-events-none">
          {toasts.map((t) => {
            const isCrit = t.severity === 'CRITICAL';
            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md pointer-events-auto transition flex items-start justify-between gap-3 animate-in slide-in-from-right-5 ${
                  isCrit
                    ? 'bg-red-950/95 border-red-500 text-white animate-pulse-critical'
                    : 'bg-slate-900/95 border-amber-500 text-slate-100'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCrit ? (
                    <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-extrabold text-xs tracking-wide">{t.title}</div>
                    <div className="text-[11px] text-slate-200 mt-0.5 leading-snug">{t.message}</div>
                    <div className="text-[9px] font-mono opacity-60 mt-1">{t.timestamp}</div>
                  </div>
                </div>

                <button
                  onClick={() => dismissToast(t.id)}
                  className="p-1 rounded hover:bg-black/30 text-slate-300 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AlertProvider>
        <MainLayout />
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;
