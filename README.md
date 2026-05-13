# Route 66 After Dark Hybrid PWA v3 FREE

Kostenfreies GitHub-Pages-Paket ohne Google Maps API, ohne Places API und ohne externe Bilder.

## Was ist hybrid?

- Die App-Shell, Städte, Locations, Scores, Icons, Screenshots und die statische Übersichtskarte sind lokal/offline verfügbar.
- Website-Buttons und Google-Maps-Buttons bleiben erhalten, öffnen aber nur normale externe Webseiten/Apps bei Internet. Dafür wird kein API-Key benötigt.

## Enthalten

- `index.html`
- `styles.css`
- `app-offline.js`
- `adultData.js`
- `manifest.webmanifest`
- `service-worker.js`
- `icons/`
- `screenshots/`

## Upload auf GitHub Pages

1. Alle Dateien aus diesem Ordner in dein GitHub-Pages-Repository kopieren.
2. Bestehende Dateien ersetzen.
3. Seite einmal online öffnen.
4. Auf dem Smartphone als App installieren.

## Wichtig nach Updates

Die Cache-Version ist `route66-after-dark-hybrid-pwa-v3-free-20260513`.
Falls noch alte Inhalte erscheinen: Browser-/PWA-Cache löschen oder DevTools > Application > Service Workers > Unregister.

## Kostenfallen entfernt

- kein Google Maps JavaScript SDK
- keine Places API
- keine Directions API
- keine Geocoding API
- keine externen Unsplash-Bilder
- keine API-Keys

Google-Maps-Links sind normale Links wie `https://www.google.com/maps/search/?api=1&query=...` und verursachen keine Google-Cloud-API-Kosten.
