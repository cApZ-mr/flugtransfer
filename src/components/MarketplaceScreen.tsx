import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { MarketListing, ListingType } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, MessageSquare, Eye, PlaneTakeoff, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface MarketplaceScreenProps {
  onOpenChat: (negotiationId: string) => void;
}

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ onOpenChat }) => {
  const { marketplaceListings, openChatForListing } = useRoster();
  const [filterType, setFilterType] = useState<'all' | ListingType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = marketplaceListings.filter((item) => {
    if (filterType === 'giveaway' && item.type !== 'giveaway') return false;
    if (filterType === 'swap' && item.type !== 'swap') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFlight = item.shift.flightNumber.toLowerCase().includes(q);
      const matchRoute = `${item.shift.departureIata} ${item.shift.arrivalIata}`
        .toLowerCase()
        .includes(q);
      const matchName = item.colleagueName.toLowerCase().includes(q);
      return matchFlight || matchRoute || matchName;
    }
    return true;
  });

  const handleNegotiate = (item: MarketListing) => {
    const chatId = openChatForListing(item);
    onOpenChat(chatId);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16]">
      {/* AppBar */}
      <header className="bg-[#0F172A] border-b border-slate-800/80 px-4 py-3 shrink-0">
        <h1 className="text-base font-bold text-white">Flugtransfer Börse</h1>
      </header>

      {/* Filter and Search Container */}
      <div className="bg-[#0F172A] p-4 border-b border-slate-800/80 space-y-3 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Flugnummer, Route oder Kollege suchen..."
            className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {(
            [
              { label: 'Alle', value: 'all' },
              { label: 'Abgeben', value: 'giveaway' },
              { label: 'Tauschen', value: 'swap' },
            ] as const
          ).map((chip) => {
            const isSelected = filterType === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => setFilterType(chip.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'bg-[#1E293B] text-slate-400 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter Banner */}
      <div className="px-4 py-2 bg-[#090D16] border-b border-slate-900 flex items-center justify-between text-xs shrink-0">
        <span className="text-slate-400">{filteredListings.length} Schichten verfügbar</span>
        <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live-Aktualisierung
        </span>
      </div>

      {/* Listings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredListings.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-center text-xs text-slate-500">
            Keine Schichten gefunden.
          </div>
        ) : (
          <div className="space-y-3.5 max-w-xl mx-auto">
            {filteredListings.map((item) => {
              const depDate = new Date(item.shift.departureTime);
              const arrDate = new Date(item.shift.arrivalTime);
              const dateStr = format(depDate, 'EEE, dd. MMM yyyy', { locale: de });
              const depTime = format(depDate, 'HH:mm');
              const arrTime = format(arrDate, 'HH:mm');

              const isNeg = item.status === 'inNegotiation';

              return (
                <div
                  key={item.id}
                  className={`bg-[#0F172A] rounded-2xl border p-4 shadow-lg transition-all ${
                    isNeg
                      ? 'border-amber-500/30 shadow-amber-950/10'
                      : 'border-slate-800 shadow-black/20 hover:border-slate-700'
                  }`}
                >
                  {/* Header Row: Type pill + Status badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        item.type === 'swap'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {item.type === 'swap' ? 'Tausch' : 'Abgabe'}
                    </span>

                    <StatusBadge status={item.status} />
                  </div>

                  {/* Flight & Route */}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>{item.shift.flightNumber}</span>
                        {item.shift.aircraftType && (
                          <span className="text-[11px] font-normal text-slate-400">
                            ({item.shift.aircraftType})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.shift.departureIata} → {item.shift.arrivalIata} • {dateStr}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-sky-400">
                        {depTime} - {arrTime} UTC
                      </span>
                    </div>
                  </div>

                  {/* Desired Route or Date for swap */}
                  {item.desiredRouteOrDate && (
                    <div className="mt-2 text-xs text-sky-300/90 font-medium flex items-center gap-1.5 bg-sky-950/20 px-2.5 py-1 rounded-md border border-sky-800/30">
                      <Sparkles className="w-3 h-3 shrink-0 text-sky-400" />
                      <span>{item.desiredRouteOrDate}</span>
                    </div>
                  )}

                  {/* Notes snippet */}
                  {item.notes && (
                    <div className="mt-2.5 bg-[#1E293B]/70 rounded-lg p-2.5 text-xs text-slate-300 italic border border-slate-800">
                      „{item.notes}”
                    </div>
                  )}

                  <div className="h-px bg-slate-800/80 my-3" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.colleagueName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.colleagueRole} • Base {item.colleagueBase}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.viewsCount} Aufrufe
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {item.inquiriesCount} Anfragen
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNegotiate(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Verhandeln</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
