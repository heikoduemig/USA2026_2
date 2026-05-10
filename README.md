# Route 66 Adult Nightlife

Eigenständiges GitHub-Projekt für eine zweite, reduzierte Route-66-Seite mit:

- einer Google Map
- Tages-Tabs passend zur Reise
- kuratierten Adult-Nightlife-Locations je Stadt
- PWA-Manifest und Service Worker

## Deployment

1. Dateien in ein neues GitHub Repository kopieren.
2. GitHub Pages aktivieren: Settings → Pages → Deploy from branch → `main` / root.
3. Danach `index.html` öffnen.

## Hinweis

Der 22.05. wurde im Code als 22.05.2026 angelegt, weil er in der Route chronologisch auf 21.05.2026 folgt. Wichita ist als Wichita, Kansas interpretiert. Falls Wichita Falls gemeint ist, `adultData.js` entsprechend ersetzen.

## Dateien

- `index.html` – App, Layout, Google Maps/Places Logik
- `adultData.js` – Tagesplan und Location-Daten
- `manifest.webmanifest` – PWA Manifest
- `service-worker.js` – Offline Shell Cache
