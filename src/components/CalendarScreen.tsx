import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { FlightCard } from './FlightCard';
import { OfferModal } from './OfferModal';
import { RosterShift } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  Settings as SettingsIcon,
  Link as LinkIcon,
  FlaskConical,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarScreenProps {
  onNavigateToSettings: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToSettings }) => {
  const { userProfile, myShifts, loadSampleShifts, exportRosterAsICal } = useRoster();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftForOffer, setSelectedShiftForOffer] = useState<RosterShift | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const monthYearString = format(currentDate, 'MMMM yyyy', { locale: de });

  return (
    <div className="flex flex-col h-full bg-[#090D16]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Bar */}
      <header className="bg-[#0F172A] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <PlaneTakeoff className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Flugtransfer</h1>
            <p className="text-xs text-slate-400">
              {userProfile.name} • Base {userProfile.base} ({userProfile.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {myShifts.length > 0 && (
            <button
              onClick={exportRosterAsICal}
              title="Als .ics exportieren"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onNavigateToSettings}
            title="Einstellungen & iCal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Month Selector Bar */}
      <div className="bg-[#0F172A] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-sm font-bold text-white capitalize">{monthYearString}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {myShifts.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
              <CalendarIcon className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-white mb-2">Kein Dienstplan geladen</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Füge deinen persönlichen Dienstplan über deinen Apple iCal Link ein oder teste die App
              mit vorgefertigten Muster-Schichten.
            </p>

            <div className="flex flex-col w-full gap-2.5">
              <button
                onClick={onNavigateToSettings}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Apple iCal Link einfügen</span>
              </button>

              <button
                onClick={() => {
                  loadSampleShifts();
                  showToast('Muster-Dienstplan erfolgreich geladen!');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sky-400 font-semibold text-xs transition-all cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Muster-Dienstplan laden</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{myShifts.length} Schichten im Dienstplan</span>
              <button
                onClick={onNavigateToSettings}
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Synchronisieren</span>
              </button>
            </div>

            {myShifts.map((shift) => (
              <FlightCard
                key={shift.id}
                shift={shift}
                onTradePressed={() => setSelectedShiftForOffer(shift)}
                actionLabel="In Börse anbieten"
              />
            ))}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {selectedShiftForOffer && (
        <OfferModal
          shift={selectedShiftForOffer}
          onClose={() => setSelectedShiftForOffer(null)}
          onSuccess={() =>
            showToast('Schicht erfolgreich in der Flugtransfer-Börse veröffentlicht!')
          }
        />
      )}
    </div>
  );
};
