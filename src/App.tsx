import React, { useState } from 'react';
import { RosterProvider, useRoster } from './context/RosterContext';
import { FlugtransferHeader } from './components/FlugtransferHeader';
import { CalendarView } from './components/CalendarView';
import { MarketplaceView } from './components/MarketplaceView';
import { NegotiationChat } from './components/NegotiationChat';
import { SettingsView } from './components/SettingsView';
import { IcalImportModal } from './components/IcalImportModal';
import { CreateListingModal } from './components/CreateListingModal';
import { DartArchitectureView } from './components/DartArchitectureView';
import { 
  Calendar as CalendarIcon, 
  ArrowLeftRight, 
  MessageSquare, 
  CheckCircle2, 
  Smartphone, 
  Plane,
  Settings as SettingsIcon,
  FileCode
} from 'lucide-react';

function MainApp() {
  const { 
    currentUser, 
    toastMessage, 
    negotiations, 
    startOrOpenNegotiation, 
    activeNegotiationId,
  } = useRoster();

  const [currentTab, setCurrentTab] = useState<'calendar' | 'marketplace' | 'negotiations' | 'settings' | 'ical' | 'dart'>('calendar');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [preselectedShiftId, setPreselectedShiftId] = useState<string | undefined>(undefined);

  const unreadChatCount = negotiations.reduce((acc, n) => {
    if (n.partyAId === currentUser.id) return acc + (n.unreadCountPartyA || 0);
    if (n.partyBId === currentUser.id) return acc + (n.unreadCountPartyB || 0);
    return acc;
  }, 0);

  const handleOpenCreateListing = (shiftId?: string) => {
    setPreselectedShiftId(shiftId);
    setIsCreateListingModalOpen(true);
  };

  const handleOpenNegotiationChat = (listingId: string, offeredShiftId?: string) => {
    startOrOpenNegotiation(listingId, offeredShiftId);
    setCurrentTab('negotiations');
  };

  const [selectedDartFile, setSelectedDartFile] = useState<string | undefined>(undefined);

  const handleOpenDartCode = (fileName?: string) => {
    setSelectedDartFile(fileName);
    setCurrentTab('dart');
  };

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'calendar':
        return (
          <CalendarView
            onOpenCreateListing={handleOpenCreateListing}
            onOpenIcalModal={() => setIsIcalModalOpen(true)}
            onOpenMarketplace={() => setCurrentTab('marketplace')}
            onOpenDartCode={handleOpenDartCode}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceView
            onOpenCreateListing={handleOpenCreateListing}
            onOpenNegotiationChat={handleOpenNegotiationChat}
            onOpenDartCode={handleOpenDartCode}
          />
        );
      case 'negotiations':
        return (
          <NegotiationChat
            onNavigateToCalendar={() => setCurrentTab('calendar')}
            onOpenDartCode={handleOpenDartCode}
          />
        );
      case 'settings':
      case 'ical':
        return (
          <SettingsView
            onOpenIcalModal={() => setIsIcalModalOpen(true)}
            onNavigateToCalendar={() => setCurrentTab('calendar')}
          />
        );
      case 'dart':
        return <DartArchitectureView initialFile={selectedDartFile} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#0D121F] border border-sky-500/40 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Minimalist Flugtransfer Header */}
      <FlugtransferHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileDeviceFrame={isMobileDeviceFrame}
        setIsMobileDeviceFrame={setIsMobileDeviceFrame}
        onOpenIcalModal={() => setIsIcalModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        
        {isMobileDeviceFrame ? (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-center mb-3">
              <span className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Flugtransfer Mobile Vorschau (Flutter / iOS Ergonomie)</span>
              </span>
            </div>

            {/* Smartphone Mockup */}
            <div className="w-full max-w-[400px] h-[820px] bg-[#0A0E17] rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-slate-850">
              
              {/* Dynamic Island */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full z-30" />

              {/* Minimal App Bar inside Phone */}
              <div className="pt-6 pb-2.5 px-3 bg-[#0D121F] border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                    <Plane className="w-3 h-3 -rotate-45" />
                  </div>
                  <span className="font-bold text-xs text-white">Flugtransfer</span>
                </div>
                <div className="text-[10px] text-sky-400 font-mono">
                  {currentUser.role.split(' ')[0]} · {currentUser.base}
                </div>
              </div>

              {/* Scrollable Screen Body */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
                {renderActiveTabContent()}
              </div>

              {/* Mobile Bottom Navigation Bar inside Phone Frame */}
              <div className="h-14 bg-[#090D16] border-t border-slate-800 grid grid-cols-4 items-center shrink-0 px-1 rounded-b-[36px]">
                <button
                  onClick={() => setCurrentTab('calendar')}
                  className={`flex flex-col items-center justify-center py-1 transition-colors ${
                    currentTab === 'calendar' ? 'text-sky-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Dienstplan</span>
                </button>

                <button
                  onClick={() => setCurrentTab('marketplace')}
                  className={`flex flex-col items-center justify-center py-1 transition-colors ${
                    currentTab === 'marketplace' ? 'text-sky-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Börse</span>
                </button>

                <button
                  onClick={() => setCurrentTab('negotiations')}
                  className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                    currentTab === 'negotiations' ? 'text-sky-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Chats</span>
                  {unreadChatCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-bold flex items-center justify-center font-mono absolute top-1 right-5">
                      {unreadChatCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`flex flex-col items-center justify-center py-1 transition-colors ${
                    currentTab === 'settings' ? 'text-sky-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Einstellungen</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div>{renderActiveTabContent()}</div>
        )}

      </main>

      {/* Real Mobile Bottom Navigation Bar (Shown on small screens < md when browsing on phone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-16 px-1 pb-safe">
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
            currentTab === 'calendar' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Dienstplan</span>
        </button>

        <button
          onClick={() => setCurrentTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
            currentTab === 'marketplace' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Börse</span>
        </button>

        <button
          onClick={() => setCurrentTab('negotiations')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative active:scale-95 ${
            currentTab === 'negotiations' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Chats</span>
          {unreadChatCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono absolute top-1 right-3">
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
            currentTab === 'settings' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Optionen</span>
        </button>

        <button
          onClick={() => setCurrentTab('dart')}
          className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
            currentTab === 'dart' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileCode className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] mt-0.5 font-medium">Dart UI</span>
        </button>
      </nav>

      {/* Modals */}
      <IcalImportModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        onImportSuccess={() => setCurrentTab('calendar')}
      />

      <CreateListingModal
        isOpen={isCreateListingModalOpen}
        preselectedShiftId={preselectedShiftId}
        onClose={() => setIsCreateListingModalOpen(false)}
        onSuccess={() => setCurrentTab('marketplace')}
      />

    </div>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <MainApp />
    </RosterProvider>
  );
}
