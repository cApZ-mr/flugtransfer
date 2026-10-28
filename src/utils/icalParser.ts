import { RosterShift, ShiftType, AircraftType } from '../types/roster';

export interface ParsedICalResult {
  shifts: RosterShift[];
  calendarName?: string;
  count: number;
}

export function parseICalString(icalContent: string, userId: string): ParsedICalResult {
  const shifts: RosterShift[] = [];
  const lines = icalContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  // Unfold multi-line iCal properties
  const unfoldedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    if ((current.startsWith(' ') || current.startsWith('\t')) && unfoldedLines.length > 0) {
      unfoldedLines[unfoldedLines.length - 1] += current.slice(1);
    } else {
      unfoldedLines.push(current);
    }
  }

  let inEvent = false;
  let currentEvent: Record<string, string> = {};
  let calName = 'Dienstplan';

  for (const rawLine of unfoldedLines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('X-WR-CALNAME:')) {
      calName = line.substring('X-WR-CALNAME:'.length).trim();
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      inEvent = false;
      const shift = convertEventToShift(currentEvent, userId);
      if (shift) {
        shifts.push(shift);
      }
      continue;
    }

    if (inEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const propKeyWithParams = line.substring(0, colonIdx);
        const propValue = line.substring(colonIdx + 1);
        const propKey = propKeyWithParams.split(';')[0].toUpperCase();
        currentEvent[propKey] = propValue;
      }
    }
  }

  return {
    shifts,
    calendarName: calName,
    count: shifts.length,
  };
}

function parseIcalDate(val?: string): { dateStr: string; timeStr: string } {
  if (!val) {
    const now = new Date();
    return {
      dateStr: now.toISOString().split('T')[0],
      timeStr: '08:00',
    };
  }

  const cleanVal = val.replace(/[^0-9T]/g, '');
  if (cleanVal.length >= 8) {
    const y = cleanVal.substring(0, 4);
    const m = cleanVal.substring(4, 6);
    const d = cleanVal.substring(6, 8);
    const dateStr = `${y}-${m}-${d}`;

    let timeStr = '08:00';
    if (cleanVal.includes('T') && cleanVal.length >= 13) {
      const tPart = cleanVal.split('T')[1];
      const hh = tPart.substring(0, 2);
      const mm = tPart.substring(2, 4);
      timeStr = `${hh}:${mm}`;
    }
    return { dateStr, timeStr };
  }

  return {
    dateStr: new Date().toISOString().split('T')[0],
    timeStr: '08:00',
  };
}

const AIRPORT_CITIES: Record<string, string> = {
  FRA: 'Frankfurt am Main',
  MUC: 'München',
  DUS: 'Düsseldorf',
  BER: 'Berlin Brandenburg',
  HAM: 'Hamburg',
  ZRH: 'Zürich',
  VIE: 'Wien',
  PMI: 'Palma de Mallorca',
  LPA: 'Gran Canaria',
  TFS: 'Teneriffa Süd',
  FUE: 'Fuerteventura',
  ACE: 'Lanzarote',
  AYT: 'Antalya',
  HRG: 'Hurghada',
  CUN: 'Cancún',
  PUJ: 'Punta Cana',
  MRU: 'Mauritius',
  SEZ: 'Seychellen',
  JFK: 'New York JFK',
  MCO: 'Orlando',
  LAX: 'Los Angeles',
  CPT: 'Kapstadt',
  HER: 'Heraklion (Kreta)',
  RHO: 'Rhodos',
  KGS: 'Kos',
  IBZ: 'Ibiza',
};

function convertEventToShift(event: Record<string, string>, userId: string): RosterShift | null {
  const summary = (event['SUMMARY'] || '').trim();
  const description = (event['DESCRIPTION'] || '').replace(/\\n/g, '\n');
  const location = (event['LOCATION'] || '').trim();
  const uid = event['UID'] || `shift-${Math.random().toString(36).substring(2, 9)}`;

  const startParsed = parseIcalDate(event['DTSTART']);
  const endParsed = parseIcalDate(event['DTEND']);

  let shiftType: ShiftType = 'FLIGHT';
  const upperSum = summary.toUpperCase();

  if (upperSum.includes('OFF') || upperSum.includes('FREI') || upperSum.includes('REST')) {
    shiftType = 'OFF';
  } else if (upperSum.includes('SBY') || upperSum.includes('STANDBY') || upperSum.includes('BEREITSCHAFT')) {
    shiftType = 'STANDBY';
  } else if (upperSum.includes('SIM') || upperSum.includes('CHECK') || upperSum.includes('SIMULATOR')) {
    shiftType = 'SIMULATOR';
  } else if (upperSum.includes('GROUND') || upperSum.includes('SCHULUNG') || upperSum.includes('TRAINING')) {
    shiftType = 'GROUND_TRAINING';
  }

  // Parse flight number e.g. "FT 1404", "LH 400", "EW 123", etc.
  let flightNumber: string | undefined = undefined;
  const flightMatch = summary.match(/\b([A-Z]{2}\s?\d{3,4})\b/i);
  if (flightMatch) {
    flightNumber = flightMatch[1].replace(/([a-zA-Z]+)(\d+)/, '$1 $2').toUpperCase();
  }

  // Parse route e.g. "FRA-PMI"
  let origin = 'FRA';
  let destination = 'PMI';
  const routeMatch = summary.match(/\b([A-Z]{3})\s*[-/✈]\s*([A-Z]{3})\b/);
  if (routeMatch) {
    origin = routeMatch[1];
    destination = routeMatch[2];
  } else if (location && location.match(/\b([A-Z]{3})\b/)) {
    const locMatch = location.match(/\b([A-Z]{3})\b/);
    if (locMatch) origin = locMatch[1];
  }

  // Aircraft detection
  let aircraft: AircraftType = 'A321neo';
  if (summary.includes('350') || description.includes('A350')) {
    aircraft = 'A350-900';
  } else if (summary.includes('330') || description.includes('A330')) {
    aircraft = 'A330-900neo';
  } else if (summary.includes('787') || description.includes('B787')) {
    aircraft = 'B787-9';
  } else if (summary.includes('737') || description.includes('B737')) {
    aircraft = 'B737-800';
  } else if (summary.includes('320') || description.includes('A320')) {
    aircraft = 'A320neo';
  }

  const isLonghaul = ['CUN', 'PUJ', 'MRU', 'SEZ', 'JFK', 'MCO', 'LAX', 'CPT'].includes(destination);

  return {
    id: uid,
    userId,
    type: shiftType,
    flightNumber: shiftType === 'FLIGHT' ? (flightNumber || 'FT 1404') : undefined,
    origin: shiftType === 'FLIGHT' ? origin : undefined,
    originCity: shiftType === 'FLIGHT' ? (AIRPORT_CITIES[origin] || origin) : undefined,
    destination: shiftType === 'FLIGHT' ? destination : undefined,
    destinationCity: shiftType === 'FLIGHT' ? (AIRPORT_CITIES[destination] || destination) : undefined,
    date: startParsed.dateStr,
    startTime: startParsed.timeStr,
    endTime: endParsed.timeStr,
    reportTime: shiftType === 'FLIGHT' ? adjustTime(startParsed.timeStr, -60) : undefined,
    debriefTime: shiftType === 'FLIGHT' ? adjustTime(endParsed.timeStr, 30) : undefined,
    blockHours: shiftType === 'FLIGHT' ? (isLonghaul ? '09:40' : '02:35') : undefined,
    dutyHours: shiftType === 'FLIGHT' ? (isLonghaul ? '11:15' : '04:05') : undefined,
    aircraft: shiftType === 'FLIGHT' ? (isLonghaul ? 'A330-900neo' : aircraft) : undefined,
    isLayover: isLonghaul,
    layoverCity: isLonghaul ? (AIRPORT_CITIES[destination] || destination) : undefined,
    layoverHotel: isLonghaul ? 'Steigenberger Resort & Spa' : undefined,
    layoverDurationHours: isLonghaul ? 48 : undefined,
    status: 'ACTIVE',
    iCalUid: uid,
    notes: description || (shiftType === 'STANDBY' ? 'Heimatbasis Bereitschaftsdienst' : undefined),
  };
}

function adjustTime(timeStr: string, minutesDelta: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const total = h * 60 + m + minutesDelta;
  const modTotal = ((total % 1440) + 1440) % 1440;
  const newH = Math.floor(modTotal / 60);
  const newM = modTotal % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function exportRosterToICal(shifts: RosterShift[], crewName: string, airline?: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flugtransfer//Crew Roster Exchange//DE',
    `X-WR-CALNAME:Flugtransfer Dienstplan - ${crewName}${airline ? ` (${airline})` : ''}`,
    'X-WR-TIMEZONE:Europe/Berlin',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const s of shifts) {
    if (s.status === 'SWAPPED') continue;
    const [y, m, d] = s.date.split('-');
    const [startH, startM] = s.startTime.split(':');
    const [endH, endM] = s.endTime.split(':');

    const dtStart = `${y}${m}${d}T${startH || '08'}${startM || '00'}00`;
    const dtEnd = `${y}${m}${d}T${endH || '16'}${endM || '00'}00`;

    let summary = '';
    if (s.type === 'FLIGHT') {
      summary = `${s.flightNumber || 'FT'} ${s.origin}-${s.destination} (${s.aircraft || 'Flug'})`;
    } else if (s.type === 'STANDBY') {
      summary = `Standby Bereitschaft (${s.origin || 'Base'})`;
    } else if (s.type === 'SIMULATOR') {
      summary = `Simulator Check Training (${s.aircraft || 'Cockpit'})`;
    } else {
      summary = `OFF - Freier Tag`;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${s.iCalUid || s.id}@flugtransfer.app`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    if (s.origin && s.destination) {
      lines.push(`LOCATION:${s.origin} / ${s.destination}`);
    }
    lines.push(`DESCRIPTION:Flugtransfer Dienstplan. Status: ${s.status}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export const SAMPLE_CONDOR_ICAL_FEEDS = [
  {
    id: 'sample-fra-longhaul',
    title: 'Langstrecke A350/A330 (FRA)',
    subtitle: 'Cancún, Punta Cana, Standby FRA',
    url: 'https://roster.flugtransfer.app/fra-longhaul.ics',
    rawIcs: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flugtransfer//Crew Roster//DE
X-WR-CALNAME:Dienstplan Jonas (FRA Langstrecke)
BEGIN:VEVENT
UID:ft2038-cun-20261102
DTSTART:20261102T104500
DTEND:20261102T223000
SUMMARY:FT 2038 FRA-CUN (A330-900neo)
LOCATION:Frankfurt am Main (FRA)
DESCRIPTION:Flug nach Cancun. Hotel: Beachfront Resort. Blockzeit: 11:45h.
END:VEVENT
BEGIN:VEVENT
UID:ft2039-cun-20261104
DTSTART:20261104T183000
DTEND:20261105T064500
SUMMARY:FT 2039 CUN-FRA (A330-900neo)
LOCATION:Cancún (CUN)
DESCRIPTION:Rückflug nach Frankfurt.
END:VEVENT
BEGIN:VEVENT
UID:sby-fra-20261108
DTSTART:20261108T060000
DTEND:20261108T140000
SUMMARY:SBY FRA Früh-Bereitschaft
LOCATION:Frankfurt Basis
DESCRIPTION:Heimatbasis Standby FRA Terminal 1
END:VEVENT
BEGIN:VEVENT
UID:ft2168-puj-20261112
DTSTART:20261112T111500
DTEND:20261112T215000
SUMMARY:FT 2168 FRA-PUJ (A350-900)
LOCATION:Punta Cana (PUJ)
DESCRIPTION:Karibik Umlauf.
END:VEVENT
BEGIN:VEVENT
UID:ft1404-pmi-20261118
DTSTART:20261118T065000
DTEND:20261118T141000
SUMMARY:FT 1404 FRA-PMI (A321neo)
LOCATION:Palma de Mallorca
DESCRIPTION:Tagesumlauf FRA-PMI-FRA
END:VEVENT
END:VCALENDAR`
  },
  {
    id: 'sample-fra-europe',
    title: 'Europa & Mittelstrecke A320/A321 (FRA)',
    subtitle: 'Palma, Gran Canaria, Hurghada, Antalya',
    url: 'https://roster.flugtransfer.app/fra-mittelstrecke.ics',
    rawIcs: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flugtransfer//Crew Roster//DE
X-WR-CALNAME:Dienstplan Sarah (FRA Mittelstrecke)
BEGIN:VEVENT
UID:ft1422-lpa-20261103
DTSTART:20261103T073000
DTEND:20261103T171500
SUMMARY:FT 1422 FRA-LPA (A321neo)
LOCATION:Gran Canaria (LPA)
DESCRIPTION:Kanaren Tagesumlauf FRA-LPA-FRA. Blockzeit: 04:35h.
END:VEVENT
BEGIN:VEVENT
UID:ft1740-pmi-20261107
DTSTART:20261107T081500
DTEND:20261107T144500
SUMMARY:FT 1740 FRA-PMI (A320neo)
LOCATION:Palma de Mallorca
DESCRIPTION:Balearen Express.
END:VEVENT
BEGIN:VEVENT
UID:ft156-ayt-20261111
DTSTART:20261111T122000
DTEND:20261111T204000
SUMMARY:FT 156 FRA-AYT (A321neo)
LOCATION:Antalya (AYT)
DESCRIPTION:Mittelmeer Umlauf.
END:VEVENT
BEGIN:VEVENT
UID:ft140-hrg-20261116
DTSTART:20261116T090000
DTEND:20261116T183000
SUMMARY:FT 140 FRA-HRG (A321neo)
LOCATION:Hurghada (HRG)
DESCRIPTION:Rotes Meer Tagesflug.
END:VEVENT
END:VCALENDAR`
  },
  {
    id: 'sample-muc-cabin',
    title: 'Kabine & Purser MUC',
    subtitle: 'München Basis - Heraklion, Teneriffa, Ibiza',
    url: 'https://roster.flugtransfer.app/muc-cabin.ics',
    rawIcs: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flugtransfer//Crew Roster//DE
X-WR-CALNAME:Dienstplan Marco (MUC Purser)
BEGIN:VEVENT
UID:ft1610-her-20261104
DTSTART:20261104T061500
DTEND:20261104T133000
SUMMARY:FT 1610 MUC-HER (A320neo)
LOCATION:Heraklion (HER)
DESCRIPTION:Purser Lead. Griechenland Flug ab MUC.
END:VEVENT
BEGIN:VEVENT
UID:ft1440-tfs-20261109
DTSTART:20261109T084500
DTEND:20261109T182000
SUMMARY:FT 1440 MUC-TFS (A321neo)
LOCATION:Teneriffa Süd (TFS)
DESCRIPTION:Kanaren Day Turnus ab MUC T1.
END:VEVENT
BEGIN:VEVENT
UID:ft1502-ibz-20261114
DTSTART:20261114T110000
DTEND:20261114T170000
SUMMARY:FT 1502 MUC-IBZ (A320neo)
LOCATION:Ibiza (IBZ)
DESCRIPTION:Balearen Turnus.
END:VEVENT
END:VCALENDAR`
  }
];
