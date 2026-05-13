# Route 66 After Dark Hybrid PWA v14 POLISHED

Aufbauend auf v13.

Neu in v14:
- bessere Marker-Verteilung und Labels links/rechts gegen Überlagerung
- animierte Marker
- Mini-Popups mit Bildbereich und Marker-Zähler
- Favoriten lokal speichern per `localStorage`
- Favoriten-Sektion
- bessere Map-Textur
- echte Bild-URL-Unterstützung pro Location über `officialImage`
- Fallback bleibt individuelles Neon-Artwork
- PWA-Installation bleibt aktiv
- Online-/Offline-Modus bleibt aktiv
- Service Worker online-first

## Echte Außenansichten / Clubbilder

Direktes Einbetten von Google-Maps-Fotos ohne Places/Photo-API ist nicht sauber.
Die App unterstützt aber jetzt echte freigegebene Bild-URLs pro Location:

```js
officialImage: 'https://.../freigegebenes-bild.jpg'
```

Wenn `officialImage` gesetzt ist, wird das echte Bild angezeigt.
Wenn nicht, nutzt die App ein individuelles lokales Neon-Artwork und der Button `Bilder`
öffnet die passende Google-Bildersuche/Außenansicht.

## Upload
1. GitHub-Repo komplett leeren oder alle alten Dateien ersetzen.
2. Inhalt dieses ZIPs hochladen.
3. Commit: `v14 polished`
4. `/reset.html` öffnen.
5. „Jetzt resetten“ klicken.
