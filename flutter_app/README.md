# Flugtransfer - Flutter & Dart Applikation

Dies ist die native Flutter-App für **Flugtransfer** – die moderne Crew-Dienstplan-Börse für Fluggesellschaften.

## 📁 Projektstruktur (Dart)

```
flutter_app/
├── pubspec.yaml                       # Flutter Projektkonfiguration & Dependencies
├── lib/
│   ├── main.dart                      # App-Einstiegspunkt, Theme & Bottom-Navigation
│   ├── models/
│   │   ├── roster_shift.dart          # Modell für Flüge, Umläufe, Standby & Off-Tage
│   │   ├── market_listing.dart        # Börsen-Einträge mit Status (Offen, In Verhandlung, Abgegeben) & Aufrufzähler
│   │   ├── swap_negotiation.dart      # Verhandlungen & Chat-Nachrichten
│   │   └── user_profile.dart          # Benutzerprofil (Single-Account)
│   ├── services/
│   │   ├── ical_service.dart          # Apple iCal Parser (.ics & webcal:// Feed)
│   │   └── roster_provider.dart       # ChangeNotifier State-Manager mit automatischem Dienstplan-Tausch
│   └── screens/
│       ├── calendar_screen.dart       # Monats-Dienstplan mit Apple iCal Integration & Schichtabgabe
│       ├── marketplace_screen.dart    # Schicht-Börse mit Filtern, Aufrufen & Anfragen
│       ├── chat_list_screen.dart      # WhatsApp-ähnliche Chat-Übersicht
│       ├── chat_room_screen.dart      # Dedizierter Chat-Raum mit Zurück-Pfeil (←) & "Tausch ist durch?"
│       └── settings_screen.dart       # Profil & iCal-Dienstplanverwaltung
```

## 🚀 Wie starte ich die Flutter App?

1. Stelle sicher, dass du das [Flutter SDK](https://docs.flutter.dev/get-started/install) installiert hast.
2. Wechsle in das Verzeichnis:
   ```bash
   cd flutter_app
   ```
3. Lade die Abhängigkeiten:
   ```bash
   flutter pub get
   ```
4. Starte die App auf deinem verbundenen Gerät, Simulator oder im Web:
   ```bash
   flutter run
   ```
   Oder für Chrome im Browser:
   ```bash
   flutter run -d chrome
   ```
