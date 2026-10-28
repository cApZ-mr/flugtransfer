export type ShiftType = 'flight' | 'standby' | 'simulator' | 'off' | 'ground';

export type ListingType = 'giveaway' | 'swap';

export type TradeStatus = 'open' | 'inNegotiation' | 'completed';

export interface RosterShift {
  id: string;
  flightNumber: string; // e.g. "FT 240", "STANDBY", "OFF"
  departureIata: string; // e.g. "FRA"
  arrivalIata: string; // e.g. "PMI"
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  type: ShiftType;
  aircraftType?: string; // e.g. "A330-900neo", "A321neo"
  blockHours?: number;
  notes?: string;
  dutyRole: string; // "Captain", "First Officer", "Purser", "Cabin Crew"
  isTradeable: boolean;
}

export interface MarketListing {
  id: string;
  shift: RosterShift;
  colleagueId: string;
  colleagueName: string;
  colleagueRole: string;
  colleagueBase: string;
  type: ListingType;
  desiredRouteOrDate?: string;
  notes?: string;
  status: TradeStatus;
  viewsCount: number;
  inquiriesCount: number;
  createdAt: string;
  isOwner?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string; // ISO string
  isMe: boolean;
  isSystem?: boolean;
}

export interface SwapNegotiation {
  id: string;
  listingId: string;
  colleagueId: string;
  colleagueName: string;
  colleagueRole: string;
  colleagueBase: string;
  shift: RosterShift;
  offeredShift?: RosterShift;
  status: TradeStatus;
  ownerAgreed: boolean;
  colleagueAgreed: boolean;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  name: string;
  staffNumber: string;
  base: string;
  role: string;
  email: string;
  icalFeedUrl?: string;
  lastSync?: string;
}
