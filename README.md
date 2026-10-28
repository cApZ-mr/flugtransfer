# Flugtransfer - Crew Schichtbörse & Dienstplan

Flugtransfer ist eine spezialisierte Web-Applikation für Airline-Crews (Cockpit & Kabine), die das Verwalten von Dienstplänen, den Tausch und die Abgabe von Umläufen über eine Schichtbörse sowie WhatsApp-ähnliche Verhandlungs-Chats mit Status-Tracking ermöglicht.

## Features

- **Dienstplan-Verwaltung & Apple iCal Import:**
  - Synchronisation via Apple iCal / WebCal URL (`webcal://` oder `https://`)
  - Automatisches Parsen von Umläufen, Blockstunden, Strecken (z.B. FRA → PMI), Standby-, Simulator- und Frei-Tagen
  - Manueller Import von `.ics` Kalender-Text
  - Export des aktuellen Dienstplans als standardkonforme `.ics` iCalendar-Datei
  - Laden von Muster-Dienstplänen für Demozwecke

- **Flugtransfer Schichtbörse:**
  - Live-Marktplatz für Schichten mit Filterung (Alle, Tauschen, Abgeben) und Volltextsuche (Flugnummer, Route, Kollege)
  - Transparente Status-Abzeichen (*Offen*, *In Verhandlung*, *Abgegeben*)
  - Anzeigen von Crew-Rolle, Heimatbasis, Aufruf- und Anfragezählern
  - Einstellen eigener Schichten aus dem Dienstplan mit wenigen Klicks ("In Börse anbieten")

- **WhatsApp-ähnliche Verhandlungs-Chats:**
  - 3-stufiger Verhandlungsfortschritt: *1. Offen* → *2. In Verhandlung* → *3. Abgegeben*
  - Authentisches Chat-Design mit Nachrichtenblasen, Zeitstempeln und Gelesen-Häkchen
  - Automatisierte Kollegensimulation für lebensechte Chat-Verläufe
  - Interaktives "Tausch ist durch?"-Abschließen: Automatisches Eintragen der übernommenen Schicht in den persönlichen Dienstplan

- **Optionen & Profil:**
  - Crew-Profil mit Name, Personalnummer, Heimatbasis, Crew-Rolle und E-Mail
  - iCal-Feed-Konfiguration mit Statusanzeige des letzten Syncs
  - Verwaltung und Zurücksetzen von Dienstplandaten

## Tech-Stack

- **Framework:** React 19 (TypeScript) auf Vite
- **Styling:** Tailwind CSS (Cockpit Dark Theme)
- **Icons:** Lucide React
- **Datum & Zeit:** date-fns mit deutschem Locale (`de`)
- **Port:** 3000 (`vite --host 0.0.0.0 --port 3000`)
