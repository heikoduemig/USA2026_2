# Route 66 After Dark PRO v4

## Dateien
- `index.html`
- `adultData.js`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `service-worker.js`
- `icon-192.png`
- `icon-512.png`

## Neu in v4
- Mobile/Desktop Feinschliff für kleine Displays und Ultrawide Desktop
- verbesserte PWA-Metadaten inklusive Icons und Apple Touch Icon
- Accessibility: ARIA Labels, Status-Live-Region, Fokuszustände, `aria-expanded` für Details
- Lazy Loading für Karten- und Galerie-Hintergründe per IntersectionObserver
- sauberere Anchor-IDs und Bottom-Navigation (`#austin`, `#chicago`)
- aktive Kartenfilter optisch markiert
- Reduced-Motion-Unterstützung
- Service Worker Cache auf `pro4` versioniert

## Upload
1. GitHub-Verzeichnis komplett leeren oder alle bestehenden Dateien überschreiben.
2. Alle Dateien aus diesem Paket hochladen.
3. GitHub Pages 1–2 Minuten warten lassen.
4. Seite mit `?v=pro4` öffnen.

Beispiel:
`https://heikoduemig.github.io/USA2026_2/?v=pro4`

Falls alte Daten sichtbar bleiben: In der App auf **Cache aktualisieren** klicken oder Browser-Cache leeren.

## Google API Key
Der Key bleibt im Frontend, ist aber für GitHub Pages in Ordnung, wenn er per Domain Restriction und API Restriction abgesichert ist.
