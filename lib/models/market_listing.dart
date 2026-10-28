import 'roster_shift.dart';

enum ListingType {
  giveaway, // Abgeben
  swap, // Tauschen
}

enum TradeStatus {
  open, // Offen
  inNegotiation, // In Verhandlung
  completed, // Abgegeben / Vollzogen
}

extension TradeStatusExtension on TradeStatus {
  String get label {
    switch (this) {
      case TradeStatus.open:
        return 'Offen';
      case TradeStatus.inNegotiation:
        return 'In Verhandlung';
      case TradeStatus.completed:
        return 'Abgegeben';
    }
  }

  String get description {
    switch (this) {
      case TradeStatus.open:
        return 'Schicht steht im Marktplatz bereit';
      case TradeStatus.inNegotiation:
        return 'Gespräch mit Kollege läuft aktiv';
      case TradeStatus.completed:
        return 'Tausch vollzogen & Dienstplan aktualisiert';
    }
  }
}

class MarketListing {
  final String id;
  final RosterShift shift;
  final String colleagueId;
  final String colleagueName;
  final String colleagueRole;
  final String colleagueBase;
  final ListingType type;
  final String? desiredRouteOrDate;
  final String? notes;
  final TradeStatus status;
  final int viewsCount;
  final int inquiriesCount;
  final DateTime createdAt;
  final bool isOwner;

  const MarketListing({
    required this.id,
    required this.shift,
    required this.colleagueId,
    required this.colleagueName,
    required this.colleagueRole,
    required this.colleagueBase,
    required this.type,
    this.desiredRouteOrDate,
    this.notes,
    this.status = TradeStatus.open,
    this.viewsCount = 1,
    this.inquiriesCount = 0,
    required this.createdAt,
    this.isOwner = false,
  });

  MarketListing copyWith({
    TradeStatus? status,
    int? viewsCount,
    int? inquiriesCount,
    bool? isOwner,
  }) {
    return MarketListing(
      id: id,
      shift: shift,
      colleagueId: colleagueId,
      colleagueName: colleagueName,
      colleagueRole: colleagueRole,
      colleagueBase: colleagueBase,
      type: type,
      desiredRouteOrDate: desiredRouteOrDate,
      notes: notes,
      status: status ?? this.status,
      viewsCount: viewsCount ?? this.viewsCount,
      inquiriesCount: inquiriesCount ?? this.inquiriesCount,
      createdAt: createdAt,
      isOwner: isOwner ?? this.isOwner,
    );
  }
}
