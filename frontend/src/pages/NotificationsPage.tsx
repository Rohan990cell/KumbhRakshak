import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  Send,
  Radio,
  Flame,
  CloudRain,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Public Announcement');
  const [severity, setSeverity] = useState('INFO');
  const [recipientRole, setRecipientRole] = useState('ALL');
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    try {
      await api.post('/notifications/broadcast', {
        title,
        message,
        category,
        severity,
        recipientRole,
      });
      setTitle('');
      setMessage('');
      await fetchNotifications();
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Critical')) return <Flame className="w-4 h-4 text-red-400" />;
    if (cat.includes('Weather')) return <CloudRain className="w-4 h-4 text-cyan-400" />;
    if (cat.includes('Warning')) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span>Emergency Broadcast &amp; Notification Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-channel dispatch logs, push notification broadcasts, and public safety alerts.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 self-start"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Transmit Public / Staff Announcement
            </h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Headline</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. River Current Warning at Sangam Pier 3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Public Announcement">Public Announcement</option>
                  <option value="Critical Alert">Critical Alert</option>
                  <option value="Warning">Warning</option>
                  <option value="Weather Warning">Weather Warning</option>
                  <option value="Team Assignment">Team Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Stakeholder Group</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All Devotees &amp; Staff (Public Broadcast)</option>
                <option value="FIELD_STAFF">Field Staff &amp; Sector Magistrates Only</option>
                <option value="EMERGENCY_SERVICES">Emergency Response Units (108/112) Only</option>
                <option value="CONTROL_ROOM">Control Room Internal Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Broadcast Message Body</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert advisory..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Transmitting...' : 'Send Real-Time Notification'}</span>
            </button>
          </form>
        </div>

        {/* Notifications History Feed (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Dispatched Notifications ({notifications.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">PUSH / SMS / RADIO</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition ${
                  notif.isRead
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(notif.category)}
                    <span className="font-bold text-xs text-white">{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs mt-1.5 leading-relaxed">{notif.message}</p>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                  <span>AUDIENCE: {notif.recipientRole}</span>
                  <span className="uppercase">{notif.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
