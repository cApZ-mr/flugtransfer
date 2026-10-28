import React from 'react';
import { TradeStatus } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface TradeProgressBarProps {
  status: TradeStatus;
}

export const TradeProgressBar: React.FC<TradeProgressBarProps> = ({ status }) => {
  let activeIndex = 0;
  if (status === 'open') activeIndex = 0;
  if (status === 'inNegotiation') activeIndex = 1;
  if (status === 'completed') activeIndex = 2;

  const renderStep = (title: string, stepIndex: number) => {
    const isDone = activeIndex > stepIndex;
    const isCurrent = activeIndex === stepIndex;

    let colorClasses = 'text-slate-500';
    if (isCurrent) {
      colorClasses = 'text-sky-400 font-bold';
    } else if (isDone) {
      colorClasses = 'text-emerald-400 font-medium';
    }

    return (
      <div className={`flex items-center gap-1 text-[11px] whitespace-nowrap ${colorClasses}`}>
        {isDone || isCurrent ? (
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-sky-400' : 'text-emerald-400'}`} />
        ) : (
          <Circle className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span>{title}</span>
      </div>
    );
  };

  const renderConnector = (active: boolean) => (
    <div
      className={`flex-1 h-[2px] mx-1.5 transition-colors ${
        active ? 'bg-emerald-500/80' : 'bg-slate-800'
      }`}
    />
  );

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-[#0F172A] border-b border-slate-800/80 text-xs select-none">
      {renderStep('1. Offen', 0)}
      {renderConnector(activeIndex >= 1)}
      {renderStep('2. In Verhandlung', 1)}
      {renderConnector(activeIndex >= 2)}
      {renderStep('3. Abgegeben', 2)}
    </div>
  );
};
