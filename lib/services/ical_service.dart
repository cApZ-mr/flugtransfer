import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/roster_shift.dart';

class ICalService {
  /// Fetches .ics file content from a WebCal or HTTP/HTTPS Apple iCal feed URL
  static Future<String> fetchIcalFeed(String url) async {
    String normalizedUrl = url.trim();
    if (normalizedUrl.startsWith('webcal://')) {
      normalizedUrl = 'https://${normalizedUrl.substring(9)}';
    }

    final response = await http.get(Uri.parse(normalizedUrl));
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return utf8.decode(response.bodyBytes);
    } else {
      throw Exception('Fehler beim Abrufen des Kalenders (HTTP ${response.statusCode})');
    }
  }

  /// Parses raw iCal text into a list of RosterShift objects
  static List<RosterShift> parseICal(String icalString, {String defaultRole = 'First Officer'}) {
    final List<RosterShift> shifts = [];
    final lines = icalString.split(RegExp(r'\r\n|\r|\n'));

    bool inEvent = false;
    String summary = '';
    String description = '';
    String location = '';
    String? dtStartStr;
    String? dtEndStr;

    for (final rawLine in lines) {
      final line = rawLine.trim();

      if (line == 'BEGIN:VEVENT') {
        inEvent = true;
        summary = '';
        description = '';
        location = '';
        dtStartStr = null;
        dtEndStr = null;
      } else if (line == 'END:VEVENT' && inEvent) {
        if (summary.isNotEmpty && dtStartStr != null) {
          final dtStart = _parseICalDate(dtStartStr);
          final dtEnd = dtEndStr != null ? _parseICalDate(dtEndStr) : dtStart.add(const Duration(hours: 4));

          final routeMatch = RegExp(r'([A-Z]{3})\s*[-–>]\s*([A-Z]{3})').firstMatch('$summary $location $description');
          final dep = routeMatch?.group(1) ?? 'FRA';
          final arr = routeMatch?.group(2) ?? 'PMI';

          ShiftType shiftType = ShiftType.flight;
          final upper = summary.toUpperCase();
          if (upper.contains('STANDBY') || upper.contains('STBY')) {
            shiftType = ShiftType.standby;
          } else if (upper.contains('SIM') || upper.contains('CHECK')) {
            shiftType = ShiftType.simulator;
          } else if (upper.contains('OFF') || upper.contains('FREI')) {
            shiftType = ShiftType.off;
          }

          final diffHours = dtEnd.difference(dtStart).inMinutes / 60.0;

          shifts.add(RosterShift(
            id: 'shift-${DateTime.now().millisecondsSinceEpoch}-${shifts.length}',
            flightNumber: summary,
            departureIata: dep,
            arrivalIata: arr,
            departureTime: dtStart,
            arrivalTime: dtEnd,
            type: shiftType,
            aircraftType: summary.contains('A330') ? 'A330-900neo' : 'A321neo',
            blockHours: double.parse(diffHours.toStringAsFixed(1)),
            notes: description.isNotEmpty ? description : null,
            dutyRole: defaultRole,
            isTradeable: shiftType != ShiftType.off,
          ));
        }
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          summary = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.substring(12);
        } else if (line.startsWith('LOCATION:')) {
          location = line.substring(9);
        } else if (line.startsWith('DTSTART')) {
          final parts = line.split(':');
          if (parts.length > 1) dtStartStr = parts.last;
        } else if (line.startsWith('DTEND')) {
          final parts = line.split(':');
          if (parts.length > 1) dtEndStr = parts.last;
        }
      }
    }

    return shifts;
  }

  static DateTime _parseICalDate(String str) {
    try {
      final clean = str.replaceAll('Z', '').replaceAll('T', '');
      if (clean.length >= 8) {
        final year = int.parse(clean.substring(0, 4));
        final month = int.parse(clean.substring(4, 6));
        final day = int.parse(clean.substring(6, 8));
        int hour = 0;
        int min = 0;
        if (clean.length >= 12) {
          hour = int.parse(clean.substring(8, 10));
          min = int.parse(clean.substring(10, 12));
        }
        return DateTime.utc(year, month, day, hour, min);
      }
    } catch (_) {}
    return DateTime.now();
  }

  /// Generates a standard RFC 5545 iCalendar string from a list of shifts
  static String exportToICal(List<RosterShift> shifts, {String calendarName = 'Flugtransfer Dienstplan'}) {
    final buffer = StringBuffer();
    buffer.writeln('BEGIN:VCALENDAR');
    buffer.writeln('VERSION:2.0');
    buffer.writeln('PRODID:-//Flugtransfer//Crew Schedule Roster//DE');
    buffer.writeln('X-WR-CALNAME:$calendarName');
    buffer.writeln('CALSCALE:GREGORIAN');

    for (final shift in shifts) {
      buffer.writeln('BEGIN:VEVENT');
      buffer.writeln('UID:${shift.id}@flugtransfer.app');
      buffer.writeln('DTSTAMP:${_formatICalDate(DateTime.now())}');
      buffer.writeln('DTSTART:${_formatICalDate(shift.departureTime)}');
      buffer.writeln('DTEND:${_formatICalDate(shift.arrivalTime)}');
      buffer.writeln('SUMMARY:${shift.flightNumber} (${shift.departureIata} -> ${shift.arrivalIata})');
      buffer.writeln('LOCATION:${shift.departureIata} - ${shift.arrivalIata}');
      buffer.writeln('DESCRIPTION:Rolle: ${shift.dutyRole} | Muster: ${shift.aircraftType ?? "-"} | Blockzeit: ${shift.blockHours ?? "-"}h');
      buffer.writeln('END:VEVENT');
    }

    buffer.writeln('END:VCALENDAR');
    return buffer.toString();
  }

  static String _formatICalDate(DateTime dt) {
    final u = dt.toUtc();
    return '${u.year.toString().padLeft(4, '0')}'
        '${u.month.toString().padLeft(2, '0')}'
        '${u.day.toString().padLeft(2, '0')}T'
        '${u.hour.toString().padLeft(2, '0')}'
        '${u.minute.toString().padLeft(2, '0')}'
        '${u.second.toString().padLeft(2, '0')}Z';
  }
}
