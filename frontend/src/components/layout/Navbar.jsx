import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardHat, Server, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { checkHealth } from '../../api/client';

export default function Navbar({ health, onRefreshHealth }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-industrial-900/90 backdrop-blur-md border-b border-industrial-700/60 px-6 py-3.5">
      <div className="flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-safety-amber to-safety-orange text-industrial-950 font-bold shadow-lg shadow-safety-amber/20">
            <HardHat className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-industrial-950">
              <span className="h-2 w-2 rounded-full bg-safety-emerald animate-pulse"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SmartHelmet <span className="text-xs px-2 py-0.5 rounded-md bg-safety-amber/20 text-safety-amber font-mono font-semibold border border-safety-amber/30">AI v1.0</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Industrial PPE & Construction Site Safety Sentinel
            </p>
          </div>
        </div>

        {/* System Health Indicators & Clock */}
        <div className="flex items-center gap-4">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-industrial-800/80 border border-industrial-700/50 text-xs font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{currentTime}</span>
          </div>

          {/* Model Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-industrial-800/80 border border-industrial-700/50 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden lg:inline">Model:</span>
            {health?.model_loaded ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> YOLO11 (Active)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Offline
              </span>
            )}
          </div>

          {/* DB Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-industrial-800/80 border border-industrial-700/50 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden lg:inline">Database:</span>
            {health?.database_connected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="MongoDB Atlas Connected">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Atlas Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium" title="Operating with local memory fallback">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Memory / Atlas Standby
              </span>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefreshHealth}
            title="Refresh System Health"
            className="p-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-400 hover:text-white border border-industrial-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
