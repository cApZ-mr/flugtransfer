import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  RosterShift,
  MarketListing,
  SwapNegotiation,
  ChatMessage,
  ListingType,
  TradeStatus,
} from '../types';
import { ICalService } from '../services/icalService';

interface RosterContextType {
  userProfile: UserProfile;
  myShifts: RosterShift[];
  marketplaceListings: MarketListing[];
  negotiations: SwapNegotiation[];
  activeChatId: string | null;
  activeNegotiation: SwapNegotiation | null;
  isLoading: boolean;
  feedbackMessage: string | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearMyShifts: () => void;
  loadSampleShifts: () => void;
  importIcalFeed: (url: string) => Promise<void>;
  importIcalString: (content: string) => void;
  postShiftToMarketplace: (
    shift: RosterShift,
    type: ListingType,
    desiredRouteOrDate?: string,
    notes?: string
  ) => void;
  selectChat: (chatId: string | null) => void;
  openChatForListing: (listing: MarketListing) => string;
  sendMessage: (negotiationId: string, text: string) => void;
  confirmTradeStep: (negotiationId: string) => void;
  exportRosterAsICal: () => void;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  id: 'user-jonas',
  name: 'Jonas Weber',
  staffNumber: 'CF-88421',
  base: 'FRA',
  role: 'First Officer',
  email: 'j.weber@flugtransfer.de',
};

export const RosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('flugtransfer_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }
    return INITIAL_PROFILE;
  });

  // Personal shifts: starts empty as in Flutter app to test iCal link
  const [myShifts, setMyShifts] = useState<RosterShift[]>(() => {
    const saved = localStorage.getItem('flugtransfer_my_shifts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }
    return [];
  });

  const [marketplaceListings, setMarketplaceListings] = useState<MarketListing[]>(() => {
    const saved = localStorage.getItem('flugtransfer_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }

    const now = new Date();
    const addDays = (d: number, h: number = 0, m: number = 0) => {
      const dt = new Date(now.getTime() + (d * 24 + h) * 3600000 + m * 60000);
      return dt.toISOString();
    };
    const subHours = (h: number) => {
      return new Date(now.getTime() - h * 3600000).toISOString();
    };

    return [
      {
        id: 'list-101',
        shift: {
          id: 'shift-m-1',
          flightNumber: 'FT 1422',
          departureIata: 'FRA',
          arrivalIata: 'PMI',
          departureTime: addDays(2, 6),
          arrivalTime: addDays(2, 10, 30),
          type: 'flight',
          aircraftType: 'A321neo',
          blockHours: 4.5,
          notes: 'Mallorca Umlauf, pünktlicher Feierabend',
          dutyRole: 'First Officer',
          isTradeable: true,
        },
        colleagueId: 'col-sarah',
        colleagueName: 'Sarah Lindner',
        colleagueRole: 'First Officer',
        colleagueBase: 'FRA',
        type: 'swap',
        desiredRouteOrDate: 'Suche Kanaren oder späteres Datum',
        notes: 'Muss zur Familienfeier am Wochenende',
        status: 'inNegotiation',
        viewsCount: 142,
        inquiriesCount: 3,
        createdAt: subHours(14),
      },
      {
        id: 'list-102',
        shift: {
          id: 'shift-m-2',
          flightNumber: 'FT 480',
          departureIata: 'FRA',
          arrivalIata: 'HER',
          departureTime: addDays(4, 7),
          arrivalTime: addDays(4, 12),
          type: 'flight',
          aircraftType: 'A330-900neo',
          blockHours: 5.0,
          notes: 'Kreta Heraklion Tagestörn',
          dutyRole: 'Captain',
          isTradeable: true,
        },
        colleagueId: 'col-markus',
        colleagueName: 'Markus Becker',
        colleagueRole: 'Captain',
        colleagueBase: 'FRA',
        type: 'giveaway',
        desiredRouteOrDate: undefined,
        notes: 'Arzttermin am Vormittag, gerne abzugeben',
        status: 'open',
        viewsCount: 89,
        inquiriesCount: 1,
        createdAt: subHours(24),
      },
      {
        id: 'list-103',
        shift: {
          id: 'shift-m-3',
          flightNumber: 'FT 2104',
          departureIata: 'MUC',
          arrivalIata: 'LPA',
          departureTime: addDays(5, 8),
          arrivalTime: addDays(5, 14),
          type: 'flight',
          aircraftType: 'A321neo',
          blockHours: 6.0,
          notes: 'Gran Canaria Return',
          dutyRole: 'Purser',
          isTradeable: true,
        },
        colleagueId: 'col-elena',
        colleagueName: 'Elena Rost',
        colleagueRole: 'Purser',
        colleagueBase: 'MUC',
        type: 'swap',
        desiredRouteOrDate: 'Gegen Flug ab FRA oder MUC am Fr/Sa',
        notes: 'Möchte gerne Schicht tauschen',
        status: 'open',
        viewsCount: 215,
        inquiriesCount: 4,
        createdAt: subHours(28),
      },
      {
        id: 'list-104',
        shift: {
          id: 'shift-m-4',
          flightNumber: 'FT 612',
          departureIata: 'DUS',
          arrivalIata: 'FUE',
          departureTime: addDays(7, 9),
          arrivalTime: addDays(7, 15),
          type: 'flight',
          aircraftType: 'A320',
          blockHours: 6.0,
          dutyRole: 'Cabin Crew',
          isTradeable: true,
        },
        colleagueId: 'col-tim',
        colleagueName: 'Tim Bergmann',
        colleagueRole: 'Cabin Crew',
        colleagueBase: 'DUS',
        type: 'giveaway',
        status: 'completed',
        viewsCount: 310,
        inquiriesCount: 6,
        createdAt: subHours(72),
      },
    ];
  });

  const [negotiations, setNegotiations] = useState<SwapNegotiation[]>(() => {
    const saved = localStorage.getItem('flugtransfer_negotiations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }

    const now = new Date();
    const subMin = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

    const sarahShift: RosterShift = {
      id: 'shift-m-1',
      flightNumber: 'FT 1422',
      departureIata: 'FRA',
      arrivalIata: 'PMI',
      departureTime: new Date(now.getTime() + (2 * 24 + 6) * 3600000).toISOString(),
      arrivalTime: new Date(now.getTime() + (2 * 24 + 10.5) * 3600000).toISOString(),
      type: 'flight',
      aircraftType: 'A321neo',
      blockHours: 4.5,
      notes: 'Mallorca Umlauf, pünktlicher Feierabend',
      dutyRole: 'First Officer',
      isTradeable: true,
    };

    return [
      {
        id: 'neg-list-101',
        listingId: 'list-101',
        colleagueId: 'col-sarah',
        colleagueName: 'Sarah Lindner',
        colleagueRole: 'First Officer',
        colleagueBase: 'FRA',
        shift: sarahShift,
        status: 'inNegotiation',
        ownerAgreed: false,
        colleagueAgreed: true,
        lastUpdated: subMin(8),
        messages: [
          {
            id: 'm1',
            senderId: 'system',
            senderName: 'Flugtransfer System',
            text: 'Verhandlung für FT 1422 (FRA -> PMI) eröffnet.',
            timestamp: subMin(30),
            isMe: false,
            isSystem: true,
          },
          {
            id: 'm2',
            senderId: 'col-sarah',
            senderName: 'Sarah Lindner',
            text: 'Hi Jonas! Passt dir der Flug am übernächsten Tag? Ich bräuchte dringend frei.',
            timestamp: subMin(25),
            isMe: false,
          },
          {
            id: 'm3',
            senderId: 'user-jonas',
            senderName: 'Jonas Weber',
            text: 'Hey Sarah, klingt gut für mich! Ich übernehme den Umlauf gerne.',
            timestamp: subMin(15),
            isMe: true,
          },
          {
            id: 'm4',
            senderId: 'col-sarah',
            senderName: 'Sarah Lindner',
            text: 'Super! Ich habe den Tausch bereits auf meiner Seite bestätigt. Klickst du bitte auch auf "Tausch abschließen"?',
            timestamp: subMin(8),
            isMe: false,
          },
        ],
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('flugtransfer_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('flugtransfer_my_shifts', JSON.stringify(myShifts));
  }, [myShifts]);

  useEffect(() => {
    localStorage.setItem('flugtransfer_listings', JSON.stringify(marketplaceListings));
  }, [marketplaceListings]);

  useEffect(() => {
    localStorage.setItem('flugtransfer_negotiations', JSON.stringify(negotiations));
  }, [negotiations]);

  const activeNegotiation = activeChatId
    ? negotiations.find((n) => n.id === activeChatId) || null
    : null;

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const clearMyShifts = () => {
    setMyShifts([]);
    setFeedbackMessage('Dienstplan wurde geleert.');
  };

  const loadSampleShifts = () => {
    const now = new Date();
    const addDays = (d: number, h: number = 0, m: number = 0) => {
      return new Date(now.getTime() + (d * 24 + h) * 3600000 + m * 60000).toISOString();
    };

    const samples: RosterShift[] = [
      {
        id: 'sample-1',
        flightNumber: 'FT 240',
        departureIata: 'FRA',
        arrivalIata: 'PMI',
        departureTime: addDays(1, 5),
        arrivalTime: addDays(1, 9, 30),
        type: 'flight',
        aircraftType: 'A321neo',
        blockHours: 4.5,
        notes: 'Pünktlicher Tagesumlauf Mallorca',
        dutyRole: userProfile.role,
        isTradeable: true,
      },
      {
        id: 'sample-2',
        flightNumber: 'STANDBY FRA',
        departureIata: 'FRA',
        arrivalIata: 'FRA',
        departureTime: addDays(3, 8),
        arrivalTime: addDays(3, 16),
        type: 'standby',
        blockHours: 8.0,
        notes: 'Airport Standby Bereitschaft Terminal 1',
        dutyRole: userProfile.role,
        isTradeable: true,
      },
      {
        id: 'sample-3',
        flightNumber: 'FT 710',
        departureIata: 'FRA',
        arrivalIata: 'CUN',
        departureTime: addDays(6, 10),
        arrivalTime: addDays(6, 21),
        type: 'flight',
        aircraftType: 'A330-900neo',
        blockHours: 11.0,
        notes: 'Cancun Langstrecke mit 48h Layover',
        dutyRole: userProfile.role,
        isTradeable: true,
      },
    ];

    setMyShifts(samples);
    setFeedbackMessage('Muster-Dienstplan erfolgreich geladen.');
  };

  const importIcalFeed = async (url: string) => {
    setIsLoading(true);
    setFeedbackMessage(null);

    try {
      const icalString = await ICalService.fetchIcalFeed(url);
      const shifts = ICalService.parseICal(icalString, userProfile.role);
      setMyShifts(shifts);
      setUserProfile((prev) => ({
        ...prev,
        icalFeedUrl: url,
        lastSync: new Date().toISOString(),
      }));
      setFeedbackMessage(`${shifts.length} Schichten erfolgreich importiert!`);
    } catch (e) {
      setFeedbackMessage(`Fehler beim Laden des iCal Links: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const importIcalString = (content: string) => {
    try {
      const shifts = ICalService.parseICal(content, userProfile.role);
      setMyShifts(shifts);
      setUserProfile((prev) => ({ ...prev, lastSync: new Date().toISOString() }));
      setFeedbackMessage(`${shifts.length} Schichten aus Text importiert.`);
    } catch (e) {
      setFeedbackMessage(`Ungültiges iCalendar-Format: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const postShiftToMarketplace = (
    shift: RosterShift,
    type: ListingType,
    desiredRouteOrDate?: string,
    notes?: string
  ) => {
    const newListing: MarketListing = {
      id: `listing-${Date.now()}`,
      shift,
      colleagueId: userProfile.id,
      colleagueName: userProfile.name,
      colleagueRole: userProfile.role,
      colleagueBase: userProfile.base,
      type,
      desiredRouteOrDate,
      notes,
      status: 'open',
      viewsCount: 1,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      isOwner: true,
    };

    setMarketplaceListings((prev) => [newListing, ...prev]);
    setFeedbackMessage('Schicht erfolgreich in die Flugtransfer-Börse eingestellt!');
  };

  const selectChat = (chatId: string | null) => {
    setActiveChatId(chatId);
  };

  const openChatForListing = (listing: MarketListing): string => {
    // Increment view / inquiries count & mark inNegotiation if open
    setMarketplaceListings((prev) =>
      prev.map((l) =>
        l.id === listing.id
          ? {
              ...l,
              viewsCount: l.viewsCount + 1,
              inquiriesCount: l.inquiriesCount + 1,
              status: l.status === 'open' ? 'inNegotiation' : l.status,
            }
          : l
      )
    );

    // Check if negotiation already exists
    const existing = negotiations.find((n) => n.listingId === listing.id);
    if (existing) {
      setActiveChatId(existing.id);
      return existing.id;
    }

    const now = new Date();
    const newNeg: SwapNegotiation = {
      id: `neg-${listing.id}`,
      listingId: listing.id,
      colleagueId: listing.colleagueId,
      colleagueName: listing.colleagueName,
      colleagueRole: listing.colleagueRole,
      colleagueBase: listing.colleagueBase,
      shift: listing.shift,
      status: 'inNegotiation',
      ownerAgreed: false,
      colleagueAgreed: false,
      lastUpdated: now.toISOString(),
      messages: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'Flugtransfer System',
          text: `Verhandlung für ${listing.shift.flightNumber} (${listing.shift.departureIata} -> ${listing.shift.arrivalIata}) gestartet.`,
          timestamp: now.toISOString(),
          isMe: false,
          isSystem: true,
        },
        {
          id: `col-${Date.now() + 1}`,
          senderId: listing.colleagueId,
          senderName: listing.colleagueName,
          text: `Hallo ${userProfile.name}! Schön, dass du dich für meine Schicht interessierst. Wäre ${
            listing.type === 'swap' ? 'ein Tausch für dich machbar?' : 'eine Übernahme für dich in Ordnung?'
          }`,
          timestamp: new Date(now.getTime() + 1000).toISOString(),
          isMe: false,
        },
      ],
    };

    setNegotiations((prev) => [newNeg, ...prev]);
    setActiveChatId(newNeg.id);
    return newNeg.id;
  };

  const sendMessage = (negotiationId: string, text: string) => {
    if (!text.trim()) return;

    const myMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userProfile.id,
      senderName: userProfile.name,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isMe: true,
    };

    setNegotiations((prev) =>
      prev.map((neg) =>
        neg.id === negotiationId
          ? {
              ...neg,
              messages: [...neg.messages, myMessage],
              lastUpdated: new Date().toISOString(),
              status: neg.status === 'open' ? 'inNegotiation' : neg.status,
            }
          : neg
      )
    );

    // Auto-reply simulation from colleague after 1.2s
    setTimeout(() => {
      setNegotiations((prev) => {
        const target = prev.find((n) => n.id === negotiationId);
        if (!target) return prev;

        const replies = [
          'Perfekt! Das passt super für mich. Wenn du einverstanden bist, klicke unten auf "Tausch ist durch".',
          'Klasse! Ich gebe dir Bescheid sobald die Crew-Einsatzplanung das abgenickt hat.',
          'Wunderbar, vielen Dank für die schnelle Rückmeldung!',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const colMessage: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: target.colleagueId,
          senderName: target.colleagueName,
          text: randomReply,
          timestamp: new Date().toISOString(),
          isMe: false,
        };

        return prev.map((n) =>
          n.id === negotiationId
            ? {
                ...n,
                messages: [...n.messages, colMessage],
                colleagueAgreed: true,
                lastUpdated: new Date().toISOString(),
              }
            : n
        );
      });
    }, 1200);
  };

  const confirmTradeStep = (negotiationId: string) => {
    const target = negotiations.find((n) => n.id === negotiationId);
    if (!target) return;

    const now = new Date();
    const confirmationMsg: ChatMessage = {
      id: `conf-${Date.now()}`,
      senderId: 'system',
      senderName: 'Flugtransfer System',
      text: `Tausch offiziell bestätigt! Die Schicht ${target.shift.flightNumber} wurde automatisch in deinen Dienstplan eingetragen.`,
      timestamp: now.toISOString(),
      isMe: false,
      isSystem: true,
    };

    setNegotiations((prev) =>
      prev.map((n) =>
        n.id === negotiationId
          ? {
              ...n,
              ownerAgreed: true,
              colleagueAgreed: true,
              status: 'completed',
              lastUpdated: now.toISOString(),
              messages: [...n.messages, confirmationMsg],
            }
          : n
      )
    );

    // Update the corresponding market listing status to 'completed'
    setMarketplaceListings((prev) =>
      prev.map((l) => (l.id === target.listingId ? { ...l, status: 'completed' } : l))
    );

    // AUTOMATIC ROSTER UPDATE: Add the acquired shift into user's roster
    setMyShifts((prev) => {
      const alreadyInRoster = prev.some(
        (s) => s.id === target.shift.id || s.flightNumber === target.shift.flightNumber
      );
      if (alreadyInRoster) return prev;
      const updated = [...prev, target.shift];
      updated.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
      return updated;
    });

    setFeedbackMessage(
      `Tausch vollzogen! Schicht ${target.shift.flightNumber} ist jetzt in deinem Dienstplan.`
    );
  };

  const exportRosterAsICal = () => {
    const icsContent = ICalService.exportToICal(myShifts, `${userProfile.name} Dienstplan`);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Flugtransfer_Dienstplan_${userProfile.staffNumber}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMessage('iCalendar (.ics) Datei wurde heruntergeladen.');
  };

  return (
    <RosterContext.Provider
      value={{
        userProfile,
        myShifts,
        marketplaceListings,
        negotiations,
        activeChatId,
        activeNegotiation,
        isLoading,
        feedbackMessage,
        updateUserProfile,
        clearMyShifts,
        loadSampleShifts,
        importIcalFeed,
        importIcalString,
        postShiftToMarketplace,
        selectChat,
        openChatForListing,
        sendMessage,
        confirmTradeStep,
        exportRosterAsICal,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
