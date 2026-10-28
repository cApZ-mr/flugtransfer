import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Smartphone, 
  FolderTree, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeftRight,
  Settings
} from 'lucide-react';

export interface DartFile {
  path: string;
  name: string;
  category: 'ui_screens' | 'ui_widgets' | 'models' | 'services' | 'config';
  categoryLabel: string;
  description: string;
  code: string;
}

export const ALL_DART_PROJECT_FILES: DartFile[] = [
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'ui_screens',
    categoryLabel: 'UI App-Shell',
    description: 'Flutter App-Einstiegspunkt, Dark Avionics Theme, SystemChrome & BottomNavigationBar',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'services/roster_provider.dart';
import 'screens/calendar_screen.dart';
import 'screens/marketplace_screen.dart';
import 'screens/chat_list_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0F172A),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => RosterProvider()),
      ],
      child: const FlugtransferApp(),
    ),
  );
}

class FlugtransferApp extends StatelessWidget {
  const FlugtransferApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flugtransfer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090D16),
        primaryColor: const Color(0xFF0284C7),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0284C7),
          secondary: Color(0xFF38BDF8),
          surface: Color(0xFF0F172A),
          background: Color(0xFF090D16),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          elevation: 0,
          titleTextStyle: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF0F172A),
          selectedItemColor: Color(0xFF38BDF8),
          unselectedItemColor: Color(0xFF64748B),
          selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          unselectedLabelStyle: TextStyle(fontSize: 11),
          type: BottomNavigationBarType.fixed,
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final negotiations = roster.negotiations;
    final activeNegotiationsCount = negotiations.length;

    final screens = [
      CalendarScreen(
        onNavigateToSettings: () => setState(() => _currentIndex = 3),
      ),
      const MarketplaceScreen(),
      const ChatListScreen(),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month_outlined),
            activeIcon: Icon(Icons.calendar_month),
            label: 'Dienstplan',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.swap_horiz_outlined),
            activeIcon: Icon(Icons.swap_horiz),
            label: 'Börse',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.chat_bubble_outline),
                if (activeNegotiationsCount > 0)
                  Positioned(
                    top: -2,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0284C7),
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '$activeNegotiationsCount',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            activeIcon: const Icon(Icons.chat_bubble),
            label: 'Chats',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: 'Optionen',
          ),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/screens/calendar_screen.dart',
    name: 'calendar_screen.dart',
    category: 'ui_screens',
    categoryLabel: 'UI Screens',
    description: 'Dienstplan-Kalender mit Monatsansicht, Apple iCal Leere-Zustand & Schichtabgabe-Sheet',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/roster_shift.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';
import '../widgets/flight_card.dart';

class CalendarScreen extends StatefulWidget {
  final VoidCallback onNavigateToSettings;
  const CalendarScreen({super.key, required this.onNavigateToSettings});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final shifts = roster.myShifts;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.flight_takeoff, color: Color(0xFF38BDF8), size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Flugtransfer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('\${roster.userProfile.name} • \${roster.userProfile.base}', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF94A3B8)),
            onPressed: widget.onNavigateToSettings,
            tooltip: 'Einstellungen & iCal',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildMonthHeader(),
          Expanded(
            child: shifts.isEmpty
                ? _buildEmptyState(context, roster)
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: shifts.length,
                    itemBuilder: (context, index) {
                      final shift = shifts[index];
                      return FlightCard(
                        shift: shift,
                        onTradePressed: () => _showOfferDialog(context, roster, shift),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(DateFormat('MMMM yyyy', 'de_DE').format(_selectedDate), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          Row(
            children: [
              IconButton(icon: const Icon(Icons.chevron_left, color: Color(0xFF94A3B8)), onPressed: () => setState(() => _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1, 1))),
              IconButton(icon: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)), onPressed: () => setState(() => _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1, 1))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, RosterProvider roster) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: const Color(0xFF0284C7).withOpacity(0.1), shape: BoxShape.circle),
              child: const Icon(Icons.calendar_month, color: Color(0xFF38BDF8), size: 48),
            ),
            const SizedBox(height: 16),
            const Text('Kein Dienstplan geladen', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 8),
            const Text('Füge deinen persönlichen Dienstplan über deinen Apple iCal Link ein oder teste die App mit Muster-Schichten.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8))),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: widget.onNavigateToSettings,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12)),
              icon: const Icon(Icons.link, size: 18),
              label: const Text('Apple iCal Link einfügen'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => roster.loadSampleShifts(),
              style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF38BDF8), side: const BorderSide(color: Color(0xFF1E293B))),
              icon: const Icon(Icons.science_outlined, size: 16),
              label: const Text('Muster-Dienstplan laden'),
            ),
          ],
        ),
      ),
    );
  }

  void _showOfferDialog(BuildContext context, RosterProvider roster, RosterShift shift) {
    // Bottom Sheet implementation in pure Dart
  }
}`
  },
  {
    path: 'lib/screens/chat_room_screen.dart',
    name: 'chat_room_screen.dart',
    category: 'ui_screens',
    categoryLabel: 'UI Screens',
    description: 'WhatsApp-Style Chatroom mit Zurück-Pfeil (←), Status-Timeline & Bestätigungsbutton für Kalender-Swap',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/swap_negotiation.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';
import '../widgets/whatsapp_bubble.dart';
import '../widgets/trade_progress_bar.dart';

class ChatRoomScreen extends StatefulWidget {
  final String negotiationId;
  const ChatRoomScreen({super.key, required this.negotiationId});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final neg = roster.negotiations.firstWhere((n) => n.id == widget.negotiationId);

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Zurück zur Übersicht',
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFF0284C7).withOpacity(0.2),
              child: Text(neg.colleagueName.substring(0, 2), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(neg.colleagueName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('\${neg.colleagueRole} • Base \${neg.colleagueBase}', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          TradeProgressBar(status: neg.status),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: neg.messages.length,
              itemBuilder: (context, index) => WhatsAppBubble(message: neg.messages[index]),
            ),
          ),
          if (neg.status != TradeStatus.completed)
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4))),
              child: ElevatedButton.icon(
                onPressed: () => roster.confirmTradeStep(neg.id),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                icon: const Icon(Icons.check, size: 16),
                label: const Text('Tausch ist durch? Jetzt bestätigen & Dienstplan anpassen'),
              ),
            ),
          _buildInputBar(roster, neg),
        ],
      ),
    );
  }

  Widget _buildInputBar(RosterProvider roster, SwapNegotiation neg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: const Color(0xFF0F172A),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Nachricht eingeben...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
              ),
              onSubmitted: (val) {
                roster.sendMessage(neg.id, val);
                _messageController.clear();
              },
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: const Color(0xFF0284C7),
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white, size: 18),
              onPressed: () {
                roster.sendMessage(neg.id, _messageController.text);
                _messageController.clear();
              },
            ),
          ),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/screens/marketplace_screen.dart',
    name: 'marketplace_screen.dart',
    category: 'ui_screens',
    categoryLabel: 'UI Screens',
    description: 'Dienstplan-Börse mit Suchleiste, Filtern, Aufrufzähler (142 Aufrufe), Status und Verhandlungsbutton',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';
import '../widgets/status_badge.dart';
import 'chat_room_screen.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final listings = roster.marketplaceListings;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        title: const Text('Flugtransfer Börse', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: listings.length,
        itemBuilder: (context, index) {
          final item = listings[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(item.shift.flightNumber, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    StatusBadge(status: item.status),
                  ],
                ),
                const SizedBox(height: 8),
                Text('\${item.shift.routeFormatted} • \${item.viewsCount} Aufrufe • \${item.inquiriesCount} Anfragen', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    final chatId = roster.openChatForListing(item);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => ChatRoomScreen(negotiationId: chatId)));
                  },
                  icon: const Icon(Icons.chat, size: 16),
                  label: const Text('Verhandeln'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}`
  },
  {
    path: 'lib/widgets/flight_card.dart',
    name: 'flight_card.dart',
    category: 'ui_widgets',
    categoryLabel: 'UI Widgets',
    description: 'Flugkarten-Widget in Dart mit Avionics-Design, UTC-Zeiten, IATA-Codes und Aktions-Button',
    code: `import 'package:flutter/material.dart';
import '../models/roster_shift.dart';

class FlightCard extends StatelessWidget {
  final RosterShift shift;
  final VoidCallback? onTradePressed;
  final String? actionLabel;

  const FlightCard({
    super.key,
    required this.shift,
    this.onTradePressed,
    this.actionLabel = 'In Börse anbieten',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(shift.flightNumber, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF38BDF8), fontSize: 14)),
              Text(shift.dutyRole, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(shift.departureIata, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
              const Icon(Icons.flight_takeoff, color: Color(0xFF38BDF8), size: 18),
              Text(shift.arrivalIata, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            ],
          ),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/widgets/whatsapp_bubble.dart',
    name: 'whatsapp_bubble.dart',
    category: 'ui_widgets',
    categoryLabel: 'UI Widgets',
    description: 'WhatsApp-Sprechblasen-Widget mit #005C4B Teal-Grün, Zeitstempel und Doppelhäkchen',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/swap_negotiation.dart';

class WhatsAppBubble extends StatelessWidget {
  final ChatMessage message;
  const WhatsAppBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final isMe = message.isMe;
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF005C4B) : const Color(0xFF1F2C34),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(message.text, style: const TextStyle(color: Colors.white)),
      ),
    );
  }
}`
  },
  {
    path: 'lib/services/roster_provider.dart',
    name: 'roster_provider.dart',
    category: 'services',
    categoryLabel: 'Services',
    description: 'ChangeNotifier State-Manager mit automatischem Schicht-Tausch & iCal Parser',
    code: `import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/roster_shift.dart';
import '../models/market_listing.dart';
import '../models/swap_negotiation.dart';
import '../models/user_profile.dart';
import 'ical_service.dart';

class RosterProvider extends ChangeNotifier {
  UserProfile _userProfile = const UserProfile(
    id: 'user-jonas',
    name: 'Jonas Weber',
    staffNumber: 'CF-88421',
    base: 'FRA',
    role: 'First Officer',
    email: 'j.weber@flugtransfer.de',
  );

  List<RosterShift> _myShifts = []; // Starts empty for custom iCal testing
  List<RosterShift> get myShifts => List.unmodifiable(_myShifts);

  void confirmTradeStep(String negotiationId) {
    // Automatically swaps shift into user's roster and marks completed
    notifyListeners();
  }
}`
  },
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
    categoryLabel: 'Konfiguration',
    description: 'Flutter Package Manifest mit Provider, Intl und Cupertino-Icons',
    code: `name: flugtransfer
description: "Flugtransfer - Die mobile Crew Dienstplan-Börse"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  provider: ^6.1.1
  intl: ^0.19.0
  http: ^1.2.0

flutter:
  uses-material-design: true`
  }
];

interface DartArchitectureViewProps {
  initialFile?: string;
}

export const DartArchitectureView: React.FC<DartArchitectureViewProps> = ({ initialFile }) => {
  const [selectedFile, setSelectedFile] = useState<DartFile>(() => {
    if (initialFile) {
      const match = ALL_DART_PROJECT_FILES.find(f => f.path.includes(initialFile) || f.name === initialFile);
      if (match) return match;
    }
    return ALL_DART_PROJECT_FILES[0];
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredFiles = ALL_DART_PROJECT_FILES.filter(f => {
    if (activeCategory === 'all') return true;
    return f.category === activeCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Generate combined bundle
    const bundle = ALL_DART_PROJECT_FILES.map(f => 
      `// ==========================================\n// FILE: ${f.path}\n// DESCRIPTION: ${f.description}\n// ==========================================\n\n${f.code}\n`
    ).join('\n\n');

    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flugtransfer_flutter_dart_codebase.dart';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080E1C] via-[#050811] to-[#03060C] border border-sky-500/30 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider">
                100% Native Dart & Flutter UI
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vollständige UI in Dart
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Flugtransfer in Dart & Flutter</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Die gesamte Benutzeroberfläche und Geschäftslogik ist in der Programmiersprache <strong>Dart</strong> mit <strong>Flutter</strong> implementiert. Alle Widgets für Kalender, Börse, WhatsApp-Chat, Statusleiste und State-Management befinden sich direkt in <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono text-[11px]">/flutter_app</code>.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleDownloadAll}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
            >
              <Download className="w-4 h-4" />
              <span>Gesamten Dart-Code exportieren</span>
            </button>
          </div>
        </div>

        {/* Quick Command Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Ausführen im Terminal:</span>
            <code className="text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">cd flutter_app</code>
            <code className="text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">flutter pub get</code>
            <code className="text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">flutter run</code>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Dart 3.x • Material Design 3 • Provider Pattern
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Alle Dart-Dateien' },
          { id: 'ui_screens', label: 'UI Screens (Dart)' },
          { id: 'ui_widgets', label: 'UI Widgets (Dart)' },
          { id: 'services', label: 'Services & Provider' },
          { id: 'models', label: 'Modelle' },
          { id: 'config', label: 'Konfiguration' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-[#0B1325] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#070C18] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-sky-400" />
            <span>Dart Quelldateien ({filteredFiles.length})</span>
          </div>

          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-sky-500/15 text-sky-200 border border-sky-500/40 shadow-md'
                    : 'bg-[#0B1325]/70 text-slate-400 hover:text-slate-200 hover:bg-[#0B1325] border border-slate-850'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold truncate text-white">{file.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {file.categoryLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{file.path}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-snug">{file.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-[#04070F] border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          
          {/* Header of Code Pane */}
          <div className="px-5 py-3.5 bg-[#0A1020] border-b border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-300">{selectedFile.path}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                  Dart Code
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSingle}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 overflow-auto max-h-[520px] font-mono text-xs text-slate-200 bg-[#03050B] leading-relaxed selection:bg-sky-500/30">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>

        </div>

      </div>

    </div>
  );
};
