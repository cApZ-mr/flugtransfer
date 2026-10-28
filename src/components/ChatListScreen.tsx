import React from 'react';
import { useRoster } from '../context/RosterContext';
import { SwapNegotiation } from '../types';
import { StatusBadge } from './StatusBadge';
import { MessagesSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ChatListScreenProps {
  onOpenChat: (negotiationId: string) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat }) => {
  const { negotiations, selectChat } = useRoster();

  const handleSelect = (neg: SwapNegotiation) => {
    selectChat(neg.id);
    onOpenChat(neg.id);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16]">
      {/* AppBar */}
      <header className="bg-[#0F172A] border-b border-slate-800/80 px-4 py-3 shrink-0">
        <h1 className="text-base font-bold text-white">Chats & Verhandlungen</h1>
      </header>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {negotiations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4">
              <MessagesSquare className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">Noch keine aktiven Chats</h2>
            <p className="text-xs text-slate-400">
              Klicke in der Börse auf „Verhandeln”, um einen Chat zu eröffnen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 max-w-xl mx-auto">
            {negotiations.map((neg) => {
              const lastMsg = neg.messages.length > 0 ? neg.messages[neg.messages.length - 1] : null;
              let timeStr = '';
              if (lastMsg) {
                try {
                  timeStr = format(new Date(lastMsg.timestamp), 'HH:mm');
                } catch {
                  // Fallback
                }
              }

              const initials = neg.colleagueName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={neg.id}
                  onClick={() => handleSelect(neg)}
                  className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* Colleague Avatar with online indicator */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 font-bold text-sm flex items-center justify-center border border-sky-500/30">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090D16]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-white truncate">
                        {neg.colleagueName}
                      </span>
                      <span className="text-[11px] text-slate-500 shrink-0">{timeStr}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-bold text-[10px]">
                        {neg.shift.flightNumber}
                      </span>
                      <StatusBadge status={neg.status} showDot={false} />
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-1">
                      {lastMsg ? lastMsg.text : 'Keine Nachrichten'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
