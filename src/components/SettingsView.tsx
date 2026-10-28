import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { 
  User, 
  Trash2, 
  Calendar, 
  CalendarPlus, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Bell, 
  Plane, 
  CheckCircle2, 
  Smartphone,
  Sparkles,
  Mail,
  Phone,
  Building2,
  BadgeAlert,
  FileCode,
  Terminal
} from 'lucide-react';
import { DartCodeViewerModal } from './DartCodeViewerModal';

interface SettingsViewProps {
  onOpenIcalModal: () => void;
  onNavigateToCalendar: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  onOpenIcalModal,
  onNavigateToCalendar 
}) => {
  const { 
    currentUser, 
    updateUserProfile, 
    resetAccount, 
    myShifts, 
    clearMyShifts, 
    loadSampleShifts,
    exportIcalCalendar 
  } = useRoster();

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [base, setBase] = useState(currentUser.base);
  const [airline, setAirline] = useState(currentUser.airline || 'Lufthansa Group');
  const [employeeNumber, setEmployeeNumber] = useState(currentUser.employeeNumber);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showDartModal, setShowDartModal] = useState(false);

  // Toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [whatsappSounds, setWhatsappSounds] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      role: role as any,
      base: base as any,
      airline,
      employeeNumber,
      email,
      phone,
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleConfirmClear = () => {
    clearMyShifts();
    setShowConfirmClear(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080E1C] via-[#050811] to-[#03060C] border border-sky-500/20 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                Flugtransfer Account
              </span>
              <span className="text-xs text-slate-500 font-mono">1 Persönlicher Account</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>Einstellungen & Profil</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Verwalte dein Crew-Profil, steuere deine Dienstplan-Synchronisation oder leere deinen Kalender für eigene Tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifiziertes Crew-Konto</span>
            </span>
          </div>
        </div>
      </div>

      {/* DART & FLUTTER PROJEKT-DATEIEN CARD */}
      <div className="bg-gradient-to-r from-sky-950/40 via-[#080E1C] to-cyan-950/30 border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider">
                100% Native Dart & Flutter Code
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/flutter_app</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Flugtransfer in Dart programmiert</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Alle Dateien wurden direkt als nativer Dart- und Flutter-Code erstellt (Models, Provider, WhatsApp-Chat, Kalender, iCal-Parser). Du kannst den gesamten Quellcode hier ansehen, kopieren oder herunterladen.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowDartModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <FileCode className="w-4 h-4" />
              <span>Dart-Quellcode ansehen</span>
            </button>
          </div>
        </div>
      </div>

      {/* DIENSTPLAN-VERWALTUNG (Zentrales User-Feature: "Leere außerdem den Dienstplan das ich einen eigenen testen kann") */}
      <div className="bg-[#080E1C] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dienstplan-Verwaltung & Apple iCal</h2>
              <p className="text-xs text-slate-400">Status deines persönlichen Dienstplans</p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
              myShifts.length === 0 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
            }`}>
              {myShifts.length} {myShifts.length === 1 ? 'Schicht' : 'Schichten'} aktiv
            </span>
          </div>
        </div>

        {/* Dienstplan Status Card */}
        <div className="p-4 rounded-2xl bg-[#04070F] border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{myShifts.length === 0 ? 'Dienstplan ist leer' : 'Dienstplan ist befüllt'}</span>
              {myShifts.length === 0 && (
                <span className="text-[10px] text-amber-400 font-mono font-medium">(Bereit für deinen Test!)</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              {myShifts.length === 0 
                ? 'Dein Kalender enthält aktuell keine Schichten. Du kannst jetzt deinen eigenen Dienstplan per Apple iCal Link einfügen.'
                : `Du hast ${myShifts.length} Schichten im Kalender. Du kannst sie jederzeit mit 1 Klick leeren, um eigene Daten zu testen.`
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenIcalModal}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apple iCal importieren</span>
            </button>

            {myShifts.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                title="Löscht alle Schichten aus deinem Dienstplan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dienstplan leeren</span>
              </button>
            )}

            {myShifts.length === 0 && (
              <button
                onClick={loadSampleShifts}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                title="Lädt 3 Demo-Flüge zur Demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Demo-Flüge laden</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirm Clear Modal Dialog */}
        {showConfirmClear && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-3">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 text-rose-400" />
              <span>Möchtest du deinen Dienstplan wirklich leeren?</span>
            </div>
            <p className="text-slate-300">
              Alle aktuellen Schichten deines Kalenders werden entfernt, sodass du deinen eigenen Dienstplan per Apple iCal testen kannst.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmClear}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
              >
                Ja, Dienstplan jetzt leeren
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={onNavigateToCalendar}
            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>➔ Direkt zum Kalender</span>
          </button>

          {myShifts.length > 0 && (
            <button
              onClick={exportIcalCalendar}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Dienstplan als .ics exportieren</span>
            </button>
          )}
        </div>
      </div>

      {/* MEIN CREW-PROFIL (Single Account Bearbeitung) */}
      <form onSubmit={handleSaveProfile} className="bg-[#080E1C] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mein Flugtransfer Profil</h2>
              <p className="text-xs text-slate-400">Persönliche Daten & Qualifikationen</p>
            </div>
          </div>

          {isSavedRecently && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gespeichert</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Vollständiger Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Airline */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Fluggesellschaft (Airline)</span>
            </label>
            <input
              type="text"
              required
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              placeholder="z.B. Lufthansa, Eurowings, etc."
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rolle an Bord</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="Kapitän">Kapitän (Commander)</option>
              <option value="First Officer">First Officer (Copilot)</option>
              <option value="Purser 1">Purser 1 (Kabinenchef)</option>
              <option value="Flugbegleiter">Flugbegleiter (Cabin Crew)</option>
            </select>
          </div>

          {/* Base */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Stationierungsbasis</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value as any)}
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
            >
              <option value="FRA">Frankfurt am Main (FRA)</option>
              <option value="MUC">München (MUC)</option>
              <option value="DUS">Düsseldorf (DUS)</option>
              <option value="BER">Berlin Brandenburg (BER)</option>
              <option value="HAM">Hamburg (HAM)</option>
              <option value="ZRH">Zürich (ZRH)</option>
              <option value="VIE">Wien (VIE)</option>
            </select>
          </div>

          {/* Employee Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Personalnummer / Crew-ID</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">E-Mail-Adresse</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Telefon / WhatsApp-Nummer für Crew-Rückfragen</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 171 1234567"
              className="w-full bg-[#04070F] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20"
          >
            Profil-Änderungen speichern
          </button>
        </div>
      </form>

      {/* BENACHRICHTIGUNGEN & APP-OPTIONEN */}
      <div className="bg-[#080E1C] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">App & Chat-Benachrichtigungen</h2>
            <p className="text-xs text-slate-400">Verhalten bei neuen Angeboten und Chat-Anfragen</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#04070F] border border-slate-850">
            <div>
              <div className="text-xs font-semibold text-white">Push-Benachrichtigungen für neue Chats</div>
              <div className="text-[11px] text-slate-400">Erhalte sofortige Meldungen, wenn ein Kollege dir schreibt</div>
            </div>
            <button
              type="button"
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-sky-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${pushEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#04070F] border border-slate-850">
            <div>
              <div className="text-xs font-semibold text-white">WhatsApp-Töne & haptisches Feedback</div>
              <div className="text-[11px] text-slate-400">Subtile Vibration und Töne beim Senden von Nachrichten</div>
            </div>
            <button
              type="button"
              onClick={() => setWhatsappSounds(!whatsappSounds)}
              className={`w-11 h-6 rounded-full transition-colors relative ${whatsappSounds ? 'bg-sky-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${whatsappSounds ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#04070F] border border-slate-850">
            <div>
              <div className="text-xs font-semibold text-white">Automatische Dienstplan-Synchronisation</div>
              <div className="text-[11px] text-slate-400">Aktualisiert deinen Kalender sofort, wenn "Tausch ist durch" bestätigt wird</div>
            </div>
            <button
              type="button"
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${autoSyncEnabled ? 'bg-sky-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${autoSyncEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNT ZURÜCKSETZEN */}
      <div className="bg-[#080E1C] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Account zurücksetzen</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Setzt alle Einstellungen und Demodaten auf den ursprünglichen Standardzustand zurück.
          </p>
        </div>

        <button
          onClick={resetAccount}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Auf Standard zurücksetzen</span>
        </button>
      </div>

      {/* DART CODE VIEWER MODAL */}
      <DartCodeViewerModal 
        isOpen={showDartModal} 
        onClose={() => setShowDartModal(false)} 
      />

    </div>
  );
};
