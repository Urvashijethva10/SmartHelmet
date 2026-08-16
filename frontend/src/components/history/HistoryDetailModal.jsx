import React from 'react';
import { X, Calendar, FileText, ShieldAlert, ShieldCheck, HardHat, Users, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate, getStatusBadgeInfo, getClassBadgeColor } from '../../utils/formatters';

export default function HistoryDetailModal({ record, onClose }) {
  if (!record) return null;

  const summary = record.summary || {};
  const detections = record.detections || [];
  const statusInfo = getStatusBadgeInfo(summary.safety_status);
  const isViolation = summary.safety_status === 'VIOLATION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto industrial-panel rounded-2xl p-6 border border-industrial-600 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-industrial-700">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-white">Inspection Audit Record</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(record.timestamp)}</span>
              <span>•</span>
              <span className="font-mono text-cyan-400">ID: {record.id || 'N/A'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-400 hover:text-white border border-industrial-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-industrial-850 border border-industrial-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Workers</span>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{summary.worker_count || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-industrial-850 border border-industrial-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Helmet Wearing</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.helmet_count || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-industrial-850 border border-industrial-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Vest Wearing</span>
            <p className="text-xl font-bold font-mono text-green-400 mt-1">{summary.vest_count || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-industrial-850 border border-industrial-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Violations</span>
            <p className={`text-xl font-bold font-mono mt-1 ${isViolation ? 'text-red-400' : 'text-emerald-400'}`}>
              {summary.total_violations || 0}
            </p>
          </div>
        </div>

        {/* Violations Details */}
        {summary.violations?.length > 0 && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
            <h5 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Recorded Safety Violations:
            </h5>
            <ul className="space-y-1 text-xs text-red-200">
              {summary.violations.map((v, i) => (
                <li key={i} className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bounding Box Entities List */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Detected Entities & Bounding Coordinates ({detections.length})
          </h5>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-industrial-800 bg-industrial-950/60">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-industrial-700 text-slate-400 text-[11px]">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Class</th>
                  <th className="py-2 px-3">Confidence</th>
                  <th className="py-2 px-3">Bounding Box</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800">
                {detections.map((d, i) => (
                  <tr key={i} className="hover:bg-industrial-800/50">
                    <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getClassBadgeColor(d.class_name)}`}>
                        {d.class_name}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-200 font-semibold">{Math.round(d.confidence * 100)}%</td>
                    <td className="py-2 px-3 text-slate-400">[{d.x1}, {d.y1}, {d.x2}, {d.y2}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-industrial-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-slate-200 font-bold text-xs transition border border-industrial-700"
          >
            Close Audit Details
          </button>
        </div>
      </div>
    </div>
  );
}
