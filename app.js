const DAYS = window.ADULT_DAYS || [];
const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
const CITIES = [...new Set(PLACES.map(p => p.city))];
let selectedCity = localStorage.getItem('selectedAfterDarkCity') || CITIES[0] || '';
let map, service, infoWindow;
let resolvedPlaces = [];
let markers = [];
const cacheKey = 'route66AfterDarkResolvedProV7';

const BLOCKED_PLACE_PATTERNS = [/jaguar\s*land\s*rover/i, /3905\s+s\.?\s+memorial/i, /car\s+dealer/i, /auto/i];
const LIGHT_MAP_STYLES = [
  { featureType: 'all', elementType: 'all', stylers: [{ saturation: -10 }, { lightness: 35 }] },
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#edf2f7' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] }
];

function maps(q, placeId='') {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  return placeId ? `${base}&query_place_id=${placeId}` : base;
}
function websiteLink(p) { return p.website || maps(p.query || p.name, p.placeId || ''); }
function citySlug(city) { return String(city).trim().toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''); }
function esc(value) { return String(value ?? '').replace(/[&<>'\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch])); }
function isBlockedPlace(p) {
  const text = `${p.name || ''} ${p.resolvedName || ''} ${p.formattedAddress || ''} ${p.address || ''}`;
  return BLOCKED_PLACE_PATTERNS.some(rx => rx.test(text));
}
function uniquePlaces(list) {
  const seen = new Set();
  return list.filter(p => {
    if (isBlockedPlace(p)) return false;
    const key = `${p.name}|${p.city}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function placesForCity(city) {
  const source = resolvedPlaces.length ? resolvedPlaces : PLACES;
  return uniquePlaces(source.filter(p => p.city === city));
}
function setLazyBackgrounds(scope = document) {
  const items = [...scope.querySelectorAll('[data-bg]')];
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => { el.style.backgroundImage = el.dataset.bg; el.removeAttribute('data-bg'); });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.backgroundImage = el.dataset.bg;
      el.removeAttribute('data-bg');
      el.classList.add('loaded');
      observer.unobserve(el);
    });
  }, { rootMargin: '280px 0px' });
  items.forEach(el => observer.observe(el));
}
function status(msg) { const el = document.getElementById('status'); if (el) el.textContent = msg; }

function markerColor(p, isSelected) {
  if (p.priority === 'Pflichtmarker') return '#f59e0b';
  if (p.priority === 'Special') return '#c026d3';
  return isSelected ? '#0284c7' : '#64748b';
}
function markerIcon(p, isSelected) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: markerColor(p, isSelected),
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: p.priority === 'Pflichtmarker' ? 10 : 8
  };
}
function popup(p) {
  const q = p.query || `${p.name} ${p.city}`;
  return `<div style="max-width:280px;color:#111;font-family:Arial,sans-serif">
    <h3 style="margin:0 0 8px">${esc(p.name)}</h3>
    <p><strong>${esc(p.city)}</strong> · ${esc(p.priority)}</p>
    <p>${esc(p.vibe || '')}</p>
    <p>⭐ ${esc(p.rating || 'n/a')} ${p.ratingsTotal ? '(' + esc(p.ratingsTotal) + ')' : ''}</p>
    <p>${esc(p.formattedAddress || p.address || '')}</p>
    <a href="${maps(q, p.placeId || '')}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;padding:8px 10px;border-radius:999px;background:#1a73e8;color:white;text-decoration:none;font-weight:700">Google Maps</a>
    <a href="${websiteLink(p)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;margin-left:6px;padding:8px 10px;border-radius:999px;background:#111827;color:white;text-decoration:none;font-weight:700">Website</a>
  </div>`;
}
function resolveOne(raw) {
  return new Promise(resolve => {
    const query = raw.query || `${raw.name} ${raw.city}`;
    service.findPlaceFromQuery({
      query,
      fields: ['name','geometry','formatted_address','place_id','rating','user_ratings_total','business_status','photos']
    }, (results, resultStatus) => {
      if (resultStatus === google.maps.places.PlacesServiceStatus.OK && results && results[0]?.geometry) {
        const r = results[0];
        const photo = r.photos && r.photos[0] ? r.photos[0].getUrl({maxWidth: 1200, maxHeight: 800}) : raw.image;
        resolve({ ...raw, resolvedName: r.name || raw.name, lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), formattedAddress: r.formatted_address || raw.address || '', placeId: r.place_id || '', rating: r.rating || raw.rating || '', ratingsTotal: r.user_ratings_total || '', businessStatus: r.business_status || '', image: photo || raw.image });
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
      resolvedPlaces = uniquePlaces(JSON.parse(cached));
      status(`Google Places Cache geladen: ${resolvedPlaces.filter(p => p.lat).length} Orte`);
      return;
    } catch(e) {}
  }
  resolvedPlaces = [];
  for (let i = 0; i < PLACES.length; i++) {
    status(`Google Places: ${i + 1} / ${PLACES.length}`);
    const resolved = await resolveOne(PLACES[i]);
    if (!isBlockedPlace(resolved)) resolvedPlaces.push(resolved);
    await new Promise(r => setTimeout(r, 130));
  }
  resolvedPlaces = uniquePlaces(resolvedPlaces);
  localStorage.setItem(cacheKey, JSON.stringify(resolvedPlaces));
  status(`Fertig: ${resolvedPlaces.filter(p => p.lat).length} Orte gefunden`);
}

function renderCityNav() {
  const nav = document.getElementById('city-nav');
  if (!nav) return;
  nav.innerHTML = CITIES.map(city => `<a class="${city === selectedCity ? 'active' : ''}" href="#city-${citySlug(city)}" onclick="selectCity('${esc(city)}', true)">${esc(city)}</a>`).join('');
}
function renderPicks() {
  const picks = document.getElementById('picks');
  picks.innerHTML = CITIES.map(city => {
    const meta = CITY_META[city] || {};
    const places = placesForCity(city);
    const first = places.find(p => p.priority === 'Pflichtmarker') || places[0];
    return `<button type="button" class="pick ${city === selectedCity ? 'active' : ''}" onclick="selectCity('${esc(city)}', true)"><b>${esc(city)}</b><span>${places.length} Lokalitäten · Top: ${esc(first?.name || 'TBD')}</span><div class="badges"><span class="badge gold">Score ${esc(meta.scores?.nightlife || '-')}/10</span><span class="badge">${esc(meta.hotel || '')}</span></div></button>`;
  }).join('');
}
function card(p, idx) {
  const img = p.image || PLACES.find(x => x.name === p.name)?.image || '';
  const detailsId = `details-${citySlug(p.name)}-${idx}`;
  const bg = `linear-gradient(135deg,rgba(70,214,230,.20),rgba(255,79,216,.16)),url('${img}')`;
  return `<article class="place">
    <div class="photo lazy-bg" data-bg="${esc(bg)}" role="img" aria-label="${esc(p.name)}"><span class="tier">${esc(p.priority)}</span></div>
    <div class="body">
      <h3>${esc(p.name)}</h3>
      <div class="badges"><span class="badge gold">⭐ ${esc(p.rating || '4.0+')}</span><span class="badge pink">${esc(p.category)}</span></div>
      <div class="meta">Dresscode: ${esc(p.dress || 'Casual gepflegt')}<br>Beste Zeit: ${esc(p.bestTime || '22:00–01:00')}<br>${esc(p.formattedAddress || p.address || '')}</div>
      <div class="details" id="${detailsId}"><b>Hinweis:</b> Vor Ort aktuelle Öffnungszeiten, Eintritt, Dresscode und Altersregel prüfen. ID mitnehmen und sicher per Rideshare/Taxi planen.</div>
      <div class="actions">
        <a href="${maps(p.query || p.name, p.placeId || '')}" target="_blank" rel="noopener">Google Maps</a>
        <a href="${websiteLink(p)}" target="_blank" rel="noopener">Website</a>
        <button type="button" aria-expanded="false" aria-controls="${detailsId}" onclick="toggleDetails(this)">Details</button>
      </div>
    </div>
  </article>`;
}
function renderCitySections() {
  const root = document.getElementById('days');
  root.innerHTML = CITIES.map(city => {
    const meta = CITY_META[city] || {};
    const places = placesForCity(city);
    const summary = city === 'Chicago' || city === 'Austin' ? 'Alle Abende zusammengefasst' : (DAYS.filter(d => d.city === city).map(d => d.label).join(' · ') || 'Route 66');
    return `<section class="glass day city-section" id="city-${citySlug(city)}">
      <div class="date">${esc(summary)}</div>
      <h2 class="city">${esc(city)}</h2>
      <p class="vibe">${esc(meta.hotel ? 'Hotel: ' + meta.hotel : 'Ausgewählte Lokalitäten')}</p>
      <div class="place-grid">${places.map((p, idx) => card(p, idx)).join('')}</div>
    </section>`;
  }).join('');
  setLazyBackgrounds(root);
}
function renderMarkers(city = selectedCity) {
  if (!map) return;
  markers.forEach(m => m.setMap(null));
  markers = [];
  const bounds = new google.maps.LatLngBounds();
  const places = city === 'all' ? uniquePlaces(resolvedPlaces.length ? resolvedPlaces : PLACES) : placesForCity(city);
  places.forEach(p => {
    if (!p.lat || !p.lng) return;
    const marker = new google.maps.Marker({ map, title: p.name, position: {lat: p.lat, lng: p.lng}, icon: markerIcon(p, p.city === selectedCity), animation: p.city === selectedCity ? google.maps.Animation.DROP : null });
    marker.addListener('click', () => { infoWindow.setContent(popup(p)); infoWindow.open(map, marker); });
    markers.push(marker); bounds.extend(marker.getPosition());
  });
  if (!bounds.isEmpty()) map.fitBounds(bounds, {top: 72, right: 42, bottom: 42, left: 42});
  const label = city === 'all' ? 'Alle Städte' : city;
  status(`${markers.length} Marker · ${label}`);
  const countEl = document.getElementById('map-count');
  if (countEl) countEl.textContent = `${markers.length} Spots · ${label}`;
}
function selectCity(city, scroll = false) {
  selectedCity = city;
  localStorage.setItem('selectedAfterDarkCity', city);
  renderCityNav();
  renderPicks();
  renderMarkers(city);
  if (scroll) document.getElementById(`city-${citySlug(city)}`)?.scrollIntoView({behavior:'smooth', block:'start'});
}
function fitAll() { selectedCity = 'all'; renderMarkers('all'); renderCityNav(); }
function toggleMode() {
  document.body.classList.toggle('light');
  localStorage.setItem('afterDarkMode', document.body.classList.contains('light') ? 'light' : 'dark');
}
function clearAppCache() { localStorage.removeItem(cacheKey); location.reload(); }
function toggleDetails(btn) {
  const card = btn.closest('.place');
  const isOpen = card.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
}
function renderApp() { renderCityNav(); renderPicks(); renderCitySections(); renderMarkers(selectedCity && selectedCity !== 'all' ? selectedCity : CITIES[0]); }
function initMap() {
  if (localStorage.getItem('afterDarkMode') === 'light') document.body.classList.add('light');
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.5, lng: -94.5}, zoom: 5, mapTypeId: google.maps.MapTypeId.ROADMAP, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: 'greedy', clickableIcons: false, backgroundColor: '#f8fafc', styles: LIGHT_MAP_STYLES
  });
  service = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  renderApp();
  resolvePlaces().then(renderApp);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js?v=pro7').catch(() => {});
}
window.initMap = initMap;
window.toggleMode = toggleMode;
window.clearAppCache = clearAppCache;
window.toggleDetails = toggleDetails;
window.selectCity = selectCity;
window.fitAll = fitAll;
