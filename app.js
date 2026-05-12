const GOOGLE_MAPS_API_KEY = 'AIzaSyA8644C1bG05JivRoEANWGzN4Tir4tnLvY';
const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
const CITY_ORDER = window.CITY_ORDER || [...new Set(PLACES.map(p => p.city))];
const TRIP_STOPS = window.TRIP_STOPS || [];
const cacheKey = 'route66AfterDarkResolvedPlacesV3';

let map, service, infoWindow, userMarker;
let resolvedPlaces = [];
let markers = [];
let deferredInstallPrompt = null;
let activeCity = 'all';
let googleMapsLoading = false;

function slug(city){ return String(city).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function status(msg){ const el = document.getElementById('status'); if (el) el.textContent = msg; }
function maps(q, placeId='') {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  return placeId ? `${base}&query_place_id=${placeId}` : base;
}
function isOnline(){ return navigator.onLine !== false; }

function registerServiceWorker(){
  if (!('serviceWorker' in navigator)) {
    status('Service Worker wird von diesem Browser nicht unterstützt.');
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        document.body.classList.add('sw-ready');
        if (reg.active) status(isOnline() ? 'Offline-App bereit. Live-Karte wird bei Internet geladen.' : 'Offline-App bereit.');
      })
      .catch(() => status('Service Worker konnte nicht registriert werden. Bitte über HTTPS oder localhost öffnen.'));
  });
}

function renderTripPlan() {
  const root = document.getElementById('trip-plan');
  if (!root || !TRIP_STOPS.length) return;
  root.innerHTML = TRIP_STOPS.map((stop, index) => {
    const isDeparture = /abreise/i.test(stop.type || stop.hotel || '');
    const href = stop.anchor ? `#${stop.anchor}` : `#${slug(stop.city)}`;
    return `<a class="trip-card${isDeparture ? ' departure' : ''}" href="${href}">
      <span class="trip-step">${String(index + 1).padStart(2,'0')}</span>
      <span class="trip-date">${stop.weekday ? stop.weekday + ' · ' : ''}${stop.date}</span>
      <strong>${stop.city}</strong>
      <em>${stop.hotel}</em>
      <small>${stop.type || ''}</small>
    </a>`;
  }).join('');
}

function cityTripLine(city) {
  const stops = TRIP_STOPS.filter(s => s.city === city);
  if (!stops.length) return '';
  return `<div class="city-trip">${stops.map(s => `<span>${s.date} · ${s.hotel}</span>`).join('')}</div>`;
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

function card(p) {
  const isRemote = /^https?:\/\//i.test(p.image || '');
  const imgStyle = isOnline() && isRemote ? `background-image:linear-gradient(135deg,rgba(70,214,230,.26),rgba(255,79,216,.18)),url('${p.image}')` : '';
  return `<article class="place">
    <div class="photo ${imgStyle ? '' : 'offline-photo'}" style="${imgStyle}"><span class="tier">${p.priority}</span></div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="badges"><span class="badge gold">⭐ ${p.rating || '4.0+'}</span><span class="badge pink">${p.category}</span></div>
      <div class="meta">${p.vibe || ''}<br>${p.formattedAddress || p.address || ''}</div>
      <div class="actions">
        <a href="${p.website || maps(p.query || p.name)}" target="_blank" rel="noopener">Website</a>
        <a class="secondary" href="${maps(p.query || p.name, p.placeId || '')}" target="_blank" rel="noopener">Google Maps</a>
      </div>
    </div>
  </article>`;
}

function renderCities() {
  const root = document.getElementById('cities');
  if (!root) return;
  const source = resolvedPlaces.length ? resolvedPlaces : PLACES;
  root.innerHTML = CITY_ORDER.map(city => {
    const meta = CITY_META[city] || {};
    const places = source.filter(p => p.city === city);
    return `<section class="glass city-section" id="${slug(city)}">
      <div class="city-top">
        <div class="city-title">
          <div class="eyebrow">${places.length} Locations · ${isOnline() ? 'Online/Offline' : 'Offline'}</div>
          <h2>${city}</h2>
          ${cityTripLine(city)}
          <p class="vibe">${meta.note || ''}</p>
        </div>
        ${scoreBlock(meta)}
      </div>
      <div class="place-grid">${places.map(card).join('')}</div>
    </section>`;
  }).join('');
}

function renderOfflineMap(city = activeCity) {
  const mapEl = document.getElementById('map');
  if (!mapEl || window.google?.maps) return;
  mapEl.classList.add('offline-map');
  const positions = {
    'Chicago': [14, 23],
    'St. Louis': [34, 39],
    'Tulsa': [53, 53],
    'Lawton': [68, 68],
    'Austin': [84, 82]
  };
  const cities = city === 'all' ? CITY_ORDER : CITY_ORDER.filter(c => c === city);
  mapEl.innerHTML = `
    <svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M10 20 C25 26, 30 34, 39 42 S58 56, 66 66 S78 78, 90 84" fill="none" stroke="rgba(70,214,230,.35)" stroke-width="6" stroke-linecap="round"/>
      <path d="M10 20 C25 26, 30 34, 39 42 S58 56, 66 66 S78 78, 90 84" fill="none" stroke="rgba(255,200,87,.85)" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/>
    </svg>
    ${cities.map(c => {
      const [left, top] = positions[c] || [50, 50];
      const count = PLACES.filter(p => p.city === c).length;
      return `<button class="offline-pin ${c === city ? 'active' : ''}" style="left:${left}%;top:${top}%" onclick="focusCity('${c.replace(/'/g, "\\'")}')" aria-label="${c}"><span class="pin-dot"></span><span class="pin-label">${c}<small>${count} Locations</small></span></button>`;
    }).join('')}
    <div class="offline-map-note"><strong>Offline-Karte aktiv.</strong><br>Die Städte und Locations sind lokal gespeichert. Sobald Internet verfügbar ist, lädt die Live Google Map automatisch.</div>`;
  status(isOnline() ? 'Offline-Karte aktiv. Live-Karte wird geladen…' : 'Offline verfügbar: Reiseplan, Städte und Locations sind lokal gespeichert.');
}

function popup(p) {
  const q = p.query || `${p.name} ${p.city}`;
  return `<div style="max-width:280px;color:#111">
    <h3 style="margin:0 0 8px">${p.resolvedName || p.name}</h3>
    <p><strong>${p.city}</strong> · ${p.priority}</p>
    <p>${p.vibe || ''}</p>
    <p>⭐ ${p.rating || 'n/a'} ${p.ratingsTotal ? '(' + p.ratingsTotal + ')' : ''}</p>
    <p>${p.formattedAddress || p.address || ''}</p>
    <a href="${maps(q, p.placeId || '')}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;padding:8px 10px;border-radius:999px;background:#1a73e8;color:white;text-decoration:none;font-weight:700">Google Maps</a>
  </div>`;
}

function markerIcon(p) {
  const color = p.priority === 'Pflichtmarker' ? '#ffc857' : p.priority === 'Special' ? '#ff4fd8' : '#1a73e8';
  return { path: google.maps.SymbolPath.CIRCLE, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: p.priority === 'Pflichtmarker' ? 10 : 8 };
}

function isBadPlaceResult(raw, result){
  const address = (result.formatted_address || '').toLowerCase();
  const name = (result.name || '').toLowerCase();
  return raw.city === 'Tulsa' && (address.includes('3905 s memorial') || name.includes('jaguar tulsa'));
}

function resolveOne(raw) {
  return new Promise(resolve => {
    const query = raw.query || `${raw.name} ${raw.city}`;
    service.findPlaceFromQuery({
      query,
      fields: ['name','geometry','formatted_address','place_id','rating','user_ratings_total','business_status','photos']
    }, (results, resultStatus) => {
      const good = (results || []).find(r => r?.geometry && !isBadPlaceResult(raw, r));
      if (resultStatus === google.maps.places.PlacesServiceStatus.OK && good?.geometry) {
        const photo = good.photos && good.photos[0] ? good.photos[0].getUrl({maxWidth: 1200, maxHeight: 800}) : raw.image;
        resolve({...raw, resolvedName: good.name || raw.name, lat: good.geometry.location.lat(), lng: good.geometry.location.lng(), formattedAddress: good.formatted_address || raw.address || '', placeId: good.place_id || '', rating: good.rating || raw.rating || '', ratingsTotal: good.user_ratings_total || '', businessStatus: good.business_status || '', image: photo || raw.image});
      } else {
        resolve({...raw, error: resultStatus || 'NO_RESULT'});
      }
    });
  });
}

async function resolvePlaces() {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      resolvedPlaces = JSON.parse(cached);
      status(`Google Places Cache geladen: ${resolvedPlaces.filter(p => p.lat).length} Orte`);
      renderMarkers(activeCity); renderCities(); return;
    } catch(e) {}
  }
  if (!isOnline()) { renderOfflineMap(activeCity); return; }
  resolvedPlaces = [];
  for (let i = 0; i < PLACES.length; i++) {
    status(`Google Places online: ${i + 1} / ${PLACES.length}`);
    resolvedPlaces.push(await resolveOne(PLACES[i]));
    await new Promise(r => setTimeout(r, 120));
  }
  localStorage.setItem(cacheKey, JSON.stringify(resolvedPlaces));
  status(`Fertig: ${resolvedPlaces.filter(p => p.lat).length} Orte gefunden`);
  renderMarkers(activeCity); renderCities();
}

function renderMarkers(city='all') {
  if (!map || !window.google?.maps) return;
  markers.forEach(m => m.setMap(null)); markers = [];
  const bounds = new google.maps.LatLngBounds();
  (resolvedPlaces.length ? resolvedPlaces : PLACES).forEach(p => {
    if (!p.lat || !p.lng) return;
    if (city !== 'all' && p.city !== city) return;
    const marker = new google.maps.Marker({map, title:p.name, position:{lat:p.lat,lng:p.lng}, icon:markerIcon(p)});
    marker.addListener('click', () => { infoWindow.setContent(popup(p)); infoWindow.open(map, marker); });
    markers.push(marker); bounds.extend(marker.getPosition());
  });
  if (!bounds.isEmpty()) map.fitBounds(bounds, {top:70,right:40,bottom:40,left:40});
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.google?.maps) { renderOfflineMap(activeCity); return; }
  mapEl.classList.remove('offline-map');
  mapEl.innerHTML = '';
  map = new google.maps.Map(mapEl, {
    center: {lat: 38.5, lng: -94.5}, zoom: 5, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, styles: []
  });
  service = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  resolvePlaces();
}

function loadGoogleMaps() {
  if (!isOnline() || googleMapsLoading || window.google?.maps) return;
  googleMapsLoading = true;
  status('Internet erkannt. Live Google Map wird geladen…');
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => { googleMapsLoading = false; renderOfflineMap(activeCity); };
  document.head.appendChild(script);
}

function fitAll(){
  activeCity = 'all';
  if (map && window.google?.maps) renderMarkers('all'); else renderOfflineMap('all');
  document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'});
}

function focusCity(city){
  activeCity = city;
  if (map && window.google?.maps) {
    renderMarkers(city);
    const meta = CITY_META[city];
    if (meta?.center) { map.setCenter(meta.center); map.setZoom(city === 'Austin' || city === 'Chicago' ? 11 : 12); }
  } else {
    renderOfflineMap(city);
  }
  const target = document.getElementById(slug(city));
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
}

function nearMe(){
  if (!isOnline() || !map || !window.google?.maps) return alert('Near Me braucht Internet und die Live Google Map. Offline sind Reiseplan und Locations verfügbar.');
  if (!navigator.geolocation) return alert('Geo-Location wird von diesem Browser nicht unterstützt.');
  navigator.geolocation.getCurrentPosition(pos => {
    const loc = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({position: loc, map, title:'Du bist hier'});
    map.setCenter(loc); map.setZoom(13);
  }, () => alert('Standort konnte nicht gelesen werden.'));
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); deferredInstallPrompt = event; document.body.classList.add('can-install'); status('App bereit. Du kannst sie jetzt installieren.');
});
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; document.body.classList.remove('can-install'); status('App wurde installiert.'); });
function installApp(){
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) return alert('Die App ist bereits installiert bzw. läuft im App-Modus.');
  if (deferredInstallPrompt) { deferredInstallPrompt.prompt(); deferredInstallPrompt.userChoice.finally(() => { deferredInstallPrompt = null; }); return; }
  if (isIos) return alert('iPhone/iPad: In Safari öffnen, Teilen-Button antippen und „Zum Home-Bildschirm“ wählen.');
  alert('Im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen. Auf GitHub Pages funktioniert das über HTTPS.');
}

window.initMap = initMap;
window.nearMe = nearMe;
window.fitAll = fitAll;
window.focusCity = focusCity;
window.installApp = installApp;

window.addEventListener('online', () => { status('Wieder online. Live-Karte wird geladen…'); renderCities(); loadGoogleMaps(); });
window.addEventListener('offline', () => { status('Offline-Modus aktiv. Lokale Daten bleiben verfügbar.'); renderCities(); renderOfflineMap(activeCity); });

document.addEventListener('DOMContentLoaded', () => {
  renderTripPlan();
  renderCities();
  renderOfflineMap('all');
  registerServiceWorker();
  if (isOnline()) loadGoogleMaps();
});
