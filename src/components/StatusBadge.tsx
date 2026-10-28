import React from 'react';
import { TradeStatus } from '../types';

interface StatusBadgeProps {
  status: TradeStatus;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  let label = 'Offen';
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-950/40';
  let borderColor = 'border-emerald-500/40';
  let dotColor = 'bg-emerald-400';

  if (status === 'inNegotiation') {
    label = 'In Verhandlung';
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-950/40';
    borderColor = 'border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (status === 'completed') {
    label = 'Abgegeben';
    textColor = 'text-slate-400';
    bgColor = 'bg-slate-800/40';
    borderColor = 'border-slate-700/60';
    dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${textColor} ${bgColor} ${borderColor}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
    </span>
  );
};
