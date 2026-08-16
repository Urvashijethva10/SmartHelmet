import React from 'react';
import { History, Search, Filter, ChevronLeft, ChevronRight, Eye, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatDate, getStatusBadgeInfo, formatComplianceRate } from '../../utils/formatters';

export default function HistoryTable({
  historyData,
  currentPage,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  onSelectRecord,
  onRefresh,
  isLoading,
}) {
  const items = historyData?.items || [];
  const totalPages = historyData?.total_pages || 1;
  const totalRecords = historyData?.total || 0;

  return (
    <div className="industrial-panel rounded-2xl p-6 space-y-5">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-safety-amber" /> Detection Audit Logs & History
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical records persisted in MongoDB Atlas ({totalRecords} total inspections)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-industrial-850 border border-industrial-700 text-xs">
            {['ALL', 'COMPLIANT', 'VIOLATION'].map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === status
                    ? 'bg-safety-amber text-industrial-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            title="Refresh History"
            className="p-2 rounded-xl bg-industrial-800 hover:bg-industrial-700 text-slate-300 hover:text-white border border-industrial-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Data Table */}
      <div className="overflow-x-auto rounded-xl border border-industrial-800 bg-industrial-900/50">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-industrial-700 bg-industrial-850/80 text-slate-400 uppercase font-semibold text-[11px]">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Filename</th>
              <th className="py-3 px-4 text-center">Workers</th>
              <th className="py-3 px-4 text-center">Helmet Violations</th>
              <th className="py-3 px-4 text-center">Vest Violations</th>
              <th className="py-3 px-4 text-center">Compliance</th>
              <th className="py-3 px-4 text-center">Safety Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-industrial-800 font-mono">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const summary = item.summary || {};
                const statusInfo = getStatusBadgeInfo(summary.safety_status);
                const hasViolations = (summary.total_violations || 0) > 0;

                return (
                  <tr key={item.id || idx} className="hover:bg-industrial-850/60 transition">
                    <td className="py-3 px-4 text-slate-300 font-sans whitespace-nowrap">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans max-w-[150px] truncate">
                      {item.filename || 'Scan Image'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-cyan-400">
                      {summary.worker_count || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(summary.no_helmet_count || 0) > 0 ? (
                        <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          {summary.no_helmet_count} Missing
                        </span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(summary.no_vest_count || 0) > 0 ? (
                        <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {summary.no_vest_count} Missing
                        </span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200">
                      {formatComplianceRate(summary)}%
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectRecord(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-300 hover:text-white border border-industrial-700 text-xs font-sans font-medium inline-flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  No detection logs found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>
          Showing page <span className="font-bold text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-industrial-700 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-industrial-700 flex items-center gap-1 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
