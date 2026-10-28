import React, { useState } from 'react';
import { RosterProvider, useRoster } from './context/RosterContext';
import { CalendarScreen } from './components/CalendarScreen';
import { MarketplaceScreen } from './components/MarketplaceScreen';
import { ChatListScreen } from './components/ChatListScreen';
import { ChatRoomScreen } from './components/ChatRoomScreen';
import { SettingsScreen } from './components/SettingsScreen';
import {
  Calendar as CalendarIcon,
  ArrowLeftRight,
  MessageSquare,
  Settings as SettingsIcon,
} from 'lucide-react';

function AppContent() {
  const { negotiations, activeChatId, selectChat } = useRoster();
  const [currentTab, setCurrentTab] = useState<number>(0);
  // When inside a chat room, store its id
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const activeNegotiationsCount = negotiations.length;

  const handleOpenChat = (negotiationId: string) => {
    setCurrentChatId(negotiationId);
    setCurrentTab(2); // Switch to Chat tab
  };

  const handleBackFromChat = () => {
    setCurrentChatId(null);
    selectChat(null);
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#060910] text-slate-100 font-sans">
      {/* Mobile/Tablet App Container */}
      <div className="w-full max-w-md h-screen flex flex-col bg-[#090D16] shadow-2xl relative overflow-hidden border-x border-slate-800/40">
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {/* Calendar Tab */}
          <div className={`h-full w-full ${currentTab === 0 ? 'block' : 'hidden'}`}>
            <CalendarScreen onNavigateToSettings={() => setCurrentTab(3)} />
          </div>

          {/* Marketplace Tab */}
          <div className={`h-full w-full ${currentTab === 1 ? 'block' : 'hidden'}`}>
            <MarketplaceScreen onOpenChat={handleOpenChat} />
          </div>

          {/* Chats Tab */}
          <div className={`h-full w-full ${currentTab === 2 ? 'block' : 'hidden'}`}>
            {currentChatId ? (
              <ChatRoomScreen negotiationId={currentChatId} onBack={handleBackFromChat} />
            ) : (
              <ChatListScreen onOpenChat={(id) => setCurrentChatId(id)} />
            )}
          </div>

          {/* Settings / Optionen Tab */}
          <div className={`h-full w-full ${currentTab === 3 ? 'block' : 'hidden'}`}>
            <SettingsScreen />
          </div>
        </main>

        {/* Bottom Navigation Bar (Hidden when actively inside a chat room to maximize keyboard/input space) */}
        {!currentChatId && (
          <nav className="bg-[#0F172A] border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shrink-0 z-40">
            {/* Tab 0: Dienstplan */}
            <button
              onClick={() => setCurrentTab(0)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                currentTab === 0 ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mb-1" />
              <span className="text-[11px]">Dienstplan</span>
            </button>

            {/* Tab 1: Börse */}
            <button
              onClick={() => setCurrentTab(1)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                currentTab === 1 ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 mb-1" />
              <span className="text-[11px]">Börse</span>
            </button>

            {/* Tab 2: Chats */}
            <button
              onClick={() => {
                setCurrentTab(2);
                setCurrentChatId(null);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                currentTab === 2 ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5 mb-1" />
                {activeNegotiationsCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[9px] font-bold shadow-xs">
                    {activeNegotiationsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px]">Chats</span>
            </button>

            {/* Tab 3: Optionen */}
            <button
              onClick={() => setCurrentTab(3)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                currentTab === 3 ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SettingsIcon className="w-5 h-5 mb-1" />
              <span className="text-[11px]">Optionen</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <RosterProvider>
      <AppContent />
    </RosterProvider>
  );
}

export default App;
