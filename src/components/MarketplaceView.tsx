import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { 
  ArrowLeftRight, 
  Search, 
  Plane, 
  Plus, 
  MessageSquare, 
  Trash2,
  Eye,
  Flame,
  ArrowRight,
  FileCode
} from 'lucide-react';
import { getTradeStatusMetadata } from '../utils/statusNormalizer';

interface MarketplaceViewProps {
  onOpenCreateListing: (shiftId?: string) => void;
  onOpenNegotiationChat: (listingId: string, offeredShiftId?: string) => void;
  onOpenDartCode?: (file?: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onOpenCreateListing,
  onOpenNegotiationChat,
  onOpenDartCode,
}) => {
  const { currentUser, listings, cancelListing, incrementListingViews } = useRoster();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SWAP' | 'GIVEAWAY' | 'MINE'>('ALL');
  const [filterBase, setFilterBase] = useState<string>('ALL');

  const filteredListings = listings.filter((item) => {
    // Hide shifts that are already 'Abgegeben'
    if (item.status === 'Abgegeben') return false;

    if (filterType === 'SWAP' && item.listingType !== 'SWAP') return false;
    if (filterType === 'GIVEAWAY' && item.listingType !== 'GIVEAWAY') return false;
    if (filterType === 'MINE' && item.sellerId !== currentUser?.id) return false;

    if (filterBase !== 'ALL' && item.sellerBase !== filterBase) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchFlight = item.shift.flightNumber?.toLowerCase().includes(q);
      const matchOrigin = item.shift.origin?.toLowerCase().includes(q) || item.shift.originCity?.toLowerCase().includes(q);
      const matchDest = item.shift.destination?.toLowerCase().includes(q) || item.shift.destinationCity?.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      const matchWish = item.wishDescription.toLowerCase().includes(q);
      const matchStatus = item.status.toLowerCase().includes(q);
      return matchFlight || matchOrigin || matchDest || matchSeller || matchWish || matchStatus;
    }

    return true;
  });

  const handleCardClick = (listingId: string) => {
    incrementListingViews(listingId);
  };

  return (
    <div className="space-y-6">
      
      {/* Futuristic Command Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080E1C] via-[#050811] to-[#03060C] border border-sky-500/20 p-6 sm:p-7 shadow-2xl">
        {/* Subtle Avionics Grid Background Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                Dienstplan-Börse
              </span>
              <span className="text-xs text-slate-500 font-mono">Live Roster Exchange</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>Crew Shift Market</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Finde passende Flüge deiner Kollegen, tausche Umläufe oder gib Dienste ab. Alle Transaktionen synchronisieren sich automatisch mit deinem Kalender.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenDartCode && (
              <button
                onClick={() => onOpenDartCode('marketplace_screen.dart')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 text-xs font-semibold transition-all"
                title="Dart-Code für diesen Börsen-Screen anzeigen"
              >
                <FileCode className="w-4 h-4" />
                <span>Dart UI</span>
              </button>
            )}

            <button
              onClick={() => onOpenCreateListing()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Schicht inserieren</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Flug (z.B. FT 1404), Ziel (PMI, LPA), Kollege..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#03060C]/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/80 font-mono transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#03060C] p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Alle ({listings.filter(l => l.status !== 'Abgegeben').length})
              </button>
              <button
                onClick={() => setFilterType('SWAP')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === 'SWAP'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Tausch
              </button>
              <button
                onClick={() => setFilterType('GIVEAWAY')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === 'GIVEAWAY'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Abgabe
              </button>
              <button
                onClick={() => setFilterType('MINE')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === 'MINE'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Meine
              </button>
            </div>

            <select
              value={filterBase}
              onChange={(e) => setFilterBase(e.target.value)}
              className="bg-[#03060C] border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Alle Basen</option>
              <option value="FRA">Base FRA (Frankfurt)</option>
              <option value="MUC">Base MUC (München)</option>
              <option value="DUS">Base DUS (Düsseldorf)</option>
              <option value="BER">Base BER (Berlin)</option>
              <option value="HAM">Base HAM (Hamburg)</option>
              <option value="ZRH">Base ZRH (Zürich)</option>
              <option value="VIE">Base VIE (Wien)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Futuristic Shift Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-[#080E1C]/60 border border-slate-850 rounded-3xl p-12 text-center">
          <ArrowLeftRight className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Keine Schichten in diesem Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Erstelle selbst das erste Angebot für deine Basis oder passe die Filterkriterien an.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => {
            const isMyListing = listing.sellerId === currentUser?.id;
            const shift = listing.shift;
            const isSwap = listing.listingType === 'SWAP';
            const views = listing.viewsCount || 42;
            const inquiries = listing.inquiriesCount || 0;

            return (
              <div
                key={listing.id}
                onClick={() => handleCardClick(listing.id)}
                className="group relative rounded-3xl bg-[#090E1A]/80 hover:bg-[#0C1322] border border-slate-800/80 hover:border-sky-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-xl"
              >
                <div>
                  
                  {/* Top Bar: Mode Badge + Status (Offen / In Verhandlung / Abgegeben) + Telemetry Views */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                          isSwap
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isSwap ? '⇄ TAUSCH' : '↓ ABGABE'}
                      </span>

                      {/* STATUSBADGE: Offen | In Verhandlung | Abgegeben */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          getTradeStatusMetadata(listing.status).color
                        }`}
                      >
                        {getTradeStatusMetadata(listing.status).label}
                      </span>

                      {listing.urgency === 'URGENT' && (
                        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-rose-400" /> Dringend
                        </span>
                      )}
                    </div>

                    {/* AUFRUFE AUF SCHICHT ANZEIGEN (User Request!) */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400" title="Aufrufe dieser Schicht">
                        <Eye className="w-3 h-3 text-sky-400/80" />
                        <span className="font-semibold text-slate-300">{views}</span> Aufrufe
                      </span>
                      {inquiries > 0 && (
                        <span className="text-sky-400 font-semibold">
                          · {inquiries} {inquiries === 1 ? 'Chat' : 'Chats'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flight Telemetry Box */}
                  <div className="bg-[#04070F] rounded-2xl p-4 border border-slate-850 mb-3 group-hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-white tracking-wide">
                          {shift.flightNumber || shift.type}
                        </span>
                        {shift.aircraft && (
                          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {shift.aircraft}
                          </span>
                        )}
                      </div>

                      <div className="text-right font-mono text-xs text-sky-400 font-bold">
                        {shift.blockHours ? `${shift.blockHours}h Block` : 'Duty'}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      {new Date(shift.date).toLocaleDateString('de-DE', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Route Vector */}
                    {shift.type === 'FLIGHT' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-900 font-mono">
                        <div>
                          <div className="text-lg font-black text-white">{shift.origin}</div>
                          <div className="text-[10px] text-slate-500">{shift.startTime} Uhr</div>
                        </div>

                        <div className="flex-1 px-4 text-center">
                          <div className="relative flex items-center justify-center">
                            <div className="w-full h-px bg-slate-800" />
                            <Plane className="w-3.5 h-3.5 text-sky-400 absolute rotate-90" />
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 truncate">
                            {shift.originCity} ➔ {shift.destinationCity}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-white">{shift.destination}</div>
                          <div className="text-[10px] text-slate-500">{shift.endTime} Uhr</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wish / Requirement */}
                  <div className="bg-[#050912] rounded-xl p-3 border border-slate-850 text-xs mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-sky-400 block mb-0.5">
                      {isSwap ? 'Gesuch für den Tausch:' : 'Grund der Abgabe:'}
                    </span>
                    <p className="text-slate-200 leading-snug">
                      "{listing.wishDescription}"
                    </p>
                  </div>

                  {listing.notes && (
                    <p className="text-[11px] text-slate-500 italic mb-3 line-clamp-2 px-1">
                      {listing.notes}
                    </p>
                  )}
                </div>

                {/* Footer with Seller + Direct Chat Action */}
                <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={listing.sellerAvatar}
                      alt={listing.sellerName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                        <span>{listing.sellerName}</span>
                        {isMyListing && <span className="text-[9px] text-sky-400 font-mono">(Du)</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {listing.sellerRole} · Base {listing.sellerBase}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isMyListing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelListing(listing.id);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Angebot zurückziehen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementListingViews(listing.id);
                          onOpenNegotiationChat(listing.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat eröffnen</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
