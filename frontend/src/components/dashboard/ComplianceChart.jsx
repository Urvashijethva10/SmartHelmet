import React from 'react';
import { BarChart3, PieChart, ShieldCheck, AlertOctagon, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function ComplianceChart({ stats }) {
  const classCounts = stats?.class_counts || {
    Helmet: 0,
    'No-Helmet': 0,
    Vest: 0,
    'No-Vest': 0,
    Person: 0,
  };

  const statusBreakdown = stats?.status_breakdown || {
    COMPLIANT: 0,
    VIOLATION: 0,
    WARNING: 0,
    NO_WORKERS: 0,
  };

  const totalScans = stats?.total_inspections || 0;
  const compliantScans = statusBreakdown.COMPLIANT || 0;
  const violationScans = statusBreakdown.VIOLATION || 0;

  const maxClassCount = Math.max(...Object.values(classCounts), 1);

  const classes = [
    { name: 'Helmet (Compliant)', count: classCounts['Helmet'] || 0, color: 'bg-emerald-500', barBg: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    { name: 'No-Helmet (Violation)', count: classCounts['No-Helmet'] || 0, color: 'bg-red-500', barBg: 'bg-red-500/20', textColor: 'text-red-400' },
    { name: 'Vest (Compliant)', count: classCounts['Vest'] || 0, color: 'bg-green-500', barBg: 'bg-green-500/20', textColor: 'text-green-400' },
    { name: 'No-Vest (Violation)', count: classCounts['No-Vest'] || 0, color: 'bg-orange-500', barBg: 'bg-orange-500/20', textColor: 'text-orange-400' },
    { name: 'Person (Workers)', count: classCounts['Person'] || 0, color: 'bg-cyan-500', barBg: 'bg-cyan-500/20', textColor: 'text-cyan-400' },
  ];

  const overallRate = stats?.overall_compliance_rate ?? 100.0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Overall Safety Compliance Gauge */}
      <div className="industrial-panel rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Overall Compliance Score
            </h4>
            <span className="text-xs px-2 py-0.5 rounded bg-industrial-800 text-slate-400 border border-industrial-700">
              {totalScans} Total Scans
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center">
            {/* Visual Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-industrial-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Progress Value */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallRate / 100)}`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${
                    overallRate >= 85 ? 'text-emerald-500' : overallRate >= 60 ? 'text-amber-500' : 'text-red-500'
                  }`}
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white font-mono">{overallRate}%</span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                  {overallRate >= 85 ? 'OSHA Compliant' : overallRate >= 60 ? 'Warning Zone' : 'High Risk'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Status Summary */}
        <div className="mt-6 pt-4 border-t border-industrial-700/60 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-slate-400">Compliant Scans</p>
              <p className="text-base font-bold text-emerald-400">{compliantScans}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="text-slate-400">Violation Scans</p>
              <p className="text-base font-bold text-red-400">{violationScans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detected Classes Breakdown Bar Chart */}
      <div className="industrial-panel rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-safety-amber" /> Monitored PPE & Entity Distribution
            </h4>
            <span className="text-xs text-slate-400">5 Monitored Classes</span>
          </div>

          <div className="mt-6 space-y-4">
            {classes.map((cls, idx) => {
              const percentage = Math.round((cls.count / maxClassCount) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">{cls.name}</span>
                    <span className={`font-mono font-bold ${cls.textColor}`}>
                      {cls.count} detected
                    </span>
                  </div>
                  <div className="h-3 w-full bg-industrial-800 rounded-full overflow-hidden p-0.5 border border-industrial-700/50">
                    <div
                      className={`h-full rounded-full ${cls.color} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(percentage, cls.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-industrial-700/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Real-time inference counts from MongoDB
          </span>
          <span className="font-mono text-slate-400">
            Total Entities: {Object.values(classCounts).reduce((a, b) => a + b, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
