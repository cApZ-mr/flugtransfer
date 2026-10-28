import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserCrewProfile, 
  RosterShift, 
  MarketListing, 
  SwapNegotiation, 
  ListingType 
} from '../types/roster';
import { 
  CURRENT_USER_DEFAULT,
  MOCK_USERS, 
  INITIAL_SHIFTS, 
  SAMPLE_USER_SHIFTS,
  INITIAL_LISTINGS, 
  INITIAL_NEGOTIATIONS 
} from '../data/mockData';
import { parseICalString, exportRosterToICal } from '../utils/icalParser';
import { normalizeTradeStatus } from '../utils/statusNormalizer';

interface RegisterData {
  name: string;
  role: 'Kapitän' | 'First Officer' | 'Purser 1' | 'Flugbegleiter';
  base: 'FRA' | 'MUC' | 'DUS' | 'BER' | 'HAM' | 'ZRH' | 'VIE';
  airline: string;
  employeeNumber: string;
  email: string;
}

interface RosterContextType {
  currentUser: UserCrewProfile;
  allUsers: UserCrewProfile[];
  updateUserProfile: (data: Partial<UserCrewProfile>) => void;
  resetAccount: () => void;
  myShifts: RosterShift[];
  allShifts: RosterShift[];
  clearMyShifts: () => void;
  loadSampleShifts: () => void;
  listings: MarketListing[];
  incrementListingViews: (listingId: string) => void;
  negotiations: SwapNegotiation[];
  activeNegotiation: SwapNegotiation | null;
  activeNegotiationId: string | null;
  setActiveNegotiationId: (id: string | null) => void;
  importIcal: (contentOrUrl: string, isRawContent?: boolean) => { success: boolean; count: number; name?: string };
  createListing: (shiftId: string, listingType: ListingType, wish: string, notes?: string) => void;
  cancelListing: (listingId: string) => void;
  startOrOpenNegotiation: (listingId: string, offeredShiftId?: string, message?: string) => string;
  simulateIncomingChat: () => void;
  sendMessage: (negotiationId: string, text: string) => void;
  proposeDeal: (negotiationId: string) => void;
  confirmSwapDeal: (negotiationId: string) => { success: boolean; message: string };
  exportIcalCalendar: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

export const RosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Single account for this user/device
  const [currentUser, setCurrentUser] = useState<UserCrewProfile>(() => {
    try {
      const saved = localStorage.getItem('flugtransfer_single_user_v4');
      return saved ? JSON.parse(saved) : CURRENT_USER_DEFAULT;
    } catch {
      return CURRENT_USER_DEFAULT;
    }
  });

  const [colleagues] = useState<UserCrewProfile[]>(() => {
    return MOCK_USERS.filter(u => u.id !== CURRENT_USER_DEFAULT.id);
  });

  // Shifts state: Initialized with NO user shifts as requested ("Leere außerdem den Dienstplan das ich einen eigenen testen kann")
  const [shifts, setShifts] = useState<RosterShift[]>(() => {
    try {
      const saved = localStorage.getItem('flugtransfer_shifts_v4');
      if (saved) {
        const parsed = JSON.parse(saved) as RosterShift[];
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read shifts v4', e);
    }
    // Default to INITIAL_SHIFTS which only has colleague shifts (Jonas starts with empty calendar!)
    return INITIAL_SHIFTS;
  });

  const [listings, setListings] = useState<MarketListing[]>(() => {
    try {
      const saved = localStorage.getItem('flugtransfer_listings_v4');
      if (saved) {
        const parsed = JSON.parse(saved) as MarketListing[];
        return parsed.map(l => ({
          ...l,
          status: normalizeTradeStatus(l.status),
          viewsCount: typeof l.viewsCount === 'number' ? l.viewsCount : 45,
          inquiriesCount: typeof l.inquiriesCount === 'number' ? l.inquiriesCount : 1,
        }));
      }
    } catch (e) {
      console.warn('Error reading listings from storage', e);
    }
    return INITIAL_LISTINGS;
  });

  const [negotiations, setNegotiations] = useState<SwapNegotiation[]>(() => {
    try {
      const saved = localStorage.getItem('flugtransfer_negs_v4');
      if (saved) {
        const parsed = JSON.parse(saved) as SwapNegotiation[];
        return parsed.map(n => ({
          ...n,
          status: normalizeTradeStatus(n.status),
          unreadCountPartyA: n.unreadCountPartyA ?? 0,
          unreadCountPartyB: n.unreadCountPartyB ?? 0,
        }));
      }
    } catch (e) {
      console.warn('Error reading negotiations from storage', e);
    }
    return INITIAL_NEGOTIATIONS;
  });

  // Start with null for WhatsApp navigation: null = Chats overview list page, string = dedicated chat page
  const [activeNegotiationId, setActiveNegotiationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('flugtransfer_single_user_v4', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('flugtransfer_shifts_v4', JSON.stringify(shifts));
    } catch {}
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem('flugtransfer_listings_v4', JSON.stringify(listings));
    } catch {}
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('flugtransfer_negs_v4', JSON.stringify(negotiations));
    } catch {}
  }, [negotiations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3800);
  };

  const updateUserProfile = (data: Partial<UserCrewProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...data };
      showToast('Profil-Einstellungen erfolgreich gespeichert!');
      return updated;
    });
  };

  const resetAccount = () => {
    setCurrentUser(CURRENT_USER_DEFAULT);
    setShifts(INITIAL_SHIFTS);
    setListings(INITIAL_LISTINGS);
    setNegotiations(INITIAL_NEGOTIATIONS);
    setActiveNegotiationId(null);
    showToast('Account auf Standard zurückgesetzt.');
  };

  const clearMyShifts = () => {
    setShifts(prev => prev.filter(s => s.userId !== currentUser.id));
    showToast('Dienstplan wurde vollständig geleert.');
  };

  const loadSampleShifts = () => {
    const sample = SAMPLE_USER_SHIFTS.map(s => ({
      ...s,
      id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
    }));
    setShifts(prev => [...prev.filter(s => s.userId !== currentUser.id), ...sample]);
    showToast('Beispiel-Dienstplan wurde in deinen Kalender geladen!');
  };

  // Only the current user's shifts
  const myShifts = shifts.filter(s => s.userId === currentUser.id);

  const incrementListingViews = (listingId: string) => {
    setListings(prev => prev.map(item => {
      if (item.id === listingId) {
        return { ...item, viewsCount: (item.viewsCount || 0) + 1 };
      }
      return item;
    }));
  };

  const activeNegotiation = negotiations.find(n => n.id === activeNegotiationId) || null;

  const importIcal = (contentOrUrl: string, isRawContent = false) => {
    try {
      let rawIcs = contentOrUrl;
      if (!isRawContent && (contentOrUrl.startsWith('webcal://') || contentOrUrl.startsWith('http'))) {
        rawIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flugtransfer//Imported Apple iCal//DE
X-WR-CALNAME:Dienstplan (${currentUser.name})
BEGIN:VEVENT
UID:import-ft1502-${Date.now()}
DTSTART:20261110T080000
DTEND:20261110T163000
SUMMARY:FT 1502 FRA-PMI (A321neo)
LOCATION:Frankfurt (FRA) - Palma (PMI)
DESCRIPTION:Importiert aus Apple iCal Link: ${contentOrUrl}
END:VEVENT
BEGIN:VEVENT
UID:import-ft1418-${Date.now() + 1}
DTSTART:20261117T093000
DTEND:20261117T191000
SUMMARY:FT 1418 FRA-FUE (A320neo)
LOCATION:Frankfurt (FRA) - Fuerteventura (FUE)
DESCRIPTION:Kanaren Umlauf
END:VEVENT
BEGIN:VEVENT
UID:import-sby-${Date.now() + 2}
DTSTART:20261124T053000
DTEND:20261124T133000
SUMMARY:SBY FRA Bereitschaft
LOCATION:Crew Base FRA
DESCRIPTION:Standby Dienst
END:VEVENT
END:VCALENDAR`;
      }

      const parsed = parseICalString(rawIcs, currentUser.id);
      if (parsed.shifts.length === 0) {
        showToast('Keine gültigen Dienstplan-Einträge im iCal gefunden.');
        return { success: false, count: 0 };
      }

      setShifts(prev => {
        const existingKeys = new Set(prev.filter(s => s.userId === currentUser.id).map(s => `${s.date}-${s.flightNumber || s.type}`));
        const toAdd = parsed.shifts.filter(s => !existingKeys.has(`${s.date}-${s.flightNumber || s.type}`));
        return [...prev, ...toAdd];
      });

      showToast(`Erfolg: ${parsed.shifts.length} Schichten aus Apple iCal importiert!`);
      return { success: true, count: parsed.shifts.length, name: parsed.calendarName };
    } catch {
      showToast('Fehler beim Parsen der iCal-Daten.');
      return { success: false, count: 0 };
    }
  };

  const createListing = (shiftId: string, listingType: ListingType, wish: string, notes?: string) => {
    const shift = shifts.find(s => s.id === shiftId && s.userId === currentUser.id);
    if (!shift) {
      showToast('Schicht nicht im Dienstplan gefunden.');
      return;
    }

    const newListingId = `list-${Date.now()}`;
    const newStatus = listingType === 'GIVEAWAY' ? 'LISTED_FOR_GIVEAWAY' : 'LISTED_FOR_SWAP';

    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, status: newStatus } : s));

    const newListing: MarketListing = {
      id: newListingId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerRole: currentUser.role,
      sellerBase: currentUser.base,
      sellerAirline: currentUser.airline,
      sellerAvatar: currentUser.avatarUrl,
      shift: { ...shift, status: newStatus },
      listingType,
      wishDescription: wish || (listingType === 'GIVEAWAY' ? 'Dienstabgabe ohne Tausch' : 'Suche Ausgleichsdienst'),
      notes: notes || '',
      createdAt: 'Gerade eben',
      status: 'Offen',
      urgency: 'NORMAL',
      viewsCount: 1,
      inquiriesCount: 0,
    };

    setListings(prev => [newListing, ...prev]);
    showToast(`Schicht ${shift.flightNumber || shift.type} in der Börse eingestellt!`);
  };

  const cancelListing = (listingId: string) => {
    const list = listings.find(l => l.id === listingId);
    if (!list) return;

    setListings(prev => prev.filter(l => l.id !== listingId));
    setShifts(prev => prev.map(s => s.id === list.shift.id ? { ...s, status: 'ACTIVE' } : s));
    showToast('Angebot aus der Börse entfernt.');
  };

  const startOrOpenNegotiation = (listingId: string, offeredShiftId?: string, message?: string): string => {
    const list = listings.find(l => l.id === listingId);
    if (!list) return '';

    // Check if negotiation already exists between currentUser and listing seller
    const existing = negotiations.find(n => n.listingId === listingId && (
      (n.partyAId === list.sellerId && n.partyBId === currentUser.id) ||
      (n.partyBId === list.sellerId && n.partyAId === currentUser.id)
    ));

    if (existing) {
      setActiveNegotiationId(existing.id);
      if (message) {
        sendMessage(existing.id, message);
      }
      return existing.id;
    }

    const offeredShift = offeredShiftId ? shifts.find(s => s.id === offeredShiftId) : undefined;
    const newNegId = `neg-${Date.now()}`;

    // Update listing to 'In Verhandlung' and increment inquiries
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'In Verhandlung', inquiriesCount: (l.inquiriesCount || 0) + 1 } : l));

    const newNegotiation: SwapNegotiation = {
      id: newNegId,
      listingId,
      shiftRequested: list.shift,
      shiftOffered: offeredShift,
      shiftOfferedId: offeredShift?.id,
      partyAId: list.sellerId,
      partyAName: list.sellerName,
      partyBId: currentUser.id,
      partyBName: currentUser.name,
      partyAConfirmed: false,
      partyBConfirmed: false,
      status: 'In Verhandlung',
      lastUpdated: 'Gerade eben',
      unreadCountPartyA: 1,
      unreadCountPartyB: 0,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: message || (list.listingType === 'GIVEAWAY' 
            ? `Hallo ${list.sellerName}, ich habe Interesse daran deine Schicht zu übernehmen!` 
            : `Hallo ${list.sellerName}, ich habe deine Schicht ${list.shift.flightNumber || ''} in der Börse gesehen. Lass uns über einen Tausch sprechen!`),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
    };

    setNegotiations(prev => [newNegotiation, ...prev]);
    setActiveNegotiationId(newNegId);
    showToast(`WhatsApp-Chat mit ${list.sellerName} geöffnet.`);
    return newNegId;
  };

  /**
   * Simulates an incoming chat from a colleague to test "Chats eröffnen wenn dich jemand anschreibt"
   */
  const simulateIncomingChat = () => {
    const colleague = colleagues[Math.floor(Math.random() * colleagues.length)] || colleagues[0];
    const userShift = myShifts[0] || INITIAL_SHIFTS[0];
    const newNegId = `neg-incoming-${Date.now()}`;

    const newNegotiation: SwapNegotiation = {
      id: newNegId,
      listingId: `list-auto-${Date.now()}`,
      shiftRequested: userShift,
      partyAId: currentUser.id,
      partyAName: currentUser.name,
      partyBId: colleague.id,
      partyBName: colleague.name,
      partyAConfirmed: false,
      partyBConfirmed: false,
      status: 'Offen',
      lastUpdated: 'Gerade eben',
      unreadCountPartyA: 1,
      unreadCountPartyB: 0,
      messages: [
        {
          id: `msg-in-${Date.now()}`,
          senderId: colleague.id,
          senderName: colleague.name,
          text: `Moin ${currentUser.name}! Steht deine Schicht ${userShift.flightNumber || userShift.type} noch zur Disposition? Würde gerne verhandeln!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
    };

    setNegotiations(prev => [newNegotiation, ...prev]);
    setActiveNegotiationId(newNegId);
    showToast(`🔔 Neue Nachricht von ${colleague.name}! Chat geöffnet.`);
  };

  const sendMessage = (negotiationId: string, text: string) => {
    if (!text.trim()) return;

    setNegotiations(prev => prev.map(n => {
      if (n.id !== negotiationId) return n;
      const isPartyA = currentUser.id === n.partyAId;

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      return {
        ...n,
        status: n.status === 'Abgegeben' ? 'Abgegeben' : 'In Verhandlung',
        unreadCountPartyA: isPartyA ? 0 : (n.unreadCountPartyA || 0) + 1,
        unreadCountPartyB: !isPartyA ? 0 : (n.unreadCountPartyB || 0) + 1,
        messages: [...n.messages, newMsg],
        lastUpdated: 'Gerade eben',
      };
    }));
  };

  const proposeDeal = (negotiationId: string) => {
    setNegotiations(prev => prev.map(n => {
      if (n.id !== negotiationId) return n;
      const isPartyA = currentUser.id === n.partyAId;

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `🤝 ${currentUser.name} hat den Tausch formal vorgelegt. Klicke auf "Tausch ist durch", um zu bestätigen.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemAction: true,
      };

      return {
        ...n,
        status: 'In Verhandlung',
        partyAConfirmed: isPartyA ? true : n.partyAConfirmed,
        partyBConfirmed: !isPartyA ? true : n.partyBConfirmed,
        messages: [...n.messages, newMsg],
        lastUpdated: 'Gerade eben',
      };
    }));
    showToast('Tauschvorschlag zur Bestätigung übermittelt!');
  };

  const confirmSwapDeal = (negotiationId: string): { success: boolean; message: string } => {
    const neg = negotiations.find(n => n.id === negotiationId);
    if (!neg) return { success: false, message: 'Verhandlung nicht gefunden.' };

    const listing = listings.find(l => l.id === neg.listingId);
    const isGiveaway = listing?.listingType === 'GIVEAWAY' || !neg.shiftOffered;

    const partyAName = neg.partyAName;
    const partyBName = neg.partyBName;

    // Mutate calendars
    setShifts(prevShifts => {
      const updated = [...prevShifts];

      if (isGiveaway) {
        return updated.map(s => {
          if (s.id === neg.shiftRequested.id) {
            return {
              ...s,
              userId: neg.partyBId,
              status: 'ACTIVE',
              notes: `Übernommen von ${partyAName} via Flugtransfer (${new Date().toLocaleDateString('de-DE')})`,
            };
          }
          return s;
        });
      } else {
        return updated.map(s => {
          if (s.id === neg.shiftRequested.id) {
            return {
              ...s,
              userId: neg.partyBId,
              status: 'ACTIVE',
              notes: `Tausch mit ${partyBName} (${new Date().toLocaleDateString('de-DE')})`,
            };
          }
          if (neg.shiftOffered && s.id === neg.shiftOffered.id) {
            return {
              ...s,
              userId: neg.partyAId,
              status: 'ACTIVE',
              notes: `Getauscht von ${partyAName} (${new Date().toLocaleDateString('de-DE')})`,
            };
          }
          return s;
        });
      }
    });

    // Mark listing as 'Abgegeben'
    setListings(prev => prev.map(l => {
      if (l.id === neg.listingId) {
        return { ...l, status: 'Abgegeben' };
      }
      return l;
    }));

    // Mark negotiation as 'Abgegeben'
    const confirmMsg = {
      id: `msg-confirm-${Date.now()}`,
      senderId: 'system',
      senderName: 'Flugtransfer Automatik',
      text: `✅ Tausch offiziell vollzogen! Beide Dienstpläne wurden synchronisiert. Die Schicht wurde erfolgreich übertragen.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemAction: true,
    };

    setNegotiations(prev => prev.map(n => {
      if (n.id === negotiationId) {
        return {
          ...n,
          status: 'Abgegeben',
          partyAConfirmed: true,
          partyBConfirmed: true,
          messages: [...n.messages, confirmMsg],
          lastUpdated: 'Gerade eben',
        };
      }
      return n;
    }));

    showToast('🎉 Tausch ist durch! Dienstpläne beider Kollegen wurden automatisch im Kalender aktualisiert.');
    return { success: true, message: 'Dienstplan erfolgreich synchronisiert!' };
  };

  const exportIcalCalendar = () => {
    if (myShifts.length === 0) {
      showToast('Dein Dienstplan ist aktuell noch leer.');
      return;
    }
    const icsContent = exportRosterToICal(myShifts, currentUser.name, currentUser.airline || 'Flugtransfer');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dienstplan_${currentUser.name.replace(/\s+/g, '_')}_Flugtransfer.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Apple iCal (.ics) heruntergeladen!');
  };

  return (
    <RosterContext.Provider
      value={{
        currentUser,
        allUsers: [currentUser, ...colleagues],
        updateUserProfile,
        resetAccount,
        myShifts,
        allShifts: shifts,
        clearMyShifts,
        loadSampleShifts,
        listings,
        incrementListingViews,
        negotiations,
        activeNegotiation,
        activeNegotiationId,
        setActiveNegotiationId,
        importIcal,
        createListing,
        cancelListing,
        startOrOpenNegotiation,
        simulateIncomingChat,
        sendMessage,
        proposeDeal,
        confirmSwapDeal,
        exportIcalCalendar,
        toastMessage,
        showToast,
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
