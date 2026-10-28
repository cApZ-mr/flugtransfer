import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { RosterShift } from '../types/roster';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plane, 
  MapPin, 
  ArrowLeftRight, 
  CalendarPlus, 
  Download, 
  Tag,
  FileCode
} from 'lucide-react';

interface CalendarViewProps {
  onOpenCreateListing: (shiftId: string) => void;
  onOpenIcalModal: () => void;
  onOpenMarketplace: () => void;
  onOpenDartCode?: (file?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenCreateListing,
  onOpenIcalModal,
  onOpenMarketplace,
  onOpenDartCode,
}) => {
  const { currentUser, myShifts, listings, cancelListing, exportIcalCalendar } = useRoster();
  
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // November
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-11-18');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const shiftsByDate: Record<string, RosterShift[]> = {};
  for (const s of myShifts) {
    if (!shiftsByDate[s.date]) {
      shiftsByDate[s.date] = [];
    }
    shiftsByDate[s.date].push(s);
  }

  const totalFlights = myShifts.filter(s => s.type === 'FLIGHT').length;
  const totalStandbys = myShifts.filter(s => s.type === 'STANDBY').length;
  const listedCount = myShifts.filter(s => s.status === 'LISTED_FOR_SWAP' || s.status === 'LISTED_FOR_GIVEAWAY').length;

  const selectedShifts = shiftsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Empty Schedule Notice & Call to Action (When testing own iCal) */}
      {myShifts.length === 0 && (
        <div className="bg-gradient-to-r from-sky-500/10 via-[#0C1527] to-sky-500/10 border border-sky-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Dein Dienstplan ist aktuell leer</span>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">Bereit für deinen Test</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Füge jetzt deinen Dienstplan per Apple iCal Link ein oder lade eine .ics Datei hoch.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenIcalModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-sky-500/20"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Apple iCal jetzt einfügen</span>
          </button>
        </div>
      )}
      
      {/* Futuristic Avionics Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#080E1C]/80 border border-sky-500/15 rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Flugtransfer Pilot</div>
          <div className="text-sm sm:text-base font-bold text-white mt-1 truncate font-sans">
            {currentUser?.name || 'Nicht angemeldet'}
          </div>
          <div className="text-[11px] text-sky-400 mt-0.5">
            {currentUser ? `${currentUser.role} · Base ${currentUser.base}` : 'Gast'}
          </div>
        </div>

        <div className="bg-[#080E1C]/80 border border-sky-500/15 rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aktive Flüge</div>
          <div className="text-xl font-black text-white mt-1">{totalFlights}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Monatlicher Umlauf</div>
        </div>

        <div className="bg-[#080E1C]/80 border border-sky-500/15 rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bereitschaft (SBY)</div>
          <div className="text-xl font-black text-white mt-1">{totalStandbys} Tage</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Heimatbasis {currentUser?.base || 'FRA'}</div>
        </div>

        <div className="bg-[#080E1C]/80 border border-sky-500/15 rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Börse inseriert</div>
          <div className="text-xl font-black text-sky-400 mt-1">{listedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zur Abgabe oder Tausch</div>
        </div>
      </div>

      {/* Main Grid: Calendar Matrix & Day Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Minimalist Month Grid */}
        <div className="lg:col-span-7 bg-[#0D121F] border border-slate-800 rounded-3xl p-5 shadow-sm">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Vorheriger Monat"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Nächster Monat"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenIcalModal}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>iCal Link</span>
              </button>

              {onOpenDartCode && (
                <button
                  onClick={() => onOpenDartCode('calendar_screen.dart')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 transition-colors"
                  title="Dart-Code für diesen Kalender-Screen anzeigen"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Dart UI</span>
                </button>
              )}
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 mb-2 py-1 border-b border-slate-800/80">
            <div>Mo</div>
            <div>Di</div>
            <div>Mi</div>
            <div>Do</div>
            <div>Fr</div>
            <div className="text-slate-400">Sa</div>
            <div className="text-slate-400">So</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-22 bg-slate-950/20 rounded-xl" />;
              }

              const formattedDay = String(day).padStart(2, '0');
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const dayShifts = shiftsByDate[dateKey] || [];
              const isSelected = selectedDateStr === dateKey;

              const hasFlight = dayShifts.some(s => s.type === 'FLIGHT');
              const hasSby = dayShifts.some(s => s.type === 'STANDBY');
              const isListed = dayShifts.some(s => s.status === 'LISTED_FOR_SWAP' || s.status === 'LISTED_FOR_GIVEAWAY');

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-20 sm:h-22 p-1.5 rounded-xl text-left flex flex-col justify-between transition-all border relative overflow-hidden ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-400 shadow-sm'
                      : dayShifts.length > 0
                      ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-800'
                      : 'bg-slate-950/40 hover:bg-slate-900/60 border-slate-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                      {day}
                    </span>
                    {isListed && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1 rounded">
                        Börse
                      </span>
                    )}
                  </div>

                  {/* Day shifts snippet */}
                  <div className="space-y-0.5 my-auto w-full">
                    {dayShifts.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className={`text-[9px] font-mono font-medium px-1 py-0.5 rounded truncate ${
                          s.type === 'FLIGHT'
                            ? 'bg-sky-500/15 text-sky-300'
                            : s.type === 'STANDBY'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {s.flightNumber || s.type}
                      </div>
                    ))}
                    {dayShifts.length > 2 && (
                      <div className="text-[8px] text-slate-500 font-mono">
                        +{dayShifts.length - 2}
                      </div>
                    )}
                  </div>

                  {/* Status dot */}
                  <div className="flex items-center gap-1">
                    {hasFlight && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                    {hasSby && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Flug
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Standby
              </span>
            </div>

            <button
              onClick={exportIcalCalendar}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Kalender als .ics exportieren</span>
            </button>
          </div>

        </div>

        {/* Right Column: Day Details & Direct Shift Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0D121F] border border-slate-800 rounded-3xl p-5 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Dienstplan-Details
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {new Date(selectedDateStr).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              {selectedShifts.length > 0 && (
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {selectedShifts.length} {selectedShifts.length === 1 ? 'Dienst' : 'Dienste'}
                </span>
              )}
            </div>

            {selectedShifts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-2 text-slate-600">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Freier Tag (OFF)</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                  Keine Flüge oder Bereitschaften für diesen Tag eingetragen.
                </p>
                <button
                  onClick={onOpenMarketplace}
                  className="mt-3 text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1 mx-auto"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>In der Börse nach Flügen suchen</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedShifts.map((shift) => {
                  const isListedForSwap = shift.status === 'LISTED_FOR_SWAP';
                  const isListedForGiveaway = shift.status === 'LISTED_FOR_GIVEAWAY';
                  const isAlreadyListed = isListedForSwap || isListedForGiveaway;
                  const matchingListing = listings.find(l => l.shift.id === shift.id || l.id === shift.id);

                  return (
                    <div 
                      key={shift.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <Plane className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white font-mono">
                                {shift.flightNumber || shift.type}
                              </span>
                              {shift.aircraft && (
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded font-sans">
                                  {shift.aircraft}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {shift.originCity} {shift.destinationCity ? `➔ ${shift.destinationCity}` : ''}
                            </span>
                          </div>
                        </div>

                        <div>
                          {matchingListing ? (
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              matchingListing.status === 'Offen'
                                ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                                : matchingListing.status === 'In Verhandlung'
                                ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                                : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                            }`}>
                              Status: {matchingListing.status}
                            </span>
                          ) : isAlreadyListed ? (
                            <span className="text-[10px] font-mono font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                              Status: Offen
                            </span>
                          ) : shift.notes?.includes('Getauscht') || shift.notes?.includes('Übernommen') ? (
                            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Status: Abgegeben
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                              Aktiv
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flight route */}
                      {shift.type === 'FLIGHT' && (
                        <div className="bg-[#090D16] rounded-xl p-3 border border-slate-850">
                          <div className="flex items-center justify-between font-mono">
                            <div>
                              <div className="text-base font-bold text-white">{shift.origin}</div>
                              <div className="text-[10px] text-slate-400">{shift.startTime} Uhr</div>
                            </div>

                            <div className="flex-1 px-4 text-center">
                              <div className="text-[10px] text-sky-400 font-semibold mb-1">
                                {shift.blockHours ? `${shift.blockHours}h Block` : 'Non-stop'}
                              </div>
                              <div className="h-0.5 bg-slate-800 w-full relative flex items-center justify-center">
                                <Plane className="w-3 h-3 text-sky-400 absolute rotate-90" />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-bold text-white">{shift.destination}</div>
                              <div className="text-[10px] text-slate-400">{shift.endTime} Uhr</div>
                            </div>
                          </div>

                          {shift.layoverHotel && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                              <span className="truncate">{shift.layoverHotel} ({shift.layoverDurationHours}h Layover)</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Standby / Simulator */}
                      {shift.type !== 'FLIGHT' && (
                        <div className="bg-[#090D16] rounded-xl p-3 border border-slate-850 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Dienstzeit:</span>
                            <span className="font-mono text-white font-semibold">{shift.startTime} – {shift.endTime} Uhr</span>
                          </div>
                          {shift.notes && (
                            <div className="mt-1 text-[11px] text-slate-400">
                              {shift.notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Duty breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400 bg-[#090D16] p-2 rounded-lg border border-slate-850">
                        <div>
                          <div className="text-slate-600">Report</div>
                          <div className="text-slate-300 font-semibold">{shift.reportTime || shift.startTime}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Debrief</div>
                          <div className="text-slate-300 font-semibold">{shift.debriefTime || shift.endTime}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Duty</div>
                          <div className="text-slate-300 font-semibold">{shift.dutyHours || '08:00'}h</div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-2 border-t border-slate-800/80">
                        {isAlreadyListed ? (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">In der Börse online</span>
                            <button
                              onClick={() => cancelListing(shift.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              Zurückziehen
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenCreateListing(shift.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>In Börse einstellen (Abgeben / Tauschen)</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
