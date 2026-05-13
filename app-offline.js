const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
const CITY_ORDER = window.CITY_ORDER || [...new Set(PLACES.map(p => p.city))];

let activeCity = 'all';
let activePlace = null;
let onlineState = navigator.onLine;
let deferredInstallPrompt = null;

function slug(text){ return String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function maps(q){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function imageSearch(p){ return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.imageQuery || (p.name + ' official exterior photos'))}`; }
function onlineWebsite(p){ return p.website || `https://www.google.com/search?q=${encodeURIComponent(p.name + ' ' + p.city)}`; }
function cityCount(city){ return PLACES.filter(p => p.city === city).length; }
function status(msg){ const el=document.getElementById('status'); if(el) el.textContent=msg; }

function categoryClass(cat=''){
  const c = cat.toLowerCase();
  if (c.includes('casino')) return 'cat-casino';
  if (c.includes('cabaret') || c.includes('drag')) return 'cat-show';
  if (c.includes('gentlemen')) return 'cat-gentlemen';
  if (c.includes('adult')) return 'cat-adult';
  return 'cat-table';
}

function placeArt(p){
  return `<div class="photo-art" style="--accent:${p.accent || '#ff4fd8'}">
    <div class="neon-frame"></div><div class="stage-lines"></div>
    <div class="club-name">${p.name}</div><div class="art-caption">${p.imageLabel || 'Location-Bild'}</div>
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
        <button onclick="selectPlace(${idx})">Auf Karte</button>
      </div>
    </div>
  </article>`;
}

function renderCities() {
  const root = document.getElementById('cities');
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

function marker(p, idx){
  const active = activePlace === idx ? ' active' : '';
  return `<button class="place-pin ${categoryClass(p.category)}${active}" style="left:${p.map.x}%;top:${p.map.y}%;--accent:${p.accent || '#ff4fd8'}" onclick="selectPlace(${idx})" title="${p.name}">
    <span class="pin-core"></span><span class="place-label">${p.name}<small>${p.city}</small></span>
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
  if (activePlace === null) return '';
  const p = PLACES[activePlace];
  return `<aside class="map-popup">
    <button class="popup-close" onclick="clearPlace()">×</button>
    <div class="popup-photo">${placeArt(p)}</div>
    <div class="popup-body">
      <div class="eyebrow">${p.city} · ${p.category}</div><h3>${p.name}</h3>
      <p>${p.vibe || ''}<br>${p.address || ''}</p>
      <div class="actions">
        <a href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
        <a class="secondary" href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website</a>
        <a class="secondary" href="${imageSearch(p)}" target="_blank" rel="noopener">Bilder</a>
      </div>
    </div>
  </aside>`;
}

function renderMap(){
  const el = document.getElementById('map');
  const cityPoints = CITY_ORDER.map(city => ({city, ...(CITY_META[city]?.map || {x:50,y:50})}));
  const polyline = cityPoints.map(p => `${p.x},${p.y}`).join(' ');
  const shown = activeCity === 'all' ? PLACES : PLACES.filter(p => p.city === activeCity);
  el.innerHTML = `<svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
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
function selectPlace(idx){ activePlace = idx; activeCity = PLACES[idx].city; renderMap(); document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'}); }
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
  renderCities(); renderMap(); checkOnline();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js?v=13').catch(()=>{});
}
window.addEventListener('online', checkOnline);
window.addEventListener('offline', checkOnline);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredInstallPrompt = event; document.body.classList.add('can-install'); status('App installierbar. Button „App installieren“ verwenden.'); });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; document.body.classList.remove('can-install'); status('App wurde installiert.'); });

window.nearMe = nearMe; window.fitAll = fitAll; window.focusCity = focusCity; window.selectPlace = selectPlace; window.clearPlace = clearPlace; window.installApp = installApp;
document.addEventListener('DOMContentLoaded', init);
