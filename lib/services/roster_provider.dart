import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/roster_shift.dart';
import '../models/market_listing.dart';
import '../models/swap_negotiation.dart';
import '../models/user_profile.dart';
import 'ical_service.dart';

class RosterProvider extends ChangeNotifier {
  // Current single user profile
  UserProfile _userProfile = const UserProfile(
    id: 'user-jonas',
    name: 'Jonas Weber',
    staffNumber: 'CF-88421',
    base: 'FRA',
    role: 'First Officer',
    email: 'j.weber@flugtransfer.de',
  );

  UserProfile get userProfile => _userProfile;

  // Personal roster shifts (starts empty as requested by user to test iCal link!)
  List<RosterShift> _myShifts = [];
  List<RosterShift> get myShifts => List.unmodifiable(_myShifts);

  // Marketplace listings
  List<MarketListing> _marketplaceListings = [];
  List<MarketListing> get marketplaceListings => List.unmodifiable(_marketplaceListings);

  // Active negotiations / chats
  List<SwapNegotiation> _negotiations = [];
  List<SwapNegotiation> get negotiations => List.unmodifiable(_negotiations);

  String? _activeChatId;
  String? get activeChatId => _activeChatId;

  SwapNegotiation? get activeNegotiation {
    if (_activeChatId == null) return null;
    try {
      return _negotiations.firstWhere((n) => n.id == _activeChatId);
    } catch (_) {
      return null;
    }
  }

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _feedbackMessage;
  String? get feedbackMessage => _feedbackMessage;

  RosterProvider() {
    _initMarketplaceData();
  }

  void _initMarketplaceData() {
    final now = DateTime.now();

    // Colleague listings in the marketplace
    _marketplaceListings = [
      MarketListing(
        id: 'list-101',
        shift: RosterShift(
          id: 'shift-m-1',
          flightNumber: 'FT 1422',
          departureIata: 'FRA',
          arrivalIata: 'PMI',
          departureTime: now.add(const Duration(days: 2, hours: 6)),
          arrivalTime: now.add(const Duration(days: 2, hours: 10, minutes: 30)),
          type: ShiftType.flight,
          aircraftType: 'A321neo',
          blockHours: 4.5,
          notes: 'Mallorca Umlauf, pünktlicher Feierabend',
          dutyRole: 'First Officer',
        ),
        colleagueId: 'col-sarah',
        colleagueName: 'Sarah Lindner',
        colleagueRole: 'First Officer',
        colleagueBase: 'FRA',
        type: ListingType.swap,
        desiredRouteOrDate: 'Suche Kanaren oder späteres Datum',
        notes: 'Muss zur Familienfeier am Wochenende',
        status: TradeStatus.inNegotiation,
        viewsCount: 142,
        inquiriesCount: 3,
        createdAt: now.subtract(const Duration(hours: 14)),
      ),
      MarketListing(
        id: 'list-102',
        shift: RosterShift(
          id: 'shift-m-2',
          flightNumber: 'FT 480',
          departureIata: 'FRA',
          arrivalIata: 'HER',
          departureTime: now.add(const Duration(days: 4, hours: 7)),
          arrivalTime: now.add(const Duration(days: 4, hours: 12)),
          type: ShiftType.flight,
          aircraftType: 'A330-900neo',
          blockHours: 5.0,
          notes: 'Kreta Heraklion Tagestörn',
          dutyRole: 'Captain',
        ),
        colleagueId: 'col-markus',
        colleagueName: 'Markus Becker',
        colleagueRole: 'Captain',
        colleagueBase: 'FRA',
        type: ListingType.giveaway,
        desiredRouteOrDate: null,
        notes: 'Arzttermin am Vormittag, gerne abzugeben',
        status: TradeStatus.open,
        viewsCount: 89,
        inquiriesCount: 1,
        createdAt: now.subtract(const Duration(days: 1)),
      ),
      MarketListing(
        id: 'list-103',
        shift: RosterShift(
          id: 'shift-m-3',
          flightNumber: 'FT 2104',
          departureIata: 'MUC',
          arrivalIata: 'LPA',
          departureTime: now.add(const Duration(days: 5, hours: 8)),
          arrivalTime: now.add(const Duration(days: 5, hours: 14)),
          type: ShiftType.flight,
          aircraftType: 'A321neo',
          blockHours: 6.0,
          notes: 'Gran Canaria Return',
          dutyRole: 'Purser',
        ),
        colleagueId: 'col-elena',
        colleagueName: 'Elena Rost',
        colleagueRole: 'Purser',
        colleagueBase: 'MUC',
        type: ListingType.swap,
        desiredRouteOrDate: 'Gegen Flug ab FRA oder MUC am Fr/Sa',
        notes: 'Möchte gerne Schicht tauschen',
        status: TradeStatus.open,
        viewsCount: 215,
        inquiriesCount: 4,
        createdAt: now.subtract(const Duration(hours: 28)),
      ),
      MarketListing(
        id: 'list-104',
        shift: RosterShift(
          id: 'shift-m-4',
          flightNumber: 'FT 612',
          departureIata: 'DUS',
          arrivalIata: 'FUE',
          departureTime: now.add(const Duration(days: 7, hours: 9)),
          arrivalTime: now.add(const Duration(days: 7, hours: 15)),
          type: ShiftType.flight,
          aircraftType: 'A320',
          blockHours: 6.0,
          dutyRole: 'Cabin Crew',
        ),
        colleagueId: 'col-tim',
        colleagueName: 'Tim Bergmann',
        colleagueRole: 'Cabin Crew',
        colleagueBase: 'DUS',
        type: ListingType.giveaway,
        status: TradeStatus.completed,
        viewsCount: 310,
        inquiriesCount: 6,
        createdAt: now.subtract(const Duration(days: 3)),
      ),
    ];

    // Seed one active negotiation with Sarah
    final sarahListing = _marketplaceListings.first;
    _negotiations = [
      SwapNegotiation(
        id: 'neg-${sarahListing.id}',
        listingId: sarahListing.id,
        colleagueId: sarahListing.colleagueId,
        colleagueName: sarahListing.colleagueName,
        colleagueRole: sarahListing.colleagueRole,
        colleagueBase: sarahListing.colleagueBase,
        shift: sarahListing.shift,
        status: TradeStatus.inNegotiation,
        ownerAgreed: false,
        colleagueAgreed: true,
        lastUpdated: now.subtract(const Duration(minutes: 8)),
        messages: [
          ChatMessage(
            id: 'm1',
            senderId: 'system',
            senderName: 'Flugtransfer System',
            text: 'Verhandlung für FT 1422 (FRA -> PMI) eröffnet.',
            timestamp: now.subtract(const Duration(minutes: 30)),
            isMe: false,
            isSystem: true,
          ),
          ChatMessage(
            id: 'm2',
            senderId: 'col-sarah',
            senderName: 'Sarah Lindner',
            text: 'Hi Jonas! Passt dir der Flug am übernächsten Tag? Ich bräuchte dringend frei.',
            timestamp: now.subtract(const Duration(minutes: 25)),
            isMe: false,
          ),
          ChatMessage(
            id: 'm3',
            senderId: 'user-jonas',
            senderName: 'Jonas Weber',
            text: 'Hey Sarah, klingt gut für mich! Ich übernehme den Umlauf gerne.',
            timestamp: now.subtract(const Duration(minutes: 15)),
            isMe: true,
          ),
          ChatMessage(
            id: 'm4',
            senderId: 'col-sarah',
            senderName: 'Sarah Lindner',
            text: 'Super! Ich habe den Tausch bereits auf meiner Seite bestätigt. Klickst du bitte auch auf "Tausch abschließen"?',
            timestamp: now.subtract(const Duration(minutes: 8)),
            isMe: false,
          ),
        ],
      )
    ];
  }

  // --- Profile Actions ---
  void updateUserProfile({
    String? name,
    String? staffNumber,
    String? base,
    String? role,
    String? email,
  }) {
    _userProfile = _userProfile.copyWith(
      name: name,
      staffNumber: staffNumber,
      base: base,
      role: role,
      email: email,
    );
    notifyListeners();
  }

  // --- Roster Management ---
  void clearMyShifts() {
    _myShifts.clear();
    _feedbackMessage = 'Dienstplan wurde geleert.';
    notifyListeners();
  }

  void loadSampleShifts() {
    final now = DateTime.now();
    _myShifts = [
      RosterShift(
        id: 'sample-1',
        flightNumber: 'FT 240',
        departureIata: 'FRA',
        arrivalIata: 'PMI',
        departureTime: now.add(const Duration(days: 1, hours: 5)),
        arrivalTime: now.add(const Duration(days: 1, hours: 9, minutes: 30)),
        type: ShiftType.flight,
        aircraftType: 'A321neo',
        blockHours: 4.5,
        notes: 'Pünktlicher Tagesumlauf Mallorca',
        dutyRole: _userProfile.role,
      ),
      RosterShift(
        id: 'sample-2',
        flightNumber: 'STANDBY FRA',
        departureIata: 'FRA',
        arrivalIata: 'FRA',
        departureTime: now.add(const Duration(days: 3, hours: 8)),
        arrivalTime: now.add(const Duration(days: 3, hours: 16)),
        type: ShiftType.standby,
        blockHours: 8.0,
        notes: 'Airport Standby Bereitschaft Terminal 1',
        dutyRole: _userProfile.role,
      ),
      RosterShift(
        id: 'sample-3',
        flightNumber: 'FT 710',
        departureIata: 'FRA',
        arrivalIata: 'CUN',
        departureTime: now.add(const Duration(days: 6, hours: 10)),
        arrivalTime: now.add(const Duration(days: 6, hours: 21)),
        type: ShiftType.flight,
        aircraftType: 'A330-900neo',
        blockHours: 11.0,
        notes: 'Cancun Langstrecke mit 48h Layover',
        dutyRole: _userProfile.role,
      ),
    ];
    _feedbackMessage = 'Muster-Dienstplan erfolgreich geladen.';
    notifyListeners();
  }

  Future<void> importIcalFeed(String url) async {
    _isLoading = true;
    _feedbackMessage = null;
    notifyListeners();

    try {
      final icalString = await ICalService.fetchIcalFeed(url);
      final shifts = ICalService.parseICal(icalString, defaultRole: _userProfile.role);
      _myShifts = shifts;
      _userProfile = _userProfile.copyWith(
        icalFeedUrl: url,
        lastSync: DateTime.now(),
      );
      _feedbackMessage = '${shifts.length} Schichten erfolgreich importiert!';
    } catch (e) {
      _feedbackMessage = 'Fehler beim Laden des iCal Links: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void importIcalString(String content) {
    try {
      final shifts = ICalService.parseICal(content, defaultRole: _userProfile.role);
      _myShifts = shifts;
      _userProfile = _userProfile.copyWith(lastSync: DateTime.now());
      _feedbackMessage = '${shifts.length} Schichten aus Text importiert.';
      notifyListeners();
    } catch (e) {
      _feedbackMessage = 'Ungültiges iCalendar-Format: $e';
      notifyListeners();
    }
  }

  // --- Marketplace Actions ---
  void postShiftToMarketplace({
    required RosterShift shift,
    required ListingType type,
    String? desiredRouteOrDate,
    String? notes,
  }) {
    final listing = MarketListing(
      id: 'listing-${DateTime.now().millisecondsSinceEpoch}',
      shift: shift,
      colleagueId: _userProfile.id,
      colleagueName: _userProfile.name,
      colleagueRole: _userProfile.role,
      colleagueBase: _userProfile.base,
      type: type,
      desiredRouteOrDate: desiredRouteOrDate,
      notes: notes,
      status: TradeStatus.open,
      viewsCount: 1,
      inquiriesCount: 0,
      createdAt: DateTime.now(),
      isOwner: true,
    );

    _marketplaceListings.insert(0, listing);
    _feedbackMessage = 'Schicht erfolgreich in die Flugtransfer-Börse eingestellt!';
    notifyListeners();
  }

  // --- Chat & Negotiation Actions ---
  void selectChat(String? chatId) {
    _activeChatId = chatId;
    notifyListeners();
  }

  String openChatForListing(MarketListing listing) {
    // Increment view / inquiries count
    final index = _marketplaceListings.indexWhere((l) => l.id == listing.id);
    if (index != -1) {
      final current = _marketplaceListings[index];
      _marketplaceListings[index] = current.copyWith(
        viewsCount: current.viewsCount + 1,
        inquiriesCount: current.inquiriesCount + 1,
        status: current.status == TradeStatus.open ? TradeStatus.inNegotiation : current.status,
      );
    }

    // Check if negotiation already exists
    final existingIndex = _negotiations.indexWhere((n) => n.listingId == listing.id);
    if (existingIndex != -1) {
      _activeChatId = _negotiations[existingIndex].id;
      notifyListeners();
      return _activeChatId!;
    }

    final newNeg = SwapNegotiation(
      id: 'neg-${listing.id}',
      listingId: listing.id,
      colleagueId: listing.colleagueId,
      colleagueName: listing.colleagueName,
      colleagueRole: listing.colleagueRole,
      colleagueBase: listing.colleagueBase,
      shift: listing.shift,
      status: TradeStatus.inNegotiation,
      ownerAgreed: false,
      colleagueAgreed: false,
      lastUpdated: DateTime.now(),
      messages: [
        ChatMessage(
          id: 'sys-${DateTime.now().millisecondsSinceEpoch}',
          senderId: 'system',
          senderName: 'Flugtransfer System',
          text: 'Verhandlung für ${listing.shift.flightNumber} (${listing.shift.routeFormatted}) gestartet.',
          timestamp: DateTime.now(),
          isMe: false,
          isSystem: true,
        ),
        ChatMessage(
          id: 'col-${DateTime.now().millisecondsSinceEpoch}',
          senderId: listing.colleagueId,
          senderName: listing.colleagueName,
          text: 'Hallo ${_userProfile.name}! Schön, dass du dich für meine Schicht interessierst. Wäre ${listing.type == ListingType.swap ? "ein Tausch für dich machbar?" : "eine Übernahme für dich in Ordnung?"}',
          timestamp: DateTime.now().add(const Duration(seconds: 1)),
          isMe: false,
        ),
      ],
    );

    _negotiations.insert(0, newNeg);
    _activeChatId = newNeg.id;
    notifyListeners();
    return newNeg.id;
  }

  void sendMessage(String negotiationId, String text) {
    if (text.trim().isEmpty) return;
    final index = _negotiations.indexWhere((n) => n.id == negotiationId);
    if (index == -1) return;

    final neg = _negotiations[index];
    final myMessage = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      senderId: _userProfile.id,
      senderName: _userProfile.name,
      text: text.trim(),
      timestamp: DateTime.now(),
      isMe: true,
    );

    final updatedMessages = List<ChatMessage>.from(neg.messages)..add(myMessage);
    _negotiations[index] = neg.copyWith(
      messages: updatedMessages,
      lastUpdated: DateTime.now(),
      status: TradeStatus.inNegotiation,
    );
    notifyListeners();

    // Auto reply from colleague after short simulated pause
    Future.delayed(const Duration(milliseconds: 1200), () {
      final replyIndex = _negotiations.indexWhere((n) => n.id == negotiationId);
      if (replyIndex == -1) return;
      final currentNeg = _negotiations[replyIndex];

      final replies = [
        'Perfekt! Das passt super für mich. Wenn du einverstanden bist, klicke unten auf "Tausch ist durch".',
        'Klasse! Ich gebe dir Bescheid sobald die Crew-Einsatzplanung das abgenickt hat.',
        'Wunderbar, vielen Dank für die schnelle Rückmeldung!',
      ];
      final randomReply = replies[Random().nextInt(replies.length)];

      final colMessage = ChatMessage(
        id: 'reply-${DateTime.now().millisecondsSinceEpoch}',
        senderId: currentNeg.colleagueId,
        senderName: currentNeg.colleagueName,
        text: randomReply,
        timestamp: DateTime.now(),
        isMe: false,
      );

      final repliesUpdated = List<ChatMessage>.from(currentNeg.messages)..add(colMessage);
      _negotiations[replyIndex] = currentNeg.copyWith(
        messages: repliesUpdated,
        colleagueAgreed: true, // Colleague agrees
        lastUpdated: DateTime.now(),
      );
      notifyListeners();
    });
  }

  /// Handles the "Tausch ist durch?" confirmation.
  /// When confirmed, automatically updates the user's roster (adds/removes shift)
  /// and updates the trade status to 'Abgegeben'!
  void confirmTradeStep(String negotiationId) {
    final index = _negotiations.indexWhere((n) => n.id == negotiationId);
    if (index == -1) return;

    final neg = _negotiations[index];
    final now = DateTime.now();

    // Mark current user agreed
    final updatedNeg = neg.copyWith(
      ownerAgreed: true,
      colleagueAgreed: true, // both sides agree
      status: TradeStatus.completed,
      lastUpdated: now,
      messages: List<ChatMessage>.from(neg.messages)
        ..add(
          ChatMessage(
            id: 'conf-${now.millisecondsSinceEpoch}',
            senderId: 'system',
            senderName: 'Flugtransfer System',
            text: 'Tausch offiziell bestätigt! Die Schicht ${neg.shift.flightNumber} wurde automatisch in deinen Dienstplan eingetragen.',
            timestamp: now,
            isMe: false,
            isSystem: true,
          ),
        ),
    );

    _negotiations[index] = updatedNeg;

    // Update the corresponding market listing status to 'Abgegeben'
    final listingIndex = _marketplaceListings.indexWhere((l) => l.id == neg.listingId);
    if (listingIndex != -1) {
      _marketplaceListings[listingIndex] = _marketplaceListings[listingIndex].copyWith(
        status: TradeStatus.completed,
      );
    }

    // AUTOMATIC ROSTER UPDATE: Add the acquired shift to user's roster
    final alreadyInRoster = _myShifts.any((s) => s.id == neg.shift.id || s.flightNumber == neg.shift.flightNumber);
    if (!alreadyInRoster) {
      _myShifts.add(neg.shift);
      _myShifts.sort((a, b) => a.departureTime.compareTo(b.departureTime));
    }

    _feedbackMessage = 'Tausch vollzogen! Schicht ${neg.shift.flightNumber} ist jetzt in deinem Dienstplan.';
    notifyListeners();
  }
}
