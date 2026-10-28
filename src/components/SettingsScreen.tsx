import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import {
  Link as LinkIcon,
  RefreshCw,
  Trash2,
  FlaskConical,
  Save,
  CheckCircle2,
  Download,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const SettingsScreen: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    importIcalFeed,
    importIcalString,
    clearMyShifts,
    loadSampleShifts,
    isLoading,
    feedbackMessage,
    exportRosterAsICal,
  } = useRoster();

  const [name, setName] = useState(userProfile.name);
  const [staffNumber, setStaffNumber] = useState(userProfile.staffNumber);
  const [base, setBase] = useState(userProfile.base);
  const [role, setRole] = useState(userProfile.role);
  const [email, setEmail] = useState(userProfile.email);
  const [icalUrl, setIcalUrl] = useState(userProfile.icalFeedUrl || '');

  const [rawIcalText, setRawIcalText] = useState('');
  const [showRawImporter, setShowRawImporter] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      staffNumber: staffNumber.trim(),
      base: base.trim().toUpperCase(),
      role: role.trim(),
      email: email.trim(),
    });
    showToast('Profil erfolgreich gespeichert!');
  };

  const handleSyncIcal = async () => {
    if (!icalUrl.trim()) return;
    await importIcalFeed(icalUrl.trim());
    showToast('iCal Synchronisation abgeschlossen!');
  };

  const handleImportRawText = () => {
    if (!rawIcalText.trim()) return;
    importIcalString(rawIcalText);
    setRawIcalText('');
    setShowRawImporter(false);
    showToast('iCal Daten importiert!');
  };

  const initials = userProfile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="flex flex-col h-full bg-[#090D16] overflow-y-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AppBar */}
      <header className="bg-[#0F172A] border-b border-slate-800/80 px-4 py-3 shrink-0">
        <h1 className="text-base font-bold text-white">Einstellungen & Profil</h1>
      </header>

      <div className="p-4 space-y-5 max-w-xl mx-auto w-full">
        {/* Single Account Header Card */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/20">
          <div className="w-14 h-14 rounded-full bg-sky-500/20 text-sky-400 font-black text-xl flex items-center justify-center border border-sky-500/30 shrink-0">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white leading-tight truncate">
              {userProfile.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {userProfile.role} • Personalnr. {userProfile.staffNumber}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold text-[11px] border border-slate-700/60">
                Basis {userProfile.base}
              </span>
              <span className="text-[11px] text-slate-500">{userProfile.email}</span>
            </div>
          </div>
        </div>

        {/* Apple iCal Link Section */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Apple iCal Dienstplan-Link
          </h3>
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-lg shadow-black/20 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Füge deinen Kalenderlink (<code className="text-sky-300">webcal://</code> oder{' '}
              <code className="text-sky-300">https://</code>) aus deiner Crew-Portal-Software oder
              dem Apple Kalender ein:
            </p>

            <div className="relative">
              <LinkIcon className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="webcal://example.com/crew/roster.ics"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleSyncIcal}
                disabled={isLoading || !icalUrl.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLoading ? 'Synchronisiere...' : 'Dienstplan jetzt synchronisieren'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowRawImporter(!showRawImporter)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>.ics Text einfügen</span>
              </button>
            </div>

            {/* Expandable Raw .ics text importer */}
            {showRawImporter && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Direkter .ics Datei-Inhalt (Paste):
                </label>
                <textarea
                  rows={4}
                  value={rawIcalText}
                  onChange={(e) => setRawIcalText(e.target.value)}
                  placeholder="BEGIN:VCALENDAR&#10;BEGIN:VEVENT&#10;SUMMARY:FT 240 FRA-PMI&#10;..."
                  className="w-full p-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
                <button
                  type="button"
                  onClick={handleImportRawText}
                  disabled={!rawIcalText.trim()}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sky-400 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  Text parsen & Dienstplan aktualisieren
                </button>
              </div>
            )}

            {userProfile.lastSync && (
              <div className="text-[11px] text-slate-500 pt-1">
                Letzter Sync:{' '}
                {format(new Date(userProfile.lastSync), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
              </div>
            )}

            {feedbackMessage && (
              <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dienstplan testen & verwalten */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Dienstplan testen & verwalten
          </h3>
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-lg shadow-black/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  clearMyShifts();
                  showToast('Dienstplan wurde geleert.');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dienstplan leeren</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadSampleShifts();
                  showToast('Muster-Dienstplan wurde geladen.');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-sky-400 font-bold text-xs transition-colors cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Muster laden</span>
              </button>
            </div>

            <button
              type="button"
              onClick={exportRosterAsICal}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Dienstplan als iCalendar (.ics) exportieren</span>
            </button>
          </div>
        </div>

        {/* Profil bearbeiten */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Profil bearbeiten
          </h3>
          <form
            onSubmit={handleSaveProfile}
            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-lg shadow-black/20 space-y-3.5"
          >
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Personalnummer
                </label>
                <input
                  type="text"
                  value={staffNumber}
                  onChange={(e) => setStaffNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Basis (IATA)
                </label>
                <input
                  type="text"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs uppercase focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Crew-Rolle
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="First Officer, Captain, Purser..."
                  className="w-full px-3.5 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Profil speichern</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
