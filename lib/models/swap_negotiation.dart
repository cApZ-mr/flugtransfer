import 'market_listing.dart';
import 'roster_shift.dart';

class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String text;
  final DateTime timestamp;
  final bool isMe;
  final bool isSystem;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
    required this.isMe,
    this.isSystem = false,
  });
}

class SwapNegotiation {
  final String id;
  final String listingId;
  final String colleagueId;
  final String colleagueName;
  final String colleagueRole;
  final String colleagueBase;
  final RosterShift shift;
  final RosterShift? offeredShift;
  final TradeStatus status;
  final bool ownerAgreed;
  final bool colleagueAgreed;
  final List<ChatMessage> messages;
  final DateTime lastUpdated;

  const SwapNegotiation({
    required this.id,
    required this.listingId,
    required this.colleagueId,
    required this.colleagueName,
    required this.colleagueRole,
    required this.colleagueBase,
    required this.shift,
    this.offeredShift,
    this.status = TradeStatus.inNegotiation,
    this.ownerAgreed = false,
    this.colleagueAgreed = false,
    required this.messages,
    required this.lastUpdated,
  });

  bool get bothAgreed => ownerAgreed && colleagueAgreed;

  SwapNegotiation copyWith({
    TradeStatus? status,
    bool? ownerAgreed,
    bool? colleagueAgreed,
    List<ChatMessage>? messages,
    DateTime? lastUpdated,
    RosterShift? offeredShift,
  }) {
    return SwapNegotiation(
      id: id,
      listingId: listingId,
      colleagueId: colleagueId,
      colleagueName: colleagueName,
      colleagueRole: colleagueRole,
      colleagueBase: colleagueBase,
      shift: shift,
      offeredShift: offeredShift ?? this.offeredShift,
      status: status ?? this.status,
      ownerAgreed: ownerAgreed ?? this.ownerAgreed,
      colleagueAgreed: colleagueAgreed ?? this.colleagueAgreed,
      messages: messages ?? this.messages,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }
}
