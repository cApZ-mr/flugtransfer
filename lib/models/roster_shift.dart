import 'package:intl/intl.dart';

enum ShiftType {
  flight,
  standby,
  simulator,
  off,
  ground,
}

class RosterShift {
  final String id;
  final String flightNumber; // e.g. "FT 240", "STANDBY", "OFF"
  final String departureIata; // e.g. "FRA"
  final String arrivalIata; // e.g. "PMI"
  final DateTime departureTime;
  final DateTime arrivalTime;
  final ShiftType type;
  final String? aircraftType; // e.g. "A330-900neo", "A321"
  final double? blockHours;
  final String? notes;
  final String dutyRole; // "Captain", "First Officer", "Purser", "Cabin Crew"
  final bool isTradeable;

  const RosterShift({
    required this.id,
    required this.flightNumber,
    required this.departureIata,
    required this.arrivalIata,
    required this.departureTime,
    required this.arrivalTime,
    required this.type,
    this.aircraftType,
    this.blockHours,
    this.notes,
    required this.dutyRole,
    this.isTradeable = true,
  });

  String get routeFormatted => type == ShiftType.flight
      ? '$departureIata -> $arrivalIata'
      : (type == ShiftType.standby ? 'Standby ($departureIata)' : flightNumber);

  String get durationFormatted {
    final diff = arrivalTime.difference(departureTime);
    final hours = diff.inHours;
    final minutes = diff.inMinutes.remainder(60);
    return '${hours}h ${minutes}m';
  }

  String get formattedDate => DateFormat('EEE, dd. MMM yyyy', 'de_DE').format(departureTime);

  String get formattedTimeRange {
    final start = DateFormat('HH:mm').format(departureTime);
    final end = DateFormat('HH:mm').format(arrivalTime);
    return '$start - $end UTC';
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'flightNumber': flightNumber,
        'departureIata': departureIata,
        'arrivalIata': arrivalIata,
        'departureTime': departureTime.toIso8601String(),
        'arrivalTime': arrivalTime.toIso8601String(),
        'type': type.name,
        'aircraftType': aircraftType,
        'blockHours': blockHours,
        'notes': notes,
        'dutyRole': dutyRole,
        'isTradeable': isTradeable,
      };

  factory RosterShift.fromJson(Map<String, dynamic> json) {
    return RosterShift(
      id: json['id'] as String,
      flightNumber: json['flightNumber'] as String,
      departureIata: json['departureIata'] as String,
      arrivalIata: json['arrivalIata'] as String,
      departureTime: DateTime.parse(json['departureTime'] as String),
      arrivalTime: DateTime.parse(json['arrivalTime'] as String),
      type: ShiftType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => ShiftType.flight,
      ),
      aircraftType: json['aircraftType'] as String?,
      blockHours: (json['blockHours'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
      dutyRole: json['dutyRole'] as String? ?? 'Cabin Crew',
      isTradeable: json['isTradeable'] as bool? ?? true,
    );
  }
}
