import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { WeatherData } from '../types';
import { getSocket } from '../services/socket';
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 32.0,
    humidity: 65,
    rainMm: 0,
    windSpeedKmh: 14,
    condition: 'Clear Sky',
    weatherRisk: 'LOW',
    heatIndex: 35.5,
    visibilityKm: 7.5,
  });

  const [loading, setLoading] = useState(false);

  // Simulation form
  const [tempInput, setTempInput] = useState(32);
  const [rainInput, setRainInput] = useState(0);
  const [windInput, setWindInput] = useState(15);
  const [condInput, setCondInput] = useState('Clear Sky');

  const fetchWeather = async () => {
    try {
      const data = await api.get('/weather');
      if (data.current) {
        setWeather(data.current);
        setTempInput(data.current.temperature);
        setRainInput(data.current.rainMm);
        setWindInput(data.current.windSpeedKmh);
        setCondInput(data.current.condition);
      }
    } catch (err) {
      console.error('Failed to load weather:', err);
    }
  };

  useEffect(() => {
    fetchWeather();

    const socket = getSocket();
    const handleWeatherUpdate = (data: WeatherData) => {
      setWeather(data);
    };

    socket.on('weather:update', handleWeatherUpdate);
    return () => {
      socket.off('weather:update', handleWeatherUpdate);
    };
  }, []);

  const handleSimulateWeather = async (preset?: string) => {
    setLoading(true);
    let payload = {
      temperature: tempInput,
      humidity: 65,
      rainMm: rainInput,
      windSpeedKmh: windInput,
      condition: condInput,
    };

    if (preset === 'HEAVY_RAIN') {
      payload = {
        temperature: 24.5,
        humidity: 92,
        rainMm: 28.5,
        windSpeedKmh: 45,
        condition: 'Severe Thunderstorm & Squall',
      };
      setTempInput(24.5);
      setRainInput(28.5);
      setWindInput(45);
      setCondInput('Severe Thunderstorm & Squall');
    } else if (preset === 'CLEAR') {
      payload = {
        temperature: 31.0,
        humidity: 60,
        rainMm: 0,
        windSpeedKmh: 12,
        condition: 'Clear Sky & Calm',
      };
      setTempInput(31.0);
      setRainInput(0);
      setWindInput(12);
      setCondInput('Clear Sky & Calm');
    }

    try {
      const res = await api.post('/weather/simulate', payload);
      setWeather(res);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <span>Environmental &amp; Weather Risk Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400">
            Meteorological observation factors integrated into the real-time AI crowd risk engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold ${
              weather.weatherRisk === 'SEVERE'
                ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                : weather.weatherRisk === 'HIGH'
                ? 'bg-orange-950 text-orange-300 border-orange-700'
                : 'bg-emerald-950 text-emerald-400 border-emerald-700'
            }`}
          >
            WEATHER RISK: {weather.weatherRisk}
          </span>
        </div>
      </div>

      {/* Main Meteorological Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ambient Temperature</span>
            <Thermometer className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {weather.temperature}°C
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Heat Index: <b className="text-amber-300">{weather.heatIndex || 35}°C</b>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {weather.humidity}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Perspiration / Dehydration factor
          </div>
        </div>

        {/* Rainfall */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rainfall Precipitation</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 mt-2 font-mono">
            {weather.rainMm} mm
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {weather.rainMm > 5 ? 'High slip & crowd panic risk' : 'Normal footing on ramps'}
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Wind Speed (Riverbed)</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {weather.windSpeedKmh} km/h
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pontoon bridge vibration threshold
          </div>
        </div>
      </div>

      {/* Simulator Control Section */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Meteorological Hazard Simulator (Viva Demo)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateWeather('HEAVY_RAIN')}
              className="px-3 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-bold"
            >
              Simulate Squall &amp; Rain
            </button>
            <button
              onClick={() => handleSimulateWeather('CLEAR')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs"
            >
              Reset Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Temperature (°C): {tempInput}°C</label>
            <input
              type="range"
              min="15"
              max="45"
              value={tempInput}
              onChange={(e) => setTempInput(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Rainfall (mm/hr): {rainInput} mm</label>
            <input
              type="range"
              min="0"
              max="50"
              value={rainInput}
              onChange={(e) => setRainInput(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Wind Speed (km/h): {windInput} km/h</label>
            <input
              type="range"
              min="5"
              max="65"
              value={windInput}
              onChange={(e) => setWindInput(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleSimulateWeather()}
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow"
            >
              Apply Weather Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
