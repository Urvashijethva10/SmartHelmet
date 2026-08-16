export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

export const getStatusBadgeInfo = (status) => {
  switch (status) {
    case 'COMPLIANT':
      return {
        label: 'COMPLIANT',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
        glow: 'glow-green',
      };
    case 'VIOLATION':
      return {
        label: 'VIOLATION DETECTED',
        bg: 'bg-red-500/10 text-red-400 border-red-500/30',
        dot: 'bg-red-500',
        glow: 'glow-red',
      };
    case 'WARNING':
      return {
        label: 'WARNING',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        glow: 'glow-amber',
      };
    default:
      return {
        label: 'NO WORKERS',
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-500',
        glow: '',
      };
  }
};

export const getClassBadgeColor = (className) => {
  switch (className) {
    case 'Helmet':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'No-Helmet':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'Vest':
      return 'bg-green-500/20 text-green-300 border-green-500/40';
    case 'No-Vest':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'Person':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  }
};

export const formatComplianceRate = (summary) => {
  if (!summary) return 100;

  const hasViolations =
    (summary.no_helmet_count || 0) > 0 ||
    (summary.no_vest_count || 0) > 0 ||
    (summary.total_violations || 0) > 0;

  const rate = summary.overall_compliance_rate;

  if (typeof rate === 'number') {
    // If violations exist, ensure rate is not mistakenly 100%
    if (hasViolations && rate >= 100) {
      const helmetTotal = (summary.helmet_count || 0) + (summary.no_helmet_count || 0);
      const vestTotal = (summary.vest_count || 0) + (summary.no_vest_count || 0);
      const totalPPE = helmetTotal + vestTotal;
      return totalPPE > 0
        ? Math.round((((summary.helmet_count || 0) + (summary.vest_count || 0)) / totalPPE) * 1000) / 10
        : 0;
    }
    return rate;
  }

  return hasViolations ? 0 : 100;
};

