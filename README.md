# DUS Urban Hunt 🦁

Mobile Schnitzeljagd durch Düsseldorf für Jugendliche (ca. 3 Stunden, 9 Stationen, ca. 7–8 km, Bahn erlaubt).

## Features
- **GPS-Geofencing:** Aufgaben einer Station werden erst im Radius der Station freigeschaltet (mit Richtungspfeil und Entfernung).
- **Antworten direkt in der App:** Quizfragen, Kreativaufgaben und Foto-Upload (Kamera).
- **Punktesystem & Rangliste:** Ankunft +10, Quiz bis +20 (Fehlversuch −3, min. 5), Foto +15, Kreativ +10, Tipp −5, Zeitbonus bis +60.
- **Spielleitung:** `/admin.html` zeigt alle Teams mit Antworten und Fotos.

## Starten
Voraussetzung: [Node.js](https://nodejs.org) (keine weiteren Abhängigkeiten).

```powershell
$env:ADMIN_PIN="deine-pin"
$env:UNLOCK_CODE="dein-notfall-code"   # Freischaltung bei GPS-Ausfall
$env:PORT="8000"                       # optional
node server.js
```

Der Server startet nicht, wenn `ADMIN_PIN` oder `UNLOCK_CODE` fehlen. Es gibt keine Standardwerte.

## Auf dem Handy nutzen
GPS und Kamera funktionieren im Browser nur über **HTTPS** (oder `localhost`). Stelle den Server daher z. B. über einen Tunnel (Cloudflare Tunnel, ngrok) oder einen Node-Hoster bereit. Anschließend die URL am Handy öffnen und „Zum Home-Bildschirm“ wählen.

## Anpassen
In `index.html` im Array `STATIONS`:
- `lat`, `lng`, `radius` (Meter) – Koordinaten stammen aus OpenStreetMap und sollten vor dem Einsatz **vor Ort geprüft** werden (Station 5 und 9 sind geschätzt).
- Fragen, `answers` (akzeptierte Antworten), `hint`, Fotoaufgaben.
- Punkte in `PTS`, Zeitlimit für den Bonus in `TIME_LIMIT_MIN`.

## Daten
Teamdaten liegen in `data.json`, Fotos in `uploads/` (beides per `.gitignore` nicht im Repo). Fotos der Teams sind nur über die Admin-Seite bzw. direkte URL erreichbar – Hinweis zum Datenschutz bei Minderjährigen: Fotos nach dem Event löschen.

## Dateien
`index.html` (App) · `server.js` (Server/API) · `admin.html` (Spielleitung) · `sw.js`, `manifest.json` (PWA)
