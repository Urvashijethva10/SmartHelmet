import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { getStatusBadgeInfo } from '../../utils/formatters';

export default function SafetyBanner({ summary, inferenceTimeMs }) {
  if (!summary) return null;

  const status = summary.safety_status;
  const isViolation = status === 'VIOLATION';
  const isCompliant = status === 'COMPLIANT';

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 ${
        isViolation
          ? 'bg-red-950/40 border-red-500/50 glow-red'
          : isCompliant
          ? 'bg-emerald-950/40 border-emerald-500/50 glow-green'
          : 'bg-industrial-900 border-industrial-700'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Status Alert */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl border mt-0.5 shrink-0 ${
              isViolation
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : isCompliant
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
            }`}
          >
            {isViolation ? (
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            ) : isCompliant ? (
              <ShieldCheck className="w-7 h-7" />
            ) : (
              <Info className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {isViolation
                  ? 'SAFETY VIOLATION DETECTED'
                  : isCompliant
                  ? 'ALL WORKERS COMPLIANT'
                  : 'NO ACTIVE PERSONNEL SCANNED'}
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isViolation
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : isCompliant
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                }`}
              >
                Overall Compliance: {summary.overall_compliance_rate}%
              </span>
            </div>

            {/* Violation List */}
            {isViolation && summary.violations?.length > 0 ? (
              <div className="mt-2 space-y-1">
                {summary.violations.map((v, idx) => (
                  <p key={idx} className="text-xs text-red-300 font-medium flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{v}</span>
                  </p>
                ))}
              </div>
            ) : isCompliant ? (
              <p className="text-xs text-emerald-300 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                All detected personnel are properly equipped with required Helmets and Safety Vests.
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                No workers or PPE classes were recognized in this frame above the confidence threshold.
              </p>
            )}
          </div>
        </div>

        {/* Right Metadata Badge */}
        <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-industrial-800 pt-3 md:pt-0 md:pl-6 shrink-0 gap-1 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Inference Speed:</span>
            <span className="font-mono font-bold text-cyan-400">{inferenceTimeMs} ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Engine:</span>
            <span className="font-mono text-slate-300">Ultralytics YOLO11</span>
          </div>
        </div>
      </div>
    </div>
  );
}
