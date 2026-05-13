# Route 66 After Dark Hybrid PWA v18

Finaler Leaflet-Fix:
- Leaflet-CSS lokal in styles.css eingebettet
- keine Abhängigkeit vom externen Leaflet-CSS
- Kacheln werden absolut positioniert statt als normale Bilder zu fließen
- globale Bildregeln überschreiben Leaflet-Tiles nicht mehr
- echte Online-Karte bleibt aktiv
- Offline-Neonkarte bleibt Fallback
- Kartenbilder/Favoriten/PWA bleiben enthalten

Upload:
1. Dateien ersetzen.
2. Commit `v18 leaflet css fixed`.
3. `/reset.html` öffnen.
4. „Jetzt resetten“ klicken.
5. `index.html?v=18&fresh=1` öffnen.
