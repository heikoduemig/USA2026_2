const DAYS = window.ADULT_DAYS || [];
const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
let selectedDayId = localStorage.getItem('selectedAfterDarkDay') || (DAYS[0] && DAYS[0].id) || '';
let map, service, infoWindow, userMarker;
let resolvedPlaces = [];
let markers = [];
const cacheKey = 'route66AfterDarkResolvedProV4';

function maps(q, placeId='') {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  return placeId ? `${base}&query_place_id=${placeId}` : base;
}
function uber(q) {
  return `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(q)}`;
}
function foodSearch(city) {
  return maps(`late night food ${city}`);
}
function weatherSearch(city) {
  return `https://www.google.com/search?q=${encodeURIComponent('weather ' + city)}`;
}
function selectedDay() {
  return DAYS.find(d => d.id === selectedDayId) || DAYS[0];
}
function status(msg) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}
function safeId(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
}
function esc(value) {
  return String(value ?? '').replace(/[&<>'\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));
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
function dayPlaces(day) {
  const picks = day?.picks || [];
  const source = resolvedPlaces.length ? resolvedPlaces : PLACES;
  return source.filter(p => picks.includes(p.name));
}
function placeMatchesDay(p, day) {
  return p.city === day.city || (day.picks || []).includes(p.name);
}
function markerColor(p, isDay) {
  if (p.priority === 'Pflichtmarker') return '#ffc857';
  if (p.priority === 'Special') return '#ff4fd8';
  return isDay ? '#46d6e6' : '#607d8b';
}
function markerIcon(p, isDay) {
  const color = markerColor(p, isDay);
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: p.priority === 'Pflichtmarker' ? 10 : 8
  };
}
function popup(p) {
  const q = p.query || `${p.name} ${p.city}`;
  return `<div style="max-width:280px;color:#111">
    <h3 style="margin:0 0 8px">${esc(p.name)}</h3>
    <p><strong>${esc(p.city)}</strong> · ${esc(p.priority)}</p>
    <p>${esc(p.vibe || '')}</p>
    <p>⭐ ${esc(p.rating || 'n/a')} ${p.ratingsTotal ? '(' + esc(p.ratingsTotal) + ')' : ''}</p>
    <p>${esc(p.formattedAddress || p.address || '')}</p>
    <a href="${maps(q, p.placeId || '')}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;padding:8px 10px;border-radius:999px;background:#1a73e8;color:white;text-decoration:none;font-weight:700">Google Maps</a>
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
        resolve({
          ...raw,
          resolvedName: r.name || raw.name,
          lat: r.geometry.location.lat(),
          lng: r.geometry.location.lng(),
          formattedAddress: r.formatted_address || raw.address || '',
          placeId: r.place_id || '',
          rating: r.rating || raw.rating || '',
          ratingsTotal: r.user_ratings_total || '',
          businessStatus: r.business_status || '',
          image: photo || raw.image
        });
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
      return;
    } catch(e) {}
  }
  resolvedPlaces = [];
  for (let i = 0; i < PLACES.length; i++) {
    status(`Google Places: ${i + 1} / ${PLACES.length}`);
    resolvedPlaces.push(await resolveOne(PLACES[i]));
    await new Promise(r => setTimeout(r, 130));
  }
  localStorage.setItem(cacheKey, JSON.stringify(resolvedPlaces));
  status(`Fertig: ${resolvedPlaces.filter(p => p.lat).length} Orte gefunden`);
}
function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = DAYS.map(d => `<button type="button" class="${d.id === selectedDayId ? 'active' : ''}" data-id="${esc(d.id)}" aria-selected="${d.id === selectedDayId}">${esc(d.label)} · ${esc(d.city)}</button>`).join('');
  tabs.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDayId = btn.dataset.id;
      localStorage.setItem('selectedAfterDarkDay', selectedDayId);
      renderApp();
      const target = document.getElementById('day-' + selectedDayId);
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}
function scoreBlock(meta) {
  const s = meta?.scores || {nightlife:'-',safety:'-',tourist:'-',lateFood:'-'};
  return `<div class="score-row">
    <div class="score"><b>Nightlife</b><span>${s.nightlife}</span></div>
    <div class="score"><b>Safety</b><span>${s.safety}</span></div>
    <div class="score"><b>Tourist</b><span>${s.tourist}</span></div>
    <div class="score"><b>Late Food</b><span>${s.lateFood}</span></div>
  </div>`;
}
function card(p, idx, city) {
  const img = p.image || PLACES.find(x => x.name === p.name)?.image || '';
  const galleryImgs = [
    img,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=75',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=75'
  ].filter(Boolean);
  const detailsId = `details-${safeId(p.name)}-${idx}`;
  const bg = `linear-gradient(135deg,rgba(70,214,230,.35),rgba(255,79,216,.28)),url('${img}')`;
  return `<article class="place">
    <div class="photo lazy-bg" data-bg="${esc(bg)}" role="img" aria-label="${esc(p.name)}"><span class="tier">${esc(p.priority)}</span></div>
    <div class="body">
      <h3>${esc(p.name)}</h3>
      <div class="badges"><span class="badge gold">⭐ ${esc(p.rating || '4.0+')}</span><span class="badge pink">${esc(p.category)}</span></div>
      <div class="meta">Dresscode: ${esc(p.dress || 'Casual gepflegt')}<br>Beste Zeit: ${esc(p.bestTime || '22:00–01:00')}<br>${esc(p.formattedAddress || p.address || '')}</div>
      <div class="details" id="${detailsId}"><b>Touristen-Hinweis:</b> Vor Ort aktuelle Öffnungszeiten, Eintritt, Dresscode und Altersregel prüfen. ID mitnehmen und am besten Rideshare nutzen.
        <div class="gallery">${galleryImgs.map(g => `<div class="lazy-bg" data-bg="url('${esc(g)}')" role="img" aria-label="Galeriebild ${esc(p.name)}"></div>`).join('')}</div>
      </div>
      <div class="actions">
        <a href="${maps(p.query || p.name, p.placeId || '')}" target="_blank" rel="noopener">Google Maps</a>
        <a href="${uber(p.query || p.name)}" target="_blank" rel="noopener">Uber</a>
        <a href="${foodSearch(city)}" target="_blank" rel="noopener">Afterparty Food</a>
        <a href="${weatherSearch(city)}" target="_blank" rel="noopener">Live Weather</a>
        <button type="button" aria-expanded="false" aria-controls="${detailsId}" onclick="toggleDetails(this)">Details</button>
      </div>
    </div>
  </article>`;
}
function renderDaySections() {
  const days = document.getElementById('days');
  days.innerHTML = DAYS.map(day => {
    const meta = CITY_META[day.city] || {};
    const places = dayPlaces(day);
    return `<section class="glass day" id="day-${esc(day.id)}">
      <div class="anchor" id="${safeId(day.city)}"></div>
      <div class="date">${esc(day.label)} · ${esc(day.title)}</div>
      <h2 class="city">${esc(day.city)}</h2>
      <p class="vibe">${esc(day.note)}</p>
      ${scoreBlock(meta)}
      <div class="place-grid">${places.map((p, idx) => card(p, idx, day.city)).join('')}</div>
    </section>`;
  }).join('');
  setLazyBackgrounds(days);
}
function renderPicks() {
  const picks = document.getElementById('picks');
  const cities = [...new Set(DAYS.map(d => d.city))];
  picks.innerHTML = cities.map(city => {
    const meta = CITY_META[city] || {};
    const first = (resolvedPlaces.length ? resolvedPlaces : PLACES).find(p => p.city === city && p.priority === 'Pflichtmarker') || PLACES.find(p => p.city === city);
    return `<div class="pick"><b>${esc(city)}: ${esc(first?.name || 'TBD')}</b><div class="badges"><span class="badge gold">⭐ ${esc(first?.rating || '4.0+')}</span><span class="badge">${esc(first?.vibe || '')}</span><span class="badge pink">Score ${esc(meta.scores?.nightlife || '-')}/10</span></div></div>`;
  }).join('');
}
function renderMarkers(filter='all') {
  if (!map) return;
  markers.forEach(m => m.setMap(null));
  markers = [];
  const bounds = new google.maps.LatLngBounds();
  const day = selectedDay();
  resolvedPlaces.forEach(p => {
    if (!p.lat || !p.lng) return;
    if (filter === 'day' && !placeMatchesDay(p, day)) return;
    if (filter === 'top' && p.priority !== 'Pflichtmarker') return;
    if (filter === 'rated' && Number(p.rating || 0) < 4.2) return;
    const isDay = placeMatchesDay(p, day);
    const marker = new google.maps.Marker({
      map,
      title: p.name,
      position: {lat: p.lat, lng: p.lng},
      icon: markerIcon(p, isDay),
      animation: isDay ? google.maps.Animation.DROP : null
    });
    marker.addListener('click', () => {
      infoWindow.setContent(popup(p));
      infoWindow.open(map, marker);
    });
    markers.push(marker);
    bounds.extend(marker.getPosition());
  });
  if (!bounds.isEmpty()) map.fitBounds(bounds, {top: 80, right: 40, bottom: 40, left: 40});
}
function bindMapControls() {
  document.querySelectorAll('[data-map-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-map-filter]').forEach(b => b.classList.toggle('active', b === btn));
      renderMarkers(btn.dataset.mapFilter);
    });
  });
}
function fitAll() { renderMarkers('all'); }
function focusCity(city) {
  const meta = CITY_META[city];
  if (meta?.center) map.setCenter(meta.center), map.setZoom(city === 'Austin' || city === 'Chicago' ? 11 : 12);
}
function nearMe() {
  if (!navigator.geolocation) return alert('Geo-Location wird von diesem Browser nicht unterstützt.');
  navigator.geolocation.getCurrentPosition(pos => {
    const loc = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({position: loc, map, title:'Du bist hier'});
    map.setCenter(loc); map.setZoom(13);
  }, () => alert('Standort konnte nicht gelesen werden.'));
}
function toggleMode() {
  document.body.classList.toggle('light');
  localStorage.setItem('afterDarkMode', document.body.classList.contains('light') ? 'light' : 'dark');
}
function clearAppCache() {
  localStorage.removeItem(cacheKey);
  location.reload();
}
function toggleDetails(btn) {
  const card = btn.closest('.place');
  const isOpen = card.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
}
function renderApp() {
  renderTabs();
  renderPicks();
  renderDaySections();
  renderMarkers('all');
}
function initMap() {
  if (localStorage.getItem('afterDarkMode') === 'light') document.body.classList.add('light');
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.5, lng: -94.5},
    zoom: 5,
    mapId: undefined,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    styles: [
      {elementType:'geometry',stylers:[{color:'#071018'}]},
      {elementType:'labels.text.stroke',stylers:[{color:'#071018'}]},
      {elementType:'labels.text.fill',stylers:[{color:'#8ef4ff'}]},
      {featureType:'road',elementType:'geometry',stylers:[{color:'#1b2b38'}]},
      {featureType:'water',elementType:'geometry',stylers:[{color:'#05131f'}]},
      {featureType:'poi',elementType:'labels.text.fill',stylers:[{color:'#ffb4ef'}]},
      {featureType:'administrative',elementType:'geometry.stroke',stylers:[{color:'#274b59'}]}
    ]
  });
  service = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  bindMapControls();
  renderApp();
  resolvePlaces().then(renderApp);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js?v=pro4').catch(() => {});
  }
}
window.initMap = initMap;
window.toggleMode = toggleMode;
window.nearMe = nearMe;
window.fitAll = fitAll;
window.focusCity = focusCity;
window.clearAppCache = clearAppCache;

window.toggleDetails = toggleDetails;
