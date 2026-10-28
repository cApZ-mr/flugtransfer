import { RosterShift, ShiftType } from '../types';

export class ICalService {
  /**
   * Fetches .ics file content from a WebCal or HTTP/HTTPS Apple iCal feed URL.
   * Handles webcal:// normalization and optional CORS proxies if fetched from browser.
   */
  static async fetchIcalFeed(url: string): Promise<string> {
    let normalizedUrl = url.trim();
    if (normalizedUrl.startsWith('webcal://')) {
      normalizedUrl = 'https://' + normalizedUrl.substring(9);
    }

    // Try direct fetch first
    try {
      const response = await fetch(normalizedUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/calendar, text/plain, */*',
        },
      });

      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      // In browser environment, cross-origin webcal links might have CORS restrictions.
      // Attempt via public CORS proxy fallback or throw descriptive message.
      try {
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
        const proxyRes = await fetch(corsProxyUrl);
        if (proxyRes.ok) {
          return await proxyRes.text();
        }
      } catch {
        // Fall through
      }
      throw new Error(`Fehler beim Abrufen des Kalenders von ${normalizedUrl}: ${e instanceof Error ? e.message : 'Netzwerkfehler oder CORS-Beschränkung'}`);
    }

    throw new Error('Dienstplan-Feed konnte nicht geladen werden.');
  }

  /**
   * Parses raw RFC 5545 iCalendar content into a list of RosterShift objects
   */
  static parseICal(icalString: string, defaultRole: string = 'First Officer'): RosterShift[] {
    const shifts: RosterShift[] = [];
    const lines = icalString.split(/\r\n|\r|\n/);

    let inEvent = false;
    let summary = '';
    let description = '';
    let location = '';
    let dtStartStr: string | null = null;
    let dtEndStr: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Handle folded lines in iCalendar (lines starting with space or tab)
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        line += lines[i].trim();
      }

      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        summary = '';
        description = '';
        location = '';
        dtStartStr = null;
        dtEndStr = null;
      } else if (line === 'END:VEVENT' && inEvent) {
        if (summary && dtStartStr) {
          const dtStart = this.parseICalDate(dtStartStr);
          const dtEnd = dtEndStr ? this.parseICalDate(dtEndStr) : new Date(dtStart.getTime() + 4 * 3600 * 1000);

          // Route regex: e.g. "FRA -> PMI" or "FRA-PMI" or "FRA - PMI"
          const fullText = `${summary} ${location} ${description}`;
          const routeMatch = fullText.match(/([A-Z]{3})\s*[-–>]\s*([A-Z]{3})/);
          const dep = routeMatch ? routeMatch[1] : 'FRA';
          const arr = routeMatch ? routeMatch[2] : 'PMI';

          let shiftType: ShiftType = 'flight';
          const upper = summary.toUpperCase();
          if (upper.includes('STANDBY') || upper.includes('STBY')) {
            shiftType = 'standby';
          } else if (upper.includes('SIM') || upper.includes('CHECK')) {
            shiftType = 'simulator';
          } else if (upper.includes('OFF') || upper.includes('FREI')) {
            shiftType = 'off';
          } else if (upper.includes('GROUND') || upper.includes('BODEN')) {
            shiftType = 'ground';
          }

          const diffHours = (dtEnd.getTime() - dtStart.getTime()) / (1000 * 60 * 60);

          shifts.push({
            id: `shift-${Date.now()}-${shifts.length}-${Math.random().toString(36).substring(2, 6)}`,
            flightNumber: summary,
            departureIata: dep,
            arrivalIata: arr,
            departureTime: dtStart.toISOString(),
            arrivalTime: dtEnd.toISOString(),
            type: shiftType,
            aircraftType: summary.includes('A330') ? 'A330-900neo' : 'A321neo',
            blockHours: parseFloat(diffHours.toFixed(1)),
            notes: description.trim() ? description.trim() : undefined,
            dutyRole: defaultRole,
            isTradeable: shiftType !== 'off',
          });
        }
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          summary = line.substring(8).trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.substring(12).replace(/\\n/g, '\n').replace(/\\,/g, ',').trim();
        } else if (line.startsWith('LOCATION:')) {
          location = line.substring(9).trim();
        } else if (line.startsWith('DTSTART')) {
          const parts = line.split(':');
          if (parts.length > 1) dtStartStr = parts[parts.length - 1].trim();
        } else if (line.startsWith('DTEND')) {
          const parts = line.split(':');
          if (parts.length > 1) dtEndStr = parts[parts.length - 1].trim();
        }
      }
    }

    // Sort by departure time ascending
    shifts.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    return shifts;
  }

  static parseICalDate(str: string): Date {
    try {
      const clean = str.replace(/[ZT]/g, '');
      if (clean.length >= 8) {
        const year = parseInt(clean.substring(0, 4), 10);
        const month = parseInt(clean.substring(4, 6), 10) - 1;
        const day = parseInt(clean.substring(6, 8), 10);
        let hour = 0;
        let min = 0;
        let sec = 0;
        if (clean.length >= 12) {
          hour = parseInt(clean.substring(8, 10), 10);
          min = parseInt(clean.substring(10, 12), 10);
        }
        if (clean.length >= 14) {
          sec = parseInt(clean.substring(12, 14), 10);
        }
        return new Date(Date.UTC(year, month, day, hour, min, sec));
      }
    } catch {
      // Fallback
    }
    return new Date();
  }

  /**
   * Generates a standard RFC 5545 iCalendar string from a list of shifts
   */
  static exportToICal(shifts: RosterShift[], calendarName: string = 'Flugtransfer Dienstplan'): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Flugtransfer//Crew Schedule Roster//DE',
      `X-WR-CALNAME:${calendarName}`,
      'CALSCALE:GREGORIAN',
    ];

    const formatICalDate = (dt: Date): string => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return (
        dt.getUTCFullYear() +
        pad(dt.getUTCMonth() + 1) +
        pad(dt.getUTCDate()) +
        'T' +
        pad(dt.getUTCHours()) +
        pad(dt.getUTCMinutes()) +
        pad(dt.getUTCSeconds()) +
        'Z'
      );
    };

    const nowStr = formatICalDate(new Date());

    for (const shift of shifts) {
      const start = new Date(shift.departureTime);
      const end = new Date(shift.arrivalTime);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${shift.id}@flugtransfer.app`);
      lines.push(`DTSTAMP:${nowStr}`);
      lines.push(`DTSTART:${formatICalDate(start)}`);
      lines.push(`DTEND:${formatICalDate(end)}`);
      lines.push(`SUMMARY:${shift.flightNumber} (${shift.departureIata} -> ${shift.arrivalIata})`);
      lines.push(`LOCATION:${shift.departureIata} - ${shift.arrivalIata}`);
      lines.push(`DESCRIPTION:Rolle: ${shift.dutyRole} | Muster: ${shift.aircraftType || '-'} | Blockzeit: ${shift.blockHours ?? '-'}h`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }
}
