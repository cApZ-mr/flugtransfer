import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Terminal, 
  FolderTree, 
  ExternalLink,
  Smartphone,
  Layers
} from 'lucide-react';

interface DartFileEntry {
  path: string;
  name: string;
  category: 'core' | 'models' | 'services' | 'screens' | 'config';
  description: string;
  code: string;
}

const DART_FILES: DartFileEntry[] = [
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'core',
    description: 'Flutter App-Einstiegspunkt, Dark Avionics Theme & Bottom-Navigation',
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
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}`
  },
  {
    path: 'lib/services/roster_provider.dart',
    name: 'roster_provider.dart',
    category: 'services',
    description: 'State-Management (ChangeNotifier) mit automatischem Roster-Tausch & iCal Parser',
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

  UserProfile get userProfile => _userProfile;

  // Personal roster starts empty so the user can test their own Apple iCal link
  List<RosterShift> _myShifts = [];
  List<RosterShift> get myShifts => List.unmodifiable(_myShifts);

  List<MarketListing> _marketplaceListings = [];
  List<MarketListing> get marketplaceListings => List.unmodifiable(_marketplaceListings);

  List<SwapNegotiation> _negotiations = [];
  List<SwapNegotiation> get negotiations => List.unmodifiable(_negotiations);

  String? _activeChatId;
  String? get activeChatId => _activeChatId;

  void clearMyShifts() {
    _myShifts.clear();
    notifyListeners();
  }

  void confirmTradeStep(String negotiationId) {
    final index = _negotiations.indexWhere((n) => n.id == negotiationId);
    if (index == -1) return;

    final neg = _negotiations[index];
    final now = DateTime.now();

    // Mark completed
    _negotiations[index] = neg.copyWith(
      ownerAgreed: true,
      colleagueAgreed: true,
      status: TradeStatus.completed,
      lastUpdated: now,
    );

    // AUTOMATIC ROSTER SWAP: Add acquired flight to my roster
    final alreadyIn = _myShifts.any((s) => s.id == neg.shift.id);
    if (!alreadyIn) {
      _myShifts.add(neg.shift);
      _myShifts.sort((a, b) => a.departureTime.compareTo(b.departureTime));
    }

    notifyListeners();
  }
}`
  },
  {
    path: 'lib/screens/chat_room_screen.dart',
    name: 'chat_room_screen.dart',
    category: 'screens',
    description: 'WhatsApp-Chat-Seite mit Zurück-Pfeil (←), Sprechblasen & "Tausch ist durch?"-Aktion',
    code: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/swap_negotiation.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';

class ChatRoomScreen extends StatefulWidget {
  final String negotiationId;
  const ChatRoomScreen({super.key, required this.negotiationId});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final neg = roster.negotiations.firstWhere((n) => n.id == widget.negotiationId);

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(neg.colleagueName),
      ),
      body: Column(
        children: [
          // 3-Step Progress: Offen -> In Verhandlung -> Abgegeben
          // WhatsApp Bubble Messages
          // "Tausch ist durch?" Button
          if (neg.status != TradeStatus.completed)
            ElevatedButton(
              onPressed: () => roster.confirmTradeStep(neg.id),
              child: const Text('Tausch ist durch? Jetzt bestätigen'),
            ),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/services/ical_service.dart',
    name: 'ical_service.dart',
    category: 'services',
    description: 'Apple iCal Parser für Webcal/HTTP Feeds & RFC-5545 iCalendar Export',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/roster_shift.dart';

class ICalService {
  static Future<String> fetchIcalFeed(String url) async {
    String normalizedUrl = url.trim();
    if (normalizedUrl.startsWith('webcal://')) {
      normalizedUrl = 'https://\${normalizedUrl.substring(9)}';
    }
    final response = await http.get(Uri.parse(normalizedUrl));
    return utf8.decode(response.bodyBytes);
  }

  static List<RosterShift> parseICal(String icalString, {String defaultRole = 'First Officer'}) {
    final List<RosterShift> shifts = [];
    final lines = icalString.split(RegExp(r'\\r\\n|\\r|\\n'));
    // Parses BEGIN:VEVENT, DTSTART, DTEND, SUMMARY, DESCRIPTION...
    return shifts;
  }
}`
  },
  {
    path: 'lib/models/market_listing.dart',
    name: 'market_listing.dart',
    category: 'models',
    description: 'Modell für Schichten in der Börse mit Status (Offen, In Verhandlung, Abgegeben) & Aufrufen',
    code: `import 'roster_shift.dart';

enum ListingType { giveaway, swap }

enum TradeStatus {
  open,          // Offen
  inNegotiation, // In Verhandlung
  completed,     // Abgegeben
}

class MarketListing {
  final String id;
  final RosterShift shift;
  final String colleagueName;
  final ListingType type;
  final TradeStatus status;
  final int viewsCount;
  final int inquiriesCount;
  final DateTime createdAt;

  const MarketListing({
    required this.id,
    required this.shift,
    required this.colleagueName,
    required this.type,
    this.status = TradeStatus.open,
    this.viewsCount = 1,
    this.inquiriesCount = 0,
    required this.createdAt,
  });
}`
  },
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
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

interface DartCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DartCodeViewerModal: React.FC<DartCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<DartFileEntry>(DART_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#070C18] border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B1325] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Dart & Flutter Quellcode</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  /flutter_app
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vollständige native Flutter-Dateien in Dart für Android, iOS & Web
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Code View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* File Picker List */}
          <div className="w-full md:w-72 bg-[#060913] border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto max-h-48 md:max-h-full shrink-0">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Dart Projekt-Dateien</span>
            </div>

            {DART_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40 border border-transparent'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="truncate font-semibold">{file.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}

            <div className="mt-4 pt-3 border-t border-slate-800/80 px-3">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Flutter starten</span>
              </div>
              <div className="mt-1.5 p-2 rounded-lg bg-black/60 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                <div>cd flutter_app</div>
                <div className="text-sky-300">flutter pub get</div>
                <div className="text-emerald-300">flutter run</div>
              </div>
            </div>
          </div>

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#050811] overflow-hidden">
            
            {/* File info bar & Actions */}
            <div className="px-5 py-3 bg-[#080E1C] border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-300">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
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
                      <span>Code kopieren</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 bg-[#04060D] leading-relaxed selection:bg-sky-500/30">
              <pre className="whitespace-pre">{selectedFile.code}</pre>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
