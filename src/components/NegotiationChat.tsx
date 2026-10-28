import React, { useState, useEffect, useRef } from 'react';
import { useRoster } from '../context/RosterContext';
import { getTradeStatusMetadata } from '../utils/statusNormalizer';
import { 
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  CheckCheck,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ShieldCheck,
  Plane,
  MessageSquare,
  BellRing,
  ArrowLeftRight,
  User,
  Info,
  FileCode
} from 'lucide-react';

interface NegotiationChatProps {
  onNavigateToCalendar: () => void;
  onOpenDartCode?: (file?: string) => void;
}

export const NegotiationChat: React.FC<NegotiationChatProps> = ({ 
  onNavigateToCalendar,
  onOpenDartCode
}) => {
  const { 
    currentUser, 
    allUsers, 
    negotiations, 
    activeNegotiation, 
    activeNegotiationId,
    setActiveNegotiationId, 
    sendMessage, 
    confirmSwapDeal, 
    simulateIncomingChat 
  } = useRoster();

  const [inputMessage, setInputMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoDropdown, setShowInfoDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeNegotiation?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeNegotiation) return;
    sendMessage(activeNegotiation.id, inputMessage);
    setInputMessage('');
  };

  const handleConfirmDeal = () => {
    if (!activeNegotiation) return;
    const res = confirmSwapDeal(activeNegotiation.id);
    if (res.success) {
      setShowConfirmModal(false);
    }
  };

  // Filter negotiations for current logged in user
  const userNegotiations = negotiations.filter(
    n => n.partyAId === currentUser.id || n.partyBId === currentUser.id
  );

  const filteredNegotiations = userNegotiations.filter((neg) => {
    if (!chatSearch.trim()) return true;
    const q = chatSearch.toLowerCase();
    const otherPartyName = currentUser.id === neg.partyAId ? neg.partyBName : neg.partyAName;
    const flight = neg.shiftRequested.flightNumber?.toLowerCase() || '';
    const origin = neg.shiftRequested.origin?.toLowerCase() || '';
    const dest = neg.shiftRequested.destination?.toLowerCase() || '';
    return otherPartyName.toLowerCase().includes(q) || flight.includes(q) || origin.includes(q) || dest.includes(q);
  });

  const activeStatusMeta = activeNegotiation 
    ? getTradeStatusMetadata(activeNegotiation.status) 
    : getTradeStatusMetadata('Offen');

  const otherPartyName = activeNegotiation 
    ? (currentUser.id === activeNegotiation.partyAId ? activeNegotiation.partyBName : activeNegotiation.partyAName)
    : '';
  const otherParty = allUsers.find(u => u.name === otherPartyName);

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED CHAT ROOM PAGE (When a chat is selected)
  // WhatsApp Style Dedicated Page with Back Button, Status Bar & Bubbles
  // -------------------------------------------------------------
  if (activeNegotiation) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] min-h-[580px] max-h-[760px] flex flex-col bg-[#0B141A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* WHATSAPP TOP APP BAR */}
        <div className="bg-[#1F2C34] border-b border-slate-800 px-3 py-2.5 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            {/* WhatsApp Back Button (Returns to WhatsApp Chats List Page) */}
            <button
              onClick={() => setActiveNegotiationId(null)}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors flex items-center"
              title="Zurück zur Chat-Übersicht"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Colleague Avatar */}
            <div className="relative shrink-0">
              <img
                src={otherParty?.avatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'}
                alt={otherPartyName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 border-2 border-[#1F2C34]" />
            </div>

            {/* Colleague Name & Subtitle */}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
                <span>{otherPartyName}</span>
                {otherParty?.airline && (
                  <span className="text-[10px] text-sky-400 font-mono font-normal hidden sm:inline">
                    · {otherParty.airline}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-emerald-400 truncate flex items-center gap-1 font-mono">
                <span>online</span>
                <span className="text-slate-400 font-sans hidden sm:inline">· Base {otherParty?.base || 'FRA'}</span>
              </p>
            </div>
          </div>

          {/* Action Icons (Video, Phone, Info, Dart UI) */}
          <div className="flex items-center gap-1 text-slate-300">
            {onOpenDartCode && (
              <button
                onClick={() => onOpenDartCode('chat_room_screen.dart')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 text-xs font-semibold transition-colors mr-1"
                title="Dart-Code für diesen WhatsApp-Chat-Screen anzeigen"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Dart UI</span>
              </button>
            )}
            <button 
              onClick={() => setShowInfoDropdown(!showInfoDropdown)}
              className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-sky-400"
              title="Schicht-Details ein-/ausblenden"
            >
              <Info className="w-4 h-4" />
            </button>
            <button 
              onClick={() => simulateIncomingChat()}
              className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
              title="Antwort simulieren"
            >
              <BellRing className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PINNED SCHICHT & VERHANDLUNGS-STATUS HEADER (Avionics WhatsApp Ribbon) */}
        <div className="bg-[#111B21] border-b border-slate-800/90 p-3 shrink-0 space-y-2 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
              <span className="text-sky-400 font-bold flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                <span>{activeNegotiation.shiftRequested.flightNumber || 'Schicht'}</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                ({activeNegotiation.shiftRequested.origin} ➔ {activeNegotiation.shiftRequested.destination})
              </span>
              {activeNegotiation.shiftOffered ? (
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  ⇄ {activeNegotiation.shiftOffered.flightNumber}
                </span>
              ) : (
                <span className="text-emerald-400 text-[10px] hidden sm:inline">(Abgabe)</span>
              )}
            </div>

            {/* LIVE VERHANDLUNGSSTATUS BADGE (Offen | In Verhandlung | Abgegeben) */}
            <div className="shrink-0">
              <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${activeStatusMeta.color}`}>
                {activeNegotiation.status === 'Abgegeben' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>Status: {activeNegotiation.status}</span>
              </span>
            </div>
          </div>

          {/* 3-Step Progress Bar: Offen -> In Verhandlung -> Abgegeben */}
          <div className="w-full bg-[#080E14] p-2 rounded-xl border border-slate-850 space-y-1.5 font-mono text-[9px] uppercase">
            <div className="flex items-center justify-between text-slate-400">
              <span className={activeStatusMeta.step >= 1 ? 'text-sky-400 font-bold' : ''}>1. Offen</span>
              <span className={activeStatusMeta.step >= 2 ? 'text-amber-400 font-bold' : ''}>2. In Verhandlung</span>
              <span className={activeStatusMeta.step >= 3 ? 'text-emerald-400 font-bold' : ''}>3. Abgegeben</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${activeStatusMeta.progress}%` }}
              />
            </div>
          </div>

          {/* "TAUSCH IST DURCH?" HERO CALL-TO-ACTION */}
          {activeNegotiation.status !== 'Abgegeben' ? (
            <div className="bg-[#182631] border border-sky-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">Seid ihr euch einig? Ist der Tausch durch?</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Ein Klick synchronisiert die Dienstpläne in beiden Kalendern.
                </div>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shrink-0 shadow-md flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tausch ist durch!</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 flex items-center justify-between gap-2 text-xs text-emerald-400 font-mono">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Tausch vollzogen. Dienstplan wurde aktualisiert!</span>
              </div>
              <button
                onClick={onNavigateToCalendar}
                className="font-bold underline text-xs shrink-0 hover:text-emerald-300"
              >
                Im Kalender ansehen ➔
              </button>
            </div>
          )}
        </div>

        {/* WHATSAPP MESSAGE STREAM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B141A] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:20px_20px]">
          
          {/* Centered Date Pill */}
          <div className="flex justify-center my-1">
            <span className="px-3 py-1 rounded-lg bg-[#182229] border border-slate-800 text-[10px] text-slate-400 font-mono shadow-sm">
              HEUTE
            </span>
          </div>

          {activeNegotiation.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            if (msg.isSystemAction) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-md bg-[#182229]/90 border border-sky-500/20 text-sky-200 text-xs px-3.5 py-1.5 rounded-xl text-center shadow-sm font-mono flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs relative shadow-md ${
                    isMe
                      ? 'bg-[#005C4B] text-white rounded-tr-none'
                      : 'bg-[#202C33] text-white rounded-tl-none'
                  }`}
                >
                  {!isMe && (
                    <div className="text-[10px] font-bold text-sky-400 mb-0.5">
                      {msg.senderName}
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-300 font-mono">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-300 inline" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK REPLY PILLS */}
        {activeNegotiation.status !== 'Abgegeben' && (
          <div className="px-3 py-1.5 bg-[#1F2C34] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            <button
              onClick={() => sendMessage(activeNegotiation.id, 'Passt mir ideal! Lass uns den Tausch bestätigen.')}
              className="px-2.5 py-1 bg-[#111B21] hover:bg-slate-700 text-slate-300 hover:text-white rounded-full whitespace-nowrap border border-slate-700 transition-colors shrink-0"
            >
              Passt mir ideal!
            </button>
            <button
              onClick={() => sendMessage(activeNegotiation.id, 'Habe die Schichtzeiten im Kalender gecheckt, alles frei.')}
              className="px-2.5 py-1 bg-[#111B21] hover:bg-slate-700 text-slate-300 hover:text-white rounded-full whitespace-nowrap border border-slate-700 transition-colors shrink-0"
            >
              Zeiten im Plan gecheckt
            </button>
            <button
              onClick={() => sendMessage(activeNegotiation.id, 'Perfekt, ich klicke jetzt auf "Tausch ist durch".')}
              className="px-2.5 py-1 bg-[#111B21] hover:bg-slate-700 text-slate-300 hover:text-white rounded-full whitespace-nowrap border border-slate-700 transition-colors shrink-0"
            >
              Klicke auf Bestätigen
            </button>
          </div>
        )}

        {/* WHATSAPP INPUT BAR */}
        <form onSubmit={handleSend} className="p-2.5 bg-[#1F2C34] border-t border-slate-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full"
            title="Anhang"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={
              activeNegotiation.status === 'Abgegeben'
                ? 'Tausch vollzogen. Schicht ist abgegeben...'
                : 'Nachricht schreiben...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-[#2A3942] border-none rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-slate-950 transition-colors shadow-sm shrink-0"
            title="Senden"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* CONFIRMATION MODAL: "TAUSCH IST DURCH?" */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-[#182229] border border-sky-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-400 text-slate-950 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Tausch verbindlich abschließen
                  </h3>
                  <p className="text-xs text-slate-400">Automatische Kalender-Synchronisation</p>
                </div>
              </div>

              <div className="bg-[#111B21] p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <p className="text-white font-semibold font-sans">
                  Folgende Kalender-Änderungen werden durchgeführt:
                </p>
                <div className="space-y-1.5 text-slate-400 pt-1 border-t border-slate-800">
                  <div className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">➔</span>
                    <span><strong>{activeNegotiation.shiftRequested.flightNumber || 'Schicht'}</strong> wird in den Kalender von {activeNegotiation.partyBName} eingetragen.</span>
                  </div>
                  {activeNegotiation.shiftOffered ? (
                    <div className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">➔</span>
                      <span><strong>{activeNegotiation.shiftOffered.flightNumber}</strong> wird an {activeNegotiation.partyAName} übertragen.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">➔</span>
                      <span>Schichtübernahme (Abgabe) ist abgeschlossen.</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">➔</span>
                    <span>Status wechselt sofort verbindlich auf <strong>Abgegeben</strong>.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmDeal}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all shadow-md shadow-sky-500/20"
                >
                  Ja, Tausch jetzt durchführen!
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: WHATSAPP CHATS LIST PAGE (When no active chat is open)
  // Full-width Chat Directory just like WhatsApp
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-24 md:pb-8">
      
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080E1C] via-[#050811] to-[#03060C] border border-sky-500/20 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                Crew WhatsApp Messenger
              </span>
              <span className="text-xs text-slate-500 font-mono">Dienstplan-Verhandlungen</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              Chats ({userNegotiations.length})
            </h1>
          </div>

          {/* Test Action */}
          <button
            onClick={simulateIncomingChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold transition-colors shadow-sm"
            title="Simuliert eine neue Chat-Nachricht von einem Kollegen"
          >
            <BellRing className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>+ Test-Chat von Kollege</span>
          </button>
        </div>

        {/* WhatsApp-Style Search Input */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Chat suchen oder nach Flugnummer filtern..."
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            className="w-full bg-[#04070F] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>
      </div>

      {/* WHATSAPP CHAT LIST CONTAINER */}
      <div className="bg-[#080E1C] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-850">
        {filteredNegotiations.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3 p-4">
            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-white">Keine Unterhaltungen vorhanden</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              Klicke in der Börse auf ein Schichtangebot, um einen Chat zu starten, oder klicke oben auf "+ Test-Chat von Kollege".
            </p>
          </div>
        ) : (
          filteredNegotiations.map((neg) => {
            const isPartyA = currentUser.id === neg.partyAId;
            const otherName = isPartyA ? neg.partyBName : neg.partyAName;
            const colleague = allUsers.find(u => u.name === otherName);
            const lastMsg = neg.messages[neg.messages.length - 1];
            const unreadCount = isPartyA ? neg.unreadCountPartyA : neg.unreadCountPartyB;
            const statusMeta = getTradeStatusMetadata(neg.status);

            return (
              <button
                key={neg.id}
                onClick={() => setActiveNegotiationId(neg.id)}
                className="w-full p-4 flex items-center gap-3.5 text-left hover:bg-[#0D1527] active:bg-[#0F192E] transition-colors group"
              >
                {/* Colleague Avatar with Online Badge */}
                <div className="relative shrink-0">
                  <img
                    src={colleague?.avatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'}
                    alt={otherName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                  />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-slate-950" />
                </div>

                {/* Chat Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        {otherName}
                      </span>
                      {colleague?.role && (
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                          ({colleague.role})
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {neg.lastUpdated}
                    </span>
                  </div>

                  {/* Flight Reference Tag */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono font-semibold text-sky-400 flex items-center gap-1">
                      <Plane className="w-3 h-3 text-sky-400" />
                      <span>{neg.shiftRequested.flightNumber || 'Schicht'}</span>
                      <span className="text-slate-500 font-sans">({neg.shiftRequested.origin} ➔ {neg.shiftRequested.destination})</span>
                    </span>

                    {/* Status Badge: Offen | In Verhandlung | Abgegeben */}
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusMeta.color}`}>
                      {neg.status}
                    </span>
                  </div>

                  {/* Snippet & Unread Counter */}
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                      {lastMsg?.senderId === currentUser.id && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline shrink-0" />
                      )}
                      <span className="truncate">{lastMsg?.text || 'Chat eröffnet...'}</span>
                    </p>

                    {unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
};
