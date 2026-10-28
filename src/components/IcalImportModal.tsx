import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { SAMPLE_CONDOR_ICAL_FEEDS } from '../utils/icalParser';
import { 
  CalendarPlus, 
  Link2, 
  Upload, 
  HelpCircle, 
  X, 
  Plane,
  Sparkles
} from 'lucide-react';

interface IcalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const IcalImportModal: React.FC<IcalImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { importIcal, currentUser } = useRoster();

  const [activeTab, setActiveTab] = useState<'URL' | 'PRESETS' | 'FILE'>('URL');
  const [icalUrl, setIcalUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!icalUrl.trim()) return;

    const res = importIcal(icalUrl.trim(), false);
    if (res.success) {
      onImportSuccess();
      onClose();
    }
  };

  const handlePresetSelect = (rawIcs: string) => {
    const res = importIcal(rawIcs, true);
    if (res.success) {
      onImportSuccess();
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        const res = importIcal(content, true);
        if (res.success) {
          onImportSuccess();
          onClose();
        }
      }
    };
    reader.readAsText(file);
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
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Dienstplan per Apple iCal einfügen
            </h3>
            <p className="text-xs text-slate-400">
              Synchronisiere deinen Dienstplan direkt mit Flugtransfer.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('URL')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'URL'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>iCal Link</span>
          </button>

          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'PRESETS'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo-Pläne (1 Klick)</span>
          </button>

          <button
            onClick={() => setActiveTab('FILE')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'FILE'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>.ics Datei</span>
          </button>
        </div>

        {activeTab === 'URL' && (
          <form onSubmit={handleUrlSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Apple Kalender / Webcal Link
              </label>
              <input
                type="text"
                placeholder="webcal://p64-caldav.icloud.com/... oder https://..."
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Unterstützt Apple Kalender-Freigabelinks, NetLine Crewlink oder AIMS Webcal-Exporte.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Wo finde ich den Apple iCal Link auf iPhone oder Mac?</span>
            </button>

            {showHelp && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-white">Apple Kalender (iOS & macOS):</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Öffne die Apple Kalender-App.</li>
                  <li>Tippe unten auf "Kalender" und klicke auf das Info-Symbol (ℹ) deines Dienstplans.</li>
                  <li>Wähle "Öffentlicher Kalender" und tippe auf "Link kopieren".</li>
                  <li>Füge den Link einfach hier ein!</li>
                </ol>
              </div>
            )}

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
                disabled={!icalUrl.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 transition-colors"
              >
                Dienstplan einlesen
              </button>
            </div>
          </form>
        )}

        {activeTab === 'PRESETS' && (
          <div className="space-y-2 text-xs">
            <p className="text-slate-400 mb-2">
              Lade mit einem Klick einen realistischen Musterdienstplan für Testzwecke:
            </p>
            {SAMPLE_CONDOR_ICAL_FEEDS.map((feed) => (
              <button
                key={feed.id}
                onClick={() => handlePresetSelect(feed.rawIcs)}
                className="w-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-3 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                      {feed.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {feed.subtitle}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-semibold text-sky-400">
                  Laden ➔
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'FILE' && (
          <div className="space-y-3.5 text-xs">
            <label className="border-2 border-dashed border-slate-800 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50">
              <Upload className="w-6 h-6 text-sky-400 mb-1.5" />
              <span className="font-semibold text-white">
                {fileName ? fileName : '.ics Datei auswählen oder hier ablegen'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Standard iCalendar Format</span>
              <input
                type="file"
                accept=".ics,text/calendar"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div>
              <label className="block text-slate-400 mb-1">Oder iCal-Text einfügen:</label>
              <textarea
                rows={3}
                placeholder="BEGIN:VCALENDAR&#10;BEGIN:VEVENT&#10;SUMMARY:FT 1404..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-850"
              >
                Schließen
              </button>
              <button
                type="button"
                disabled={!rawText.trim()}
                onClick={() => {
                  const res = importIcal(rawText, true);
                  if (res.success) {
                    onImportSuccess();
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 transition-colors"
              >
                Importieren
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
