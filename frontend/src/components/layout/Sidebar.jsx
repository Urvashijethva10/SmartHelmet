import React from 'react';
import { LayoutDashboard, ScanEye, History, ShieldAlert, CheckCircle, ShieldCheck, HardHat, Info } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Safety Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'detection', label: 'PPE Detection Studio', icon: ScanEye, badge: 'YOLO11' },
    { id: 'history', label: 'Detection Logs', icon: History, badge: null },
  ];

  return (
    <aside className="w-64 bg-industrial-900 border-r border-industrial-700/60 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-safety-amber/15 text-safety-amber border border-safety-amber/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-industrial-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-safety-amber' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-safety-amber text-industrial-950' : 'bg-industrial-700 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monitored Safety Classes Card */}
        <div className="rounded-xl bg-industrial-850 border border-industrial-700/60 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-safety-amber" /> Monitored Classes
            </span>
            <span className="text-[10px] font-mono bg-industrial-750 text-slate-300 px-1.5 py-0.5 rounded border border-industrial-700">5 Classes</span>
          </div>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-industrial-900/60 border border-industrial-800">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 0: Helmet
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Compliant</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-industrial-900/60 border border-industrial-800">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> 1: No-Helmet
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase">Violation</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-industrial-900/60 border border-industrial-800">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> 2: No-Vest
              </span>
              <span className="text-[10px] text-orange-400 font-bold uppercase">Violation</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-industrial-900/60 border border-industrial-800">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 3: Person
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase">Worker</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-industrial-900/60 border border-industrial-800">
              <span className="flex items-center gap-2 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> 4: Vest
              </span>
              <span className="text-[10px] text-green-400 font-semibold uppercase">Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Compliance Standard Card */}
      <div className="pt-4 border-t border-industrial-800 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OSHA Standard Protocol</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Hard hats & high-visibility safety vests must be worn at all active industrial construction zones.
        </p>
      </div>
    </aside>
  );
}
