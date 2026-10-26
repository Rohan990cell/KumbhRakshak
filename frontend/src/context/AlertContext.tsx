import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Alert, NotificationItem } from '../types';
import { getSocket } from '../services/socket';
import { api } from '../services/api';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

interface AlertContextType {
  activeAlerts: Alert[];
  latestNotification: NotificationItem | null;
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  refreshAlerts: () => Promise<void>;
  criticalAlertCount: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Web Audio API emergency chime synthesizer
const playEmergencySiren = (severity: string) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
    const freq = severity === 'CRITICAL' ? 880 : 587.33;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    if (severity === 'CRITICAL') {
      // Warble modulation
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.75);
  } catch {
    // browser auto-play restrictions before user gesture
  }
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const fetchAlerts = async () => {
    try {
      const data = await api.get('/alerts');
      const unresolved = Array.isArray(data) ? data.filter((a: Alert) => a.status !== 'RESOLVED') : [];
      setActiveAlerts(unresolved);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();

    const socket = getSocket();

    const handleNewAlert = (alert: Alert) => {
      setActiveAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
      playEmergencySiren(alert.severity);

      // Add to toast
      const newToast: ToastAlert = {
        id: `toast-${Date.now()}-${Math.random()}`,
        title: `🚨 ${alert.severity} ALERT: ${alert.type}`,
        message: `${alert.locationText}: ${alert.title}`,
        severity: alert.severity,
        timestamp: new Date().toLocaleTimeString(),
      };
      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

      // Auto dismiss after 8s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 8000);
    };

    const handleUpdatedAlert = (alert: Alert) => {
      setActiveAlerts((prev) =>
        alert.status === 'RESOLVED'
          ? prev.filter((a) => a.id !== alert.id)
          : prev.map((a) => (a.id === alert.id ? alert : a))
      );
    };

    const handleNewNotification = (notif: NotificationItem) => {
      setLatestNotification(notif);
    };

    socket.on('alert:new', handleNewAlert);
    socket.on('alert:updated', handleUpdatedAlert);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('alert:new', handleNewAlert);
      socket.off('alert:updated', handleUpdatedAlert);
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const criticalAlertCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <AlertContext.Provider
      value={{
        activeAlerts,
        latestNotification,
        toasts,
        dismissToast,
        refreshAlerts: fetchAlerts,
        criticalAlertCount,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
