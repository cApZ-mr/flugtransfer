import React, { useState } from 'react';
import { RosterShift, ListingType } from '../types';
import { useRoster } from '../context/RosterContext';
import { X, ArrowLeftRight, Gift, Send } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface OfferModalProps {
  shift: RosterShift | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ shift, onClose, onSuccess }) => {
  const { postShiftToMarketplace } = useRoster();
  const [listingType, setListingType] = useState<ListingType>('swap');
  const [notes, setNotes] = useState('');
  const [desiredRoute, setDesiredRoute] = useState('');

  if (!shift) return null;

  const depDate = new Date(shift.departureTime);
  const formattedDate = format(depDate, 'EEE, dd. MMM yyyy', { locale: de });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postShiftToMarketplace(
      shift,
      listingType,
      desiredRoute.trim() || undefined,
      notes.trim() || undefined
    );
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0F172A] rounded-t-2xl sm:rounded-2xl border border-slate-800 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Schicht anbieten: {shift.flightNumber}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {shift.departureIata} → {shift.arrivalIata} am {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Choice: Tauschen vs Abgeben */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Angebotsart</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setListingType('swap')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  listingType === 'swap'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-sm shadow-sky-500/20'
                    : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Tauschen</span>
              </button>

              <button
                type="button"
                onClick={() => setListingType('giveaway')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  listingType === 'giveaway'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-sm shadow-purple-500/20'
                    : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Abgeben</span>
              </button>
            </div>
          </div>

          {/* If swap: desired route or date */}
          {listingType === 'swap' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tauschwunsch (z.B. Ziel, Datum, Zeitraum)
              </label>
              <input
                type="text"
                value={desiredRoute}
                onChange={(e) => setDesiredRoute(e.target.value)}
                placeholder="z.B. Suche Kanaren, Kurzstrecke oder späteres Datum"
                className="w-full px-3.5 py-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Notes / Bemerkung */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {listingType === 'swap' ? 'Bemerkung an Kollegen' : 'Grund / Bemerkung zur Abgabe'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Arzttermin, Familienfeier, layover bevorzugt..."
              className="w-full px-3.5 py-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>In Flugtransfer-Börse veröffentlichen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
