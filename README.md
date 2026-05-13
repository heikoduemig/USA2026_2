# Route 66 After Dark Hybrid PWA v17

Fixes:
- Leaflet-Tiles isoliert, damit die echte Karte nicht mehr fleckig/abgeschnitten rendert
- Wechsel auf CARTO/OpenStreetMap-Tiles
- echte direkte Bildflächen in den Location-Karten per `cardImage`
- SVG/Neon-Artwork bleibt als Fallback
- alle Marker/Popups/Favoriten/PWA/Online-Offline bleiben enthalten

Hinweis:
Die `cardImage`-URLs sind direkt eingebettete Bildquellen. Wenn du später offizielle Außenansichten hast,
trage sie pro Location als `officialImage` oder `cardImage` ein.

Upload:
1. Dateien ersetzen.
2. Commit `v17 real map images`.
3. `/reset.html` öffnen.
4. „Jetzt resetten“ klicken.
5. `index.html?v=17&fresh=1` öffnen.
