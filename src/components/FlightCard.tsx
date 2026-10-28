import React from 'react';
import { RosterShift } from '../types';
import { Plane, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface FlightCardProps {
  shift: RosterShift;
  onTradePressed?: () => void;
  actionLabel?: string;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  shift,
  onTradePressed,
  actionLabel = 'In Börse anbieten',
}) => {
  const depDate = new Date(shift.departureTime);
  const arrDate = new Date(shift.arrivalTime);

  const formattedDate = format(depDate, 'EEE, dd. MMM yyyy', { locale: de });
  const depTimeStr = format(depDate, 'HH:mm');
  const arrTimeStr = format(arrDate, 'HH:mm');

  const diffMs = arrDate.getTime() - depDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationFormatted = `${diffHours}h ${diffMins}m`;

  return (
    <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-4 shadow-lg shadow-black/20 hover:border-slate-700 transition-all">
      {/* Top Header: Flight Number & Role */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-sm tracking-wide">
            {shift.flightNumber}
          </div>
          {shift.aircraftType && (
            <span className="text-xs text-slate-400 font-medium">{shift.aircraftType}</span>
          )}
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
          {shift.dutyRole}
        </div>
      </div>

      {/* Flight Route Departure & Arrival */}
      <div className="flex items-center justify-between my-3.5">
        <div className="flex-1">
          <div className="text-2xl font-black text-white tracking-tight">{shift.departureIata}</div>
          <div className="text-xs text-slate-400 font-medium">{depTimeStr} UTC</div>
        </div>

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 mx-2 text-sky-400">
          <Plane className="w-4 h-4" />
        </div>

        <div className="flex-1 text-right">
          <div className="text-2xl font-black text-white tracking-tight">{shift.arrivalIata}</div>
          <div className="text-xs text-slate-400 font-medium">{arrTimeStr} UTC</div>
        </div>
      </div>

      {/* Notes container */}
      {shift.notes && (
        <div className="w-full bg-[#131D31] rounded-lg px-3 py-1.5 mb-3 text-xs text-slate-300 italic border border-slate-800">
          „{shift.notes}”
        </div>
      )}

      <div className="h-px bg-slate-800/80 my-2" />

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400">
          {formattedDate} • {durationFormatted}
        </span>

        {onTradePressed && (
          <button
            onClick={onTradePressed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
