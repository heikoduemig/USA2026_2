# Route 66 After Dark · Offline PWA

Dieses Paket ist direkt für GitHub Pages vorbereitet.

## Upload

1. Repository öffnen oder neu erstellen.
2. Alle Dateien aus diesem Ordner ins Repository kopieren.
3. GitHub → Settings → Pages.
4. Source: `Deploy from a branch`, Branch: `main`, Folder: `/root`.
5. Die Pages-URL öffnen und einmal online laden.
6. Danach über Chrome/Android „App installieren“ oder iOS Safari → Teilen → „Zum Home-Bildschirm“ installieren.

## Was geändert wurde

- `icons/` und `screenshots/` sind als echte Ordner enthalten.
- Der Service Worker cached nur lokale Dateien und bricht nicht mehr ab, wenn eine Datei fehlt.
- Die App startet offline sofort mit lokaler Offline-Karte.
- Google Maps wird erst dynamisch geladen, wenn Internet verfügbar ist.
- Reiseplan, Städte und Locations sind offline nutzbar.

## Test

Nach dem ersten Online-Aufruf:

- DevTools → Application → Service Workers prüfen.
- DevTools → Application → Cache Storage prüfen.
- Danach Netzwerk auf Offline stellen und Seite neu laden.

