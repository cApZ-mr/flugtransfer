export type ShiftType = 'FLIGHT' | 'STANDBY' | 'SIMULATOR' | 'OFF' | 'GROUND_TRAINING';

export type ShiftStatus = 
  | 'ACTIVE' 
  | 'LISTED_FOR_SWAP' 
  | 'LISTED_FOR_GIVEAWAY' 
  | 'SWAP_PENDING' 
  | 'SWAPPED';

export type AircraftType = 'A320neo' | 'A321neo' | 'A330-900neo' | 'A350-900' | 'B787-9' | 'B737-800' | 'B757-300';

export interface RosterShift {
  id: string;
  userId: string;
  type: ShiftType;
  flightNumber?: string;
  origin?: string;
  originCity?: string;
  destination?: string;
  destinationCity?: string;
  returnFlightNumber?: string;
  date: string;
  startTime: string;
  endTime: string;
  reportTime?: string;
  debriefTime?: string;
  blockHours?: string;
  dutyHours?: string;
  aircraft?: AircraftType;
  isLayover?: boolean;
  layoverCity?: string;
  layoverHotel?: string;
  layoverDurationHours?: number;
  crewRole?: 'C' | 'FO' | 'PU1' | 'CA';
  notes?: string;
  status: ShiftStatus;
  iCalUid?: string;
}

export interface UserCrewProfile {
  id: string;
  name: string;
  email: string;
  airline?: string;
  role: 'Kapitän' | 'First Officer' | 'Purser 1' | 'Flugbegleiter';
  base: 'FRA' | 'MUC' | 'DUS' | 'BER' | 'HAM' | 'ZRH' | 'VIE';
  aircraftRating: string[];
  employeeNumber: string;
  avatarUrl: string;
  phone?: string;
  isOnline?: boolean;
}

export type ListingType = 'GIVEAWAY' | 'SWAP'; // "Abgeben" vs "Tauschen"

// Exactly the 3 requested states: "Offen", "In Verhandlung" oder "Abgegeben"
export type TradeNegotiationStatus = 'Offen' | 'In Verhandlung' | 'Abgegeben';

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole: string;
  sellerBase: string;
  sellerAvatar: string;
  sellerAirline?: string;
  shift: RosterShift;
  listingType: ListingType;
  wishDescription: string;
  notes?: string;
  createdAt: string;
  status: TradeNegotiationStatus; // 'Offen' | 'In Verhandlung' | 'Abgegeben'
  urgency: 'NORMAL' | 'URGENT';
  viewsCount: number;
  inquiriesCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystemAction?: boolean;
  isRead?: boolean;
}

export interface SwapNegotiation {
  id: string;
  listingId: string;
  shiftOfferedId?: string;
  shiftRequested: RosterShift;
  shiftOffered?: RosterShift;
  partyAId: string;
  partyAName: string;
  partyBId: string;
  partyBName: string;
  partyAConfirmed: boolean;
  partyBConfirmed: boolean;
  status: TradeNegotiationStatus; // 'Offen' | 'In Verhandlung' | 'Abgegeben'
  messages: ChatMessage[];
  lastUpdated: string;
  unreadCountPartyA: number;
  unreadCountPartyB: number;
}
