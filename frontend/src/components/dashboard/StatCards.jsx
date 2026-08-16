import React from 'react';
import { Users, HardHat, ShieldAlert, ShieldCheck, FileCheck2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function StatCards({ stats }) {
  const cards = [
    {
      title: 'Total Workers Detected',
      value: stats?.total_workers || 0,
      unit: 'Personnel',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      desc: 'Active workers scanned',
    },
    {
      title: 'Helmet Compliance',
      value: `${stats?.helmet_compliance_rate ?? 100}%`,
      unit: `${stats?.class_counts?.['Helmet'] || 0} / ${(stats?.class_counts?.['Helmet'] || 0) + (stats?.class_counts?.['No-Helmet'] || 0)} Wearing`,
      icon: HardHat,
      color: (stats?.helmet_compliance_rate ?? 100) >= 80 ? 'text-emerald-400' : 'text-amber-400',
      bgColor: (stats?.helmet_compliance_rate ?? 100) >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30',
      desc: `${stats?.class_counts?.['No-Helmet'] || 0} Violations detected`,
    },
    {
      title: 'Vest Compliance',
      value: `${stats?.vest_compliance_rate ?? 100}%`,
      unit: `${stats?.class_counts?.['Vest'] || 0} / ${(stats?.class_counts?.['Vest'] || 0) + (stats?.class_counts?.['No-Vest'] || 0)} Wearing`,
      icon: ShieldCheck,
      color: (stats?.vest_compliance_rate ?? 100) >= 80 ? 'text-emerald-400' : 'text-amber-400',
      bgColor: (stats?.vest_compliance_rate ?? 100) >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30',
      desc: `${stats?.class_counts?.['No-Vest'] || 0} Violations detected`,
    },
    {
      title: 'Safety Violations',
      value: stats?.total_violations || 0,
      unit: 'Total Infractions',
      icon: ShieldAlert,
      color: (stats?.total_violations || 0) > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: (stats?.total_violations || 0) > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30',
      desc: (stats?.total_violations || 0) > 0 ? 'Urgent action required' : 'Zero violations recorded',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="industrial-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl border ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-industrial-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">{card.unit}</span>
              <span className={`font-medium ${card.color}`}>{card.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
