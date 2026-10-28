import React, { useState, useEffect, useRef } from 'react';
import { useRoster } from '../context/RosterContext';
import { StatusBadge } from './StatusBadge';
import { TradeProgressBar } from './TradeProgressBar';
import {
  ArrowLeft,
  PlaneTakeoff,
  Handshake,
  CheckCircle2,
  Check,
  Send,
  CheckCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatRoomScreenProps {
  negotiationId: string;
  onBack: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ negotiationId, onBack }) => {
  const { negotiations, sendMessage, confirmTradeStep } = useRoster();
  const [inputText, setInputText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const neg = negotiations.find((n) => n.id === negotiationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [neg?.messages]);

  if (!neg) {
    return (
      <div className="flex flex-col h-full bg-[#090D16] p-6 items-center justify-center text-center">
        <p className="text-sm text-slate-400 mb-4">Verhandlung nicht gefunden.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(neg.id, inputText.trim());
    setInputText('');
  };

  const handleConfirm = () => {
    confirmTradeStep(neg.id);
    setToastMessage(`Tausch vollzogen! Schicht ${neg.shift.flightNumber} ist in deinem Dienstplan.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const initials = neg.colleagueName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const depDate = new Date(neg.shift.departureTime);
  const shiftDateFormatted = format(depDate, 'EEE, dd. MMM yyyy', { locale: de });

  return (
    <div className="flex flex-col h-full bg-[#090D16] relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-[#0F172A] border-b border-slate-800/80 px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Zurück zur Übersicht"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-500/30 shrink-0">
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white leading-tight truncate">
              {neg.colleagueName}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              {neg.colleagueRole} • Base {neg.colleagueBase}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={neg.status} />
        </div>
      </header>

      {/* Shift Information Ribbon */}
      <div className="bg-[#131D31] border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white">
            {neg.shift.flightNumber} ({neg.shift.departureIata} → {neg.shift.arrivalIata})
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">{shiftDateFormatted}</span>
      </div>

      {/* 3-Step Negotiation Progress Tracker */}
      <TradeProgressBar status={neg.status} />

      {/* WhatsApp Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {neg.messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="max-w-xs sm:max-w-md px-3 py-1.5 rounded-full bg-[#1E293B] border border-slate-700/60 text-slate-400 text-[11px] text-center font-medium shadow-xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          const isMe = msg.isMe;
          let timeFormatted = '';
          try {
            timeFormatted = format(new Date(msg.timestamp), 'HH:mm');
          } catch {
            // fallback
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[82%] sm:max-w-[70%] px-3.5 py-2.5 shadow-md ${
                  isMe
                    ? 'bg-[#005C4B] text-white rounded-2xl rounded-tr-xs'
                    : 'bg-[#1F2C34] text-white rounded-2xl rounded-tl-xs'
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-slate-400">{timeFormatted}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* "Tausch ist durch?" Agreement Banner */}
      {neg.status !== 'completed' ? (
        <div className="mx-3.5 mb-2 p-3.5 bg-[#0F172A] border border-sky-500/30 rounded-xl shadow-lg shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="w-4 h-4 text-sky-400 shrink-0" />
            <h4 className="text-xs font-bold text-white">Tausch-Vereinbarung abschließen</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-3">
            Seid ihr euch einig? Wenn du bestätigst, wird der Tausch vollzogen und die Schicht
            automatisch in deinen Dienstplan übernommen.
          </p>
          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Tausch ist durch? Jetzt bestätigen</span>
          </button>
        </div>
      ) : (
        <div className="mx-3.5 mb-2 px-3.5 py-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-300">
            Tausch erfolgreich abgeschlossen! Schicht im Dienstplan aktualisiert.
          </span>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-[#0F172A] border-t border-slate-800/80 p-2.5 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nachricht eingeben..."
          className="flex-1 px-4 py-2 bg-[#1E293B] border border-slate-700/80 rounded-full text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-9 h-9 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-sky-600/30 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
