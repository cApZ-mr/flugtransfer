import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { ListingType } from '../types/roster';
import { 
  ArrowLeftRight, 
  Plane, 
  Tag, 
  X 
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  preselectedShiftId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  preselectedShiftId,
  onClose,
  onSuccess,
}) => {
  const { myShifts, createListing } = useRoster();

  const availableShifts = myShifts.filter(
    s => s.status === 'ACTIVE' || s.id === preselectedShiftId
  );

  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    preselectedShiftId || (availableShifts[0]?.id || '')
  );
  const [listingType, setListingType] = useState<ListingType>('SWAP');
  const [wishDescription, setWishDescription] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentShift = availableShifts.find(s => s.id === selectedShiftId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId) return;

    createListing(
      selectedShiftId,
      listingType,
      wishDescription.trim(),
      notes.trim()
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D121F] border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Schicht in der Börse anbieten
            </h3>
            <p className="text-xs text-slate-400">
              Stelle einen Flug oder Dienst zum Tauschen oder Abgeben ein.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Shift */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              1. Dienst auswählen:
            </label>
            {availableShifts.length === 0 ? (
              <div className="p-3 bg-slate-950 rounded-xl text-rose-400 border border-slate-800">
                Keine aktiven Schichten im Plan vorhanden. Importiere zuerst einen Dienstplan.
              </div>
            ) : (
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
              >
                {availableShifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} · {s.flightNumber || s.type} {s.origin ? `(${s.origin} ➔ ${s.destination})` : ''} · {s.startTime} Uhr
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentShift && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex items-center justify-between text-white font-bold font-mono">
                <span className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span>{currentShift.flightNumber || currentShift.type}</span>
                </span>
                <span className="text-sky-400 font-mono">{currentShift.blockHours ? `${currentShift.blockHours}h Block` : 'Dienst'}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                {currentShift.origin ? `${currentShift.origin} (${currentShift.startTime} Uhr) ➔ ${currentShift.destination} (${currentShift.endTime} Uhr)` : currentShift.notes}
              </div>
            </div>
          )}

          {/* Mode */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              2. Art des Angebots:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setListingType('SWAP')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  listingType === 'SWAP'
                    ? 'bg-sky-500/10 border-sky-500 text-white'
                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tauschen (⇄)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Gegen einen anderen Flug oder Ausgleichstag.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setListingType('GIVEAWAY')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  listingType === 'GIVEAWAY'
                    ? 'bg-sky-500/10 border-sky-500 text-white'
                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abgeben (↓)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Komplette Abgabe an einen Kollegen.
                </div>
              </button>
            </div>
          </div>

          {/* Wish */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {listingType === 'SWAP' ? '3. Was suchst du dafür im Gegenzug?' : '3. Grund für die Abgabe:'}
            </label>
            <input
              type="text"
              placeholder={
                listingType === 'SWAP'
                  ? 'z.B. Suche freien Tag am Wochenende oder Palma-Umlauf'
                  : 'z.B. Privater Termin, Übernahme erbeten'
              }
              value={wishDescription}
              onChange={(e) => setWishDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Zusätzliche Notizen (optional):
            </label>
            <input
              type="text"
              placeholder="z.B. Pünktlicher Slot, angenehme Crew"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-850"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!selectedShiftId}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 transition-colors"
            >
              In Börse einstellen
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
