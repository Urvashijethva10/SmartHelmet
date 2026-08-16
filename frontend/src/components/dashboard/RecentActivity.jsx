import React from 'react';
import { Clock, ShieldAlert, ShieldCheck, ArrowRight, Eye, AlertTriangle } from 'lucide-react';
import { formatDate, getStatusBadgeInfo, formatComplianceRate } from '../../utils/formatters';

export default function RecentActivity({ recentDetections, onSelectDetection, onNavigateToDetection }) {
  if (!recentDetections || recentDetections.length === 0) {
    return (
      <div className="industrial-panel rounded-2xl p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Clock className="w-10 h-10 text-slate-500 mb-3" />
          <h4 className="text-base font-bold text-slate-300">No Recent Detections Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            Upload an image in the PPE Detection Studio to run YOLO11 inference and monitor compliance.
          </p>
          <button
            onClick={onNavigateToDetection}
            className="px-4 py-2 rounded-xl bg-safety-amber hover:bg-amber-400 text-industrial-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-safety-amber/20"
          >
            Run New Inspection <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="industrial-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-safety-amber" /> Recent Inspection Feed
        </h4>
        <span className="text-xs text-slate-400 font-mono">Latest {recentDetections.length} logs</span>
      </div>

      <div className="divide-y divide-industrial-800">
        {recentDetections.map((item, idx) => {
          const summary = item.summary || {};
          const statusInfo = getStatusBadgeInfo(summary.safety_status);
          const hasViolations = (summary.total_violations || 0) > 0;

          return (
            <div
              key={item.id || idx}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-industrial-850/50 px-2 rounded-xl transition"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                    hasViolations
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {hasViolations ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 text-sm">
                      {item.filename || 'Image Inspection'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                    <span>{formatDate(item.timestamp)}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">Workers: {summary.worker_count || 0}</span>
                    <span>•</span>
                    <span className="text-emerald-400">Helmets: {summary.helmet_count || 0}</span>
                    <span>•</span>
                    <span className="text-green-400">Vests: {summary.vest_count || 0}</span>
                    {hasViolations && (
                      <>
                        <span>•</span>
                        <span className="text-red-400 font-bold">
                          Violations: {summary.total_violations}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-mono font-bold text-slate-300">
                    {formatComplianceRate(summary)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Compliance</div>
                </div>

                <button
                  onClick={() => onSelectDetection(item)}
                  className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-300 hover:text-white border border-industrial-700 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
