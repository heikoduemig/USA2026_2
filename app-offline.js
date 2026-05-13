const PLACES = Array.isArray(window.ADULT_PLACES) ? window.ADULT_PLACES : [];
const CITY_META = window.CITY_META || {};
const CITY_ORDER = Array.isArray(window.CITY_ORDER) ? window.CITY_ORDER : [...new Set(PLACES.map(p => p.city))];

let activeCity = 'all';
let activePlace = null;
let onlineState = navigator.onLine;
let deferredInstallPrompt = null;
let leafletMap = null;
let leafletLayer = null;
let favorites = new Set(JSON.parse(localStorage.getItem('route66Favorites') || '[]'));

function saveFavorites(){ localStorage.setItem('route66Favorites', JSON.stringify([...favorites])); }
function isFavorite(idx){ return !!PLACES[idx] && favorites.has(PLACES[idx].name); }
function toggleFavorite(idx){
  if (!PLACES[idx]) return;
  const name = PLACES[idx].name;
  if (favorites.has(name)) favorites.delete(name); else favorites.add(name);
  saveFavorites();
  renderCities();
  renderFavorites();
  renderMap();
}
function slug(text){ return String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function maps(q){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function imageSearch(p){ return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.imageQuery || (p.name + ' official exterior photos'))}`; }
function onlineWebsite(p){ return p.website || `https://www.google.com/search?q=${encodeURIComponent(p.name + ' ' + p.city)}`; }
function cityCount(city){ return PLACES.filter(p => p.city === city).length; }
function status(msg){ const el=document.getElementById('status'); if(el) el.textContent=msg; }

function categoryClass(cat=''){
  const c = String(cat).toLowerCase();
  if (c.includes('casino')) return 'cat-casino';
  if (c.includes('cabaret') || c.includes('drag')) return 'cat-show';
  if (c.includes('gentlemen')) return 'cat-gentlemen';
  if (c.includes('adult')) return 'cat-adult';
  return 'cat-table';
}

function placeArt(p){
  const accent = p.accent || '#ff4fd8';
  const label = p.imageLabel || 'Location-Bild';
  const title = String(p.name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if (p.officialImage) {
    return `<div class="photo-art real-photo" style="--accent:${accent};background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.72)),url('${p.officialImage}')">
      <div class="club-name">${title}</div><div class="art-caption">${label}</div>
    </div>`;
  }
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#071018"/><stop offset=".55" stop-color="${accent}"/><stop offset="1" stop-color="#0b1420"/>
        </linearGradient>
        <radialGradient id="spot" cx=".25" cy=".12" r=".55">
          <stop stop-color="#ffffff" stop-opacity=".6"/><stop offset=".22" stop-color="${accent}" stop-opacity=".45"/><stop offset="1" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="900" height="420" fill="url(#bg)"/>
      <rect width="900" height="420" fill="url(#spot)"/>
      <path d="M0 330 C120 250 210 320 330 235 C480 130 610 255 900 120 L900 420 L0 420 Z" fill="#05070c" opacity=".72"/>
      <g opacity=".42">
        <rect x="60" y="185" width="24" height="170" fill="#ffffff"/>
        <rect x="150" y="130" width="18" height="230" fill="#ffffff"/>
        <rect x="730" y="160" width="22" height="200" fill="#ffffff"/>
        <rect x="805" y="110" width="15" height="250" fill="#ffffff"/>
      </g>
      <g filter="url(#glow)" stroke="#fff" stroke-width="3" opacity=".82">
        <path d="M100 95 L790 95 L825 130 L800 310 L120 310 L80 130 Z" fill="none"/>
        <circle cx="120" cy="330" r="12" fill="${accent}"/>
        <circle cx="190" cy="315" r="10" fill="#46d6e6"/>
        <circle cx="760" cy="310" r="13" fill="#ffc857"/>
      </g>
      <text x="52" y="360" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">${title}</text>
      <text x="52" y="392" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#8ef4ff">${label}</text>
    </svg>`);
  return `<div class="photo-art svg-photo" style="--accent:${accent};background-image:url('data:image/svg+xml,${svg}')">
  </div>`;
}

function scoreBlock(meta) {
  const s = meta?.scores || {};
  return `<div class="score-row">
    <div class="score"><b>Nightlife</b><span>${s.nightlife || '-'}</span></div>
    <div class="score"><b>Safety</b><span>${s.safety || '-'}</span></div>
    <div class="score"><b>Tourist</b><span>${s.tourist || '-'}</span></div>
    <div class="score"><b>Late Food</b><span>${s.lateFood || '-'}</span></div>
  </div>`;
}

function card(p, idx) {
  return `<article class="place ${categoryClass(p.category)}" id="${slug(p.name)}">
    <button class="photo" onclick="selectPlace(${idx})" aria-label="${p.name} auf Karte zeigen">
      ${placeArt(p)}<span class="tier">${p.priority}</span><span class="image-label">${p.imageLabel || 'Location-Bild'}</span>
    </button>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="badges"><span class="badge gold">⭐ ${p.rating || '4.0+'}</span><span class="badge pink">${p.category}</span></div>
      <div class="meta">${p.vibe || ''}<br>${p.address || ''}</div>
      <div class="actions">
        <a href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website / Suche</a>
        <a class="secondary" href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
        <a class="secondary" href="${imageSearch(p)}" target="_blank" rel="noopener">Bilder</a>
        <button type="button" onclick="selectPlace(${idx})">Auf Karte</button>
        <button type="button" class="fav-btn ${isFavorite(idx) ? 'active' : ''}" onclick="toggleFavorite(${idx})">${isFavorite(idx) ? '★ Favorit' : '☆ Merken'}</button>
      </div>
    </div>
  </article>`;
}

function renderCities() {
  const root = document.getElementById('cities');
  if (!root) return;
  if (!PLACES.length) {
    root.innerHTML = `<section class="glass city-section"><h2>Daten konnten nicht geladen werden</h2><p class="vibe">Bitte adultData.js prüfen und /reset.html ausführen.</p></section>`;
    status('Fehler: Keine Locations geladen.');
    return;
  }
  root.innerHTML = CITY_ORDER.map(city => {
    const meta = CITY_META[city] || {};
    const places = PLACES.filter(p => p.city === city);
    return `<section class="glass city-section" id="${slug(city)}">
      <div class="city-top">
        <div class="city-title"><div class="eyebrow">${places.length} Locations · live / offline gespeichert</div><h2>${city}</h2><p class="vibe">${meta.note || ''}</p></div>
        ${scoreBlock(meta)}
      </div>
      <div class="place-grid">${places.map(p => card(p, PLACES.indexOf(p))).join('')}</div>
    </section>`;
  }).join('');
}

function renderFavorites(){
  const main = document.getElementById('cities');
  if (!main || !PLACES.length) return;
  let section = document.getElementById('favorites');
  if (!section) {
    section = document.createElement('section');
    section.id = 'favorites';
    section.className = 'glass city-section favorites-section';
    main.prepend(section);
  }
  const favPlaces = PLACES.filter(p => favorites.has(p.name));
  section.innerHTML = `<div class="city-top">
    <div class="city-title"><div class="eyebrow">${favPlaces.length} gespeicherte Orte</div><h2>Favoriten</h2><p class="vibe">Lokal auf diesem Gerät gespeichert. Funktioniert auch nach dem Neuladen der App.</p></div>
  </div>
  ${favPlaces.length ? `<div class="place-grid">${favPlaces.map(p => card(p, PLACES.indexOf(p))).join('')}</div>` : `<p class="vibe">Noch keine Favoriten gespeichert. Tippe bei einer Location auf „☆ Merken“.</p>`}`;
}

function marker(p, idx){
  if (!p.map) return '';
  const active = activePlace === idx ? ' active' : '';
  const leftLabel = p.map.x > 68 ? ' left-label' : '';
  return `<button class="place-pin ${categoryClass(p.category)}${active}" style="left:${p.map.x}%;top:${p.map.y}%;--accent:${p.accent || '#ff4fd8'}" onclick="selectPlace(${idx})" title="${p.name}" aria-label="${p.name}">
    <span class="pin-core"></span><span class="place-label${leftLabel}">${p.name}<small>${p.city}</small></span>
  </button>`;
}

function cityPin(city){
  const meta = CITY_META[city] || {};
  const pos = meta.map || {x:50,y:50};
  const active = activeCity === city ? ' active' : '';
  return `<button class="city-pin${active}" style="left:${pos.x}%;top:${pos.y}%" onclick="focusCity('${city.replace(/'/g,"\\'")}')">
    <span>${city}</span><small>${cityCount(city)} Orte</small>
  </button>`;
}

function popup(){
  if (activePlace === null || !PLACES[activePlace]) return '';
  const p = PLACES[activePlace];
  return `<aside class="map-popup">
    <button class="popup-close" type="button" onclick="clearPlace()" aria-label="Schließen">×</button>
    <div class="popup-photo">${placeArt(p)}<div class="mini-map-badge">📍 ${activePlace + 1} / ${PLACES.length}</div></div>
    <div class="popup-body">
      <div class="eyebrow">${p.city} · ${p.category}</div><h3>${p.name}</h3>
      <p>${p.vibe || ''}<br>${p.address || ''}</p>
      <div class="actions">
        <a href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
        <a class="secondary" href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website</a>
        <a class="secondary" href="${imageSearch(p)}" target="_blank" rel="noopener">Bilder</a>
        <button type="button" class="fav-btn ${isFavorite(activePlace) ? 'active' : ''}" onclick="toggleFavorite(activePlace)">${isFavorite(activePlace) ? '★ Favorit' : '☆ Merken'}</button>
      </div>
    </div>
  </aside>`;
}


function renderMap(){
  const el = document.getElementById('map');
  if (!el) return;
  const canUseLeaflet = onlineState && window.L && PLACES.length && PLACES.every(p => p.coords);
  if (!canUseLeaflet) {
    el.classList.remove('real-map');
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
      leafletLayer = null;
    }
    renderFallbackMap();
    return;
  }

  el.classList.add('real-map');
  el.innerHTML = '<div id="leafletMap" class="leaflet-map"></div>';
  leafletMap = L.map('leafletMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    preferCanvas: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);

  const shown = activeCity === 'all' ? PLACES : PLACES.filter(p => p.city === activeCity);
  const markers = [];

  shown.forEach((p, idxShown) => {
    const idx = PLACES.indexOf(p);
    const color = p.accent || '#ff4fd8';
    const icon = L.divIcon({
      className: 'route66-leaflet-pin',
      html: `<button class="leaflet-pin-dot" style="--accent:${color}" title="${p.name}"></button>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([p.coords.lat, p.coords.lng], { icon }).addTo(leafletMap);
    marker.bindPopup(`
      <div class="leaflet-popup-card">
        <strong>${p.name}</strong>
        <small>${p.city} · ${p.category}</small>
        <p>${p.address || ''}</p>
        <div class="leaflet-popup-actions">
          <a href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
          <a href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website</a>
          <a href="${imageSearch(p)}" target="_blank" rel="noopener">Bilder</a>
        </div>
      </div>
    `);
    marker.on('click', () => { activePlace = idx; activeCity = p.city; });
    markers.push(marker);
  });

  const routeCoords = CITY_ORDER
    .map(city => {
      const places = PLACES.filter(p => p.city === city && p.coords);
      if (!places.length) return null;
      const lat = places.reduce((s,p)=>s+p.coords.lat,0)/places.length;
      const lng = places.reduce((s,p)=>s+p.coords.lng,0)/places.length;
      return [lat,lng];
    })
    .filter(Boolean);

  if (routeCoords.length > 1) {
    L.polyline(routeCoords, {
      color: '#ff4fd8',
      weight: 4,
      opacity: .75
    }).addTo(leafletMap);
  }

  if (markers.length) {
    const group = L.featureGroup(markers);
    leafletMap.fitBounds(group.getBounds().pad(.16));
  } else {
    leafletMap.setView([36.5, -94.5], 5);
  }
  setTimeout(() => leafletMap && leafletMap.invalidateSize(true), 80);
  setTimeout(() => leafletMap && leafletMap.invalidateSize(true), 400);

  status(`Online-Karte aktiv: ${shown.length} Location-Marker auf OpenStreetMap.`);
}

function renderFallbackMap(){
  const el = document.getElementById('map');
  if (!el) return;
  if (!PLACES.length) {
    el.innerHTML = `<div class="map-error">Keine Locations geladen. Bitte adultData.js prüfen und /reset.html ausführen.</div>`;
    return;
  }
  const cityPoints = CITY_ORDER.map(city => ({city, ...(CITY_META[city]?.map || {x:50,y:50})}));
  const polyline = cityPoints.map(p => `${p.x},${p.y}`).join(' ');
  const shown = activeCity === 'all' ? PLACES : PLACES.filter(p => p.city === activeCity);
  el.innerHTML = `<svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#46d6e6"/></linearGradient></defs>
    <polyline points="${polyline}" fill="none" stroke="url(#routeGrad)" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
  </svg>
  <div class="city-layer">${cityPoints.map(p => cityPin(p.city)).join('')}</div>
  <div class="place-layer">${shown.map(p => marker(p, PLACES.indexOf(p))).join('')}</div>
  <div class="legend"><span><i class="cat-table"></i>Tabledance</span><span><i class="cat-gentlemen"></i>Gentlemen</span><span><i class="cat-show"></i>Show</span><span><i class="cat-casino"></i>Casino</span></div>
  ${popup()}`;
  status(`${onlineState ? 'Online-Modus aktiv' : 'Offline-Modus aktiv'}: ${shown.length} Location-Marker auf der Karte.`);
}

function focusCity(city){ activeCity = city; activePlace = null; renderMap(); document.getElementById(slug(city))?.scrollIntoView({behavior:'smooth', block:'start'}); }
function fitAll(){ activeCity = 'all'; activePlace = null; renderMap(); document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'}); }
function selectPlace(idx){ if (!PLACES[idx]) return; activePlace = idx; activeCity = PLACES[idx].city; renderMap(); document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'}); }
function clearPlace(){ activePlace = null; renderMap(); }
function nearMe(){ alert(onlineState ? 'Online: Google Maps, Websites und Bildersuche öffnen live.' : 'Offline: gespeicherte Ansicht aktiv; externe Links wieder bei Empfang.'); }

function installApp(){
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) return alert('Die App läuft bereits im App-Modus.');
  if (deferredInstallPrompt) { deferredInstallPrompt.prompt(); deferredInstallPrompt.userChoice.finally(()=>deferredInstallPrompt=null); return; }
  if (isIos) return alert('iPhone/iPad: Safari öffnen, Teilen-Button, „Zum Home-Bildschirm“.');
  alert('Im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.');
}

async function checkOnline(){
  try { await fetch('./manifest.webmanifest?ping=' + Date.now(), {cache:'no-store'}); onlineState = true; }
  catch(e){ onlineState = navigator.onLine; }
  document.body.classList.toggle('is-offline', !onlineState);
  document.body.classList.toggle('is-online', onlineState);
  renderMap();
}

function init(){
  try {
    renderCities();
    renderFavorites();
    renderMap();
    checkOnline();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js?v=15').catch(()=>{});
  } catch (err) {
    console.error(err);
    status('JavaScript-Fehler: ' + err.message);
    const map = document.getElementById('map');
    if (map) map.innerHTML = `<div class="map-error">JavaScript-Fehler: ${err.message}</div>`;
  }
}
window.addEventListener('online', checkOnline);
window.addEventListener('offline', checkOnline);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredInstallPrompt = event; document.body.classList.add('can-install'); status('App installierbar. Button „App installieren“ verwenden.'); });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; document.body.classList.remove('can-install'); status('App wurde installiert.'); });

window.nearMe = nearMe; window.fitAll = fitAll; window.focusCity = focusCity; window.selectPlace = selectPlace; window.clearPlace = clearPlace; window.installApp = installApp; window.toggleFavorite = toggleFavorite;
document.addEventListener('DOMContentLoaded', init);
