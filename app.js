const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
const CITY_ORDER = window.CITY_ORDER || [...new Set(PLACES.map(p => p.city))];

let map, service, infoWindow, userMarker;
let resolvedPlaces = [];
let markers = [];
const cacheKey = 'route66AfterDarkResolvedProV10';

function slug(city){ return String(city).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function status(msg){ const el=document.getElementById('status'); if(el) el.textContent=msg; }
function maps(q, placeId='') {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  return placeId ? `${base}&query_place_id=${placeId}` : base;
}
function isBadPlaceResult(raw, result){
  const address = (result.formatted_address || '').toLowerCase();
  const name = (result.name || '').toLowerCase();
  if (raw.city === 'Tulsa' && (address.includes('3905 s memorial') || name.includes('jaguar tulsa'))) return true;
  return false;
}
function popup(p) {
  const q = p.query || `${p.name} ${p.city}`;
  return `<div style="max-width:280px;color:#111">
    <h3 style="margin:0 0 8px">${p.name}</h3>
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
    try { resolvedPlaces = JSON.parse(cached); status(`Google Places Cache geladen: ${resolvedPlaces.filter(p => p.lat).length} Orte`); renderMarkers(); renderCities(); return; } catch(e) {}
  }
  resolvedPlaces = [];
  for (let i = 0; i < PLACES.length; i++) {
    status(`Google Places: ${i + 1} / ${PLACES.length}`);
    resolvedPlaces.push(await resolveOne(PLACES[i]));
    await new Promise(r => setTimeout(r, 120));
  }
  localStorage.setItem(cacheKey, JSON.stringify(resolvedPlaces));
  status(`Fertig: ${resolvedPlaces.filter(p => p.lat).length} Orte gefunden`);
  renderMarkers();
  renderCities();
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
  const img = p.image || '';
  return `<article class="place">
    <div class="photo" style="background-image:linear-gradient(135deg,rgba(70,214,230,.26),rgba(255,79,216,.18)),url('${img}')"><span class="tier">${p.priority}</span></div>
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
          <div class="eyebrow">${places.length} Locations</div>
          <h2>${city}</h2>
          <p class="vibe">${meta.note || ''}</p>
        </div>
        ${scoreBlock(meta)}
      </div>
      <div class="place-grid">${places.map(card).join('')}</div>
    </section>`;
  }).join('');
}
function renderMarkers(city='all') {
  if (!map) return;
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
function fitAll(){ renderMarkers('all'); }
function focusCity(city){
  renderMarkers(city);
  const meta = CITY_META[city];
  if (meta?.center) { map.setCenter(meta.center); map.setZoom(city === 'Austin' || city === 'Chicago' ? 11 : 12); }
  const target = document.getElementById(slug(city));
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
}
function nearMe(){
  if (!navigator.geolocation) return alert('Geo-Location wird von diesem Browser nicht unterstützt.');
  navigator.geolocation.getCurrentPosition(pos => {
    const loc = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({position: loc, map, title:'Du bist hier'});
    map.setCenter(loc); map.setZoom(13);
  }, () => alert('Standort konnte nicht gelesen werden.'));
}
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.5, lng: -94.5},
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [] // Google Standard = hell
  });
  service = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  renderCities();
  resolvePlaces();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js?v=pro10').catch(() => {});
}
window.initMap = initMap;
window.nearMe = nearMe;
window.fitAll = fitAll;
window.focusCity = focusCity;
renderCities();
