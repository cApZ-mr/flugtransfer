import React from 'react';
import { useRoster } from '../context/RosterContext';
import { 
  Calendar, 
  ArrowLeftRight, 
  MessageSquare, 
  Download, 
  Smartphone, 
  Monitor, 
  Plane,
  Settings,
  CalendarPlus,
  FileCode
} from 'lucide-react';

interface FlugtransferHeaderProps {
  currentTab: 'calendar' | 'marketplace' | 'negotiations' | 'settings' | 'ical' | 'dart';
  setCurrentTab: (tab: 'calendar' | 'marketplace' | 'negotiations' | 'settings' | 'ical' | 'dart') => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean) => void;
  onOpenIcalModal: () => void;
}

export const FlugtransferHeader: React.FC<FlugtransferHeaderProps> = ({
  currentTab,
  setCurrentTab,
  isMobileDeviceFrame,
  setIsMobileDeviceFrame,
  onOpenIcalModal,
}) => {
  const { currentUser, negotiations, exportIcalCalendar } = useRoster();

  const unreadChatCount = negotiations.reduce((acc, n) => {
    if (n.partyAId === currentUser.id) return acc + (n.unreadCountPartyA || 0);
    if (n.partyBId === currentUser.id) return acc + (n.unreadCountPartyB || 0);
    return acc;
  }, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div 
          onClick={() => setCurrentTab('calendar')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-sky-500/10">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-white">Flugtransfer</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">Crew Börse</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              currentTab === 'calendar'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Dienstplan</span>
          </button>

          <button
            onClick={() => setCurrentTab('marketplace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              currentTab === 'marketplace'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
            <span>Börse</span>
          </button>

          <button
            onClick={() => setCurrentTab('negotiations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors relative ${
              currentTab === 'negotiations'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>WhatsApp Chats</span>
            {unreadChatCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              currentTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span>Einstellungen</span>
          </button>

          <button
            onClick={() => setCurrentTab('dart')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              currentTab === 'dart'
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Dart & Flutter UI</span>
          </button>
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2">
          
          {/* Quick Apple iCal Import Button */}
          <button
            onClick={onOpenIcalModal}
            title="Apple iCal Link einfügen"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>iCal Link</span>
          </button>

          {/* Quick .ics Export Button */}
          <button
            onClick={exportIcalCalendar}
            title="Dienstplan als Apple iCal (.ics) herunterladen"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Flutter Smartphone Viewport Toggle (Desktop Only) */}
          <button
            onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
            title={isMobileDeviceFrame ? "Zu Desktop-Ansicht wechseln" : "Smartphone-Ansicht (Flutter App) anzeigen"}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMobileDeviceFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Handy-Modus</span>
              </>
            )}
          </button>

          {/* Single Account Profile Pill -> Takes directly to Settings */}
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border text-left transition-all ${
              currentTab === 'settings'
                ? 'bg-sky-500/15 border-sky-500/40 ring-1 ring-sky-500/30'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
            }`}
            title="Zu den Account-Einstellungen"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-xl object-cover border border-slate-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-sky-400 font-mono">
                {currentUser.role.split(' ')[0]} · {currentUser.base}
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
          </button>

        </div>

      </div>
    </header>
  );
};
