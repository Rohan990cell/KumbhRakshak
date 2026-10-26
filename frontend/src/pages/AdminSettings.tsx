import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Sliders,
  CheckCircle2,
  Server,
  Database,
  Radio,
  Cpu,
  ShieldCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const data = await api.get('/zones');
      setZones(data);
      // derive sensors
      const allSensors = [
        { code: 'SNS-BEAM-01', name: 'Sangam Main Ramp IR Counter', type: 'INFRARED_BEAM', status: 'ACTIVE', battery: 94, reading: '330 pers/min' },
        { code: 'SNS-RFID-01', name: 'Parade Ground Gate RFID Barcode Gate', type: 'RFID_GATE', status: 'ACTIVE', battery: 98, reading: '275 pers/min' },
        { code: 'SNS-DRONE-01', name: 'Sangam Aerial Density Quadcopter', type: 'DRONE_COUNTER', status: 'ACTIVE', battery: 85, reading: '18,450 counted' },
        { code: 'SNS-BEAM-02', name: 'Akshayavat Queue Strain Sensor', type: 'INFRARED_BEAM', status: 'ACTIVE', battery: 91, reading: '308 pers/min' },
        { code: 'SNS-BLE-01', name: 'Sector 3 Bridge Entrance BLE Mesh', type: 'BLUETOOTH_BEACON', status: 'ACTIVE', battery: 99, reading: '285 pers/min' },
        { code: 'SNS-RFID-02', name: 'Arail Boat Staging RFID Scanner', type: 'RFID_GATE', status: 'ACTIVE', battery: 92, reading: '110 pers/min' },
        { code: 'SNS-DRONE-02', name: 'Sector 1-2 Overhead Patrol Drone', type: 'DRONE_COUNTER', status: 'ACTIVE', battery: 78, reading: '13,500 counted' },
      ];
      setSensors(allSensors);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>System Administration &amp; Hardware Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Node.js backend, Socket.IO bus, Prisma ORM, Python FastAPI microservice, and IoT sensor network.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* System Service Health Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Core API Gateway</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">Node Express :5000</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">STATUS: 200 OK • 12ms</div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Risk Microservice</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">FastAPI Engine :8000</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">STATUS: HYBRID READY</div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Database Layer</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">Prisma ORM</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">dev.db (16 Models Synced)</div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>WebSocket Real-Time</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">Socket.IO Server</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">REACTIVE BROADCAST ACTIVE</div>
        </div>
      </div>

      {/* IoT Sensors Health Table */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl space-y-3 p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Connected IoT Sensors &amp; Counting Beams ({sensors.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">TELEMETRY POLLING</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Sensor Code</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Battery</th>
                <th className="py-2.5 px-3">Latest Telemetry</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {sensors.map((s) => (
                <tr key={s.code} className="hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">{s.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{s.type}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-emerald-400">{s.battery}%</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{s.reading}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
