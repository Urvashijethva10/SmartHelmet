import React from 'react';
import { Users, HardHat, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Crosshair, ListChecks } from 'lucide-react';
import { getClassBadgeColor } from '../../utils/formatters';

export default function DetectionStats({ summary, detections }) {
  if (!summary) return null;

  const countCards = [
    { label: 'Personnel', count: summary.worker_count, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { label: 'Helmets', count: summary.helmet_count, icon: HardHat, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { label: 'No-Helmet Violations', count: summary.no_helmet_count, icon: ShieldAlert, color: summary.no_helmet_count > 0 ? 'text-red-400' : 'text-slate-400', bg: summary.no_helmet_count > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-industrial-850 border-industrial-700' },
    { label: 'Safety Vests', count: summary.vest_count, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    { label: 'No-Vest Violations', count: summary.no_vest_count, icon: AlertTriangle, color: summary.no_vest_count > 0 ? 'text-orange-400' : 'text-slate-400', bg: summary.no_vest_count > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-industrial-850 border-industrial-700' },
  ];

  return (
    <div className="space-y-6">
      {/* PPE Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {countCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${item.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className={`text-2xl font-extrabold font-mono mt-2 ${item.color}`}>
                {item.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detected Bounding Box Entities Table */}
      <div className="industrial-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-safety-amber" /> Detected Object Entities ({detections?.length || 0})
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Confidence & BBox Coordinates
          </span>
        </div>

        {detections && detections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-industrial-700 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Class Name</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Bounding Box [x1, y1, x2, y2]</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800 font-mono">
                {detections.map((det, idx) => {
                  const isViolation = det.class_name === 'No-Helmet' || det.class_name === 'No-Vest';
                  const isCompliant = det.class_name === 'Helmet' || det.class_name === 'Vest';

                  return (
                    <tr key={idx} className="hover:bg-industrial-850/50 transition">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getClassBadgeColor(
                            det.class_name
                          )}`}
                        >
                          {det.class_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-200">
                          {Math.round(det.confidence * 100)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        [{det.x1}, {det.y1}, {det.x2}, {det.y2}]
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isViolation ? (
                          <span className="text-red-400 font-bold text-[11px] uppercase">
                            Violation
                          </span>
                        ) : isCompliant ? (
                          <span className="text-emerald-400 font-semibold text-[11px] uppercase">
                            Compliant
                          </span>
                        ) : (
                          <span className="text-cyan-400 font-semibold text-[11px] uppercase">
                            Worker
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No bounding boxes detected.</p>
        )}
      </div>
    </div>
  );
}
