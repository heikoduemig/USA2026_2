const PLACES = window.ADULT_PLACES || [];
const CITY_META = window.CITY_META || {};
const CITY_ORDER = window.CITY_ORDER || [...new Set(PLACES.map(p => p.city))];

const CITY_POSITIONS = {
  'Chicago': {x: 80, y: 18},
  'St. Louis': {x: 61, y: 42},
  'Tulsa': {x: 43, y: 60},
  'Lawton': {x: 38, y: 78},
  'Austin': {x: 28, y: 92}
};

const CITY_IMAGES = {
  'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=900&q=70',
  'St. Louis': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=900&q=70',
  'Tulsa': 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=70',
  'Lawton': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70',
  'Austin': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=900&q=70'
};

function livePageShot(url){
  if (!url) return '';
  const safeUrl = String(url).startsWith('http') ? String(url) : `https://${String(url)}`;
  return `https://image.thum.io/get/width/900/crop/520/noanimate/${encodeURI(safeUrl)}`;
}

let connectionOnline = navigator.onLine !== false;
let lastCity = 'all';

function slug(city){ return String(city).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function status(msg){ const el=document.getElementById('status'); if(el) el.textContent=msg; }
function maps(q){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function onlineWebsite(p){ return p.website || maps(p.query || `${p.name} ${p.city}`); }
function cityCount(city){ return PLACES.filter(p => p.city === city).length; }
function onlinePhoto(p){
  // Online: zuerst freigegebene/öffentliche Bilder der Location laden.
  // Nur wenn kein Bild hinterlegt ist, wird als Notfall ein Website-Screenshot genutzt.
  return p.image || livePageShot(p.website || maps(p.query || `${p.name} ${p.city}`)) || CITY_IMAGES[p.city] || CITY_IMAGES.Austin;
}
function imageSearch(p){ return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.query || `${p.name} ${p.city}`)}`; }

function setConnectionMode(){
  document.body.classList.toggle('is-offline', !connectionOnline);
  document.body.classList.toggle('is-online', connectionOnline);
}

async function checkOnline(){
  if (navigator.onLine === false) return false;
  try {
    const response = await fetch(`./manifest.webmanifest?online-check=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin'
    });
    return !!response && response.ok;
  } catch (error) {
    return false;
  }
}

async function refreshConnectionAndRender(city = lastCity){
  lastCity = city;
  status('Verbindung wird geprüft ...');
  connectionOnline = await checkOnline();
  setConnectionMode();
  renderMap(city);
  updatePhotos();
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
  const photo = onlinePhoto(p);
  return `<article class="place">
    <div class="photo offline-photo" data-photo="${photo}"><span class="tier">${p.priority}</span><span class="net-badge">Offline-Fallback</span></div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="badges"><span class="badge gold">⭐ ${p.rating || '4.0+'}</span><span class="badge pink">${p.category}</span></div>
      <div class="meta">${p.vibe || ''}<br>${p.address || ''}</div>
      <div class="actions">
        <a href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website / Suche</a>
        <a class="secondary" href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
        <a class="secondary" href="${imageSearch(p)}" target="_blank" rel="noopener">Bilder</a>
      </div>
    </div>
  </article>`;
}

function updatePhotos(){
  document.querySelectorAll('.photo[data-photo]').forEach(el => {
    if (connectionOnline) {
      const photo = el.getAttribute('data-photo');
      el.classList.remove('offline-photo');
      el.classList.add('online-photo');
      el.style.backgroundImage = `linear-gradient(135deg,rgba(70,214,230,.35),rgba(255,79,216,.22)),url('${photo}')`;
      const badge = el.querySelector('.net-badge');
      if (badge) badge.textContent = 'Location-Bild';
    } else {
      el.classList.add('offline-photo');
      el.classList.remove('online-photo');
      el.style.backgroundImage = '';
      const badge = el.querySelector('.net-badge');
      if (badge) badge.textContent = 'Offline-Fallback';
    }
  });
}

function renderCities() {
  const root = document.getElementById('cities');
  if (!root) return;
  root.innerHTML = CITY_ORDER.map(city => {
    const meta = CITY_META[city] || {};
    const places = PLACES.filter(p => p.city === city);
    return `<section class="glass city-section" id="${slug(city)}">
      <div class="city-top">
        <div class="city-title">
          <div class="eyebrow">${places.length} Locations · online live / offline gespeichert</div>
          <h2>${city}</h2>
          <p class="vibe">${meta.note || ''}</p>
        </div>
        ${scoreBlock(meta)}
      </div>
      <div class="place-grid">${places.map(card).join('')}</div>
    </section>`;
  }).join('');
}

function renderOnlineMap(activeCity='all') {
  const el = document.getElementById('map');
  if (!el) return;
  const selected = activeCity === 'all' ? 'Route 66 Chicago St. Louis Tulsa Lawton Austin' : `${activeCity} nightlife`;
  el.className = 'online-map';
  el.innerHTML = `<iframe title="Online Google Maps Übersicht" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(selected)}&output=embed"></iframe>`;
  status(activeCity === 'all' ? 'Online-Modus aktiv: Karte und Bilder werden live geladen.' : `Online-Modus aktiv: ${activeCity} live geladen.`);
}

function renderOfflineMap(activeCity='all') {
  const el = document.getElementById('map');
  if (!el) return;
  const points = CITY_ORDER.map(city => ({city, ...(CITY_POSITIONS[city] || {x:50,y:50})}));
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const buttons = points.map(p => {
    const active = activeCity === p.city ? ' active' : '';
    return `<button class="offline-pin${active}" style="left:${p.x}%;top:${p.y}%" onclick="focusCity('${p.city.replace(/'/g,"\\'")}')" aria-label="${p.city}">
      <span class="pin-dot"></span><span class="pin-label">${p.city}<small>${cityCount(p.city)} Orte</small></span>
    </button>`;
  }).join('');
  el.className = 'offline-map';
  el.innerHTML = `<svg class="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#46d6e6"/></linearGradient></defs>
    <polyline points="${polyline}" fill="none" stroke="url(#routeGrad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
  </svg>${buttons}<div class="offline-map-note">Offline-Modus: keine Verbindung erkannt. Gespeicherte Inhalte bleiben nutzbar.</div>`;
  status(activeCity === 'all' ? `Offline-Modus aktiv: ${PLACES.length} Orte in ${CITY_ORDER.length} Städten.` : `Offline-Modus aktiv: ${activeCity} ausgewählt.`);
}

function renderMap(activeCity='all'){
  setConnectionMode();
  if (connectionOnline) renderOnlineMap(activeCity);
  else renderOfflineMap(activeCity);
}

function fitAll(){ refreshConnectionAndRender('all'); document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'}); }
function focusCity(city){
  refreshConnectionAndRender(city);
  const target = document.getElementById(slug(city));
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
}
function nearMe(){ alert(connectionOnline ? 'Online-Modus aktiv: Karte, Bilder, Website- und Google-Maps-Links werden live geladen. Ohne Empfang schaltet die App automatisch auf Offline-Cache um.' : 'Offline-Modus aktiv: keine Verbindung erkannt. Die App nutzt gespeicherte Inhalte und die Offline-Übersicht.'); }

function registerServiceWorker(){
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js?v=hybrid8', { updateViaCache: 'none' })
    .then(reg => reg.update && reg.update())
    .catch(() => {});
}

function initOffline(){
  setConnectionMode();
  renderCities();
  refreshConnectionAndRender('all');
  window.addEventListener('online', () => refreshConnectionAndRender(lastCity));
  window.addEventListener('offline', () => refreshConnectionAndRender(lastCity));
  registerServiceWorker();
}
window.nearMe = nearMe;
window.fitAll = fitAll;
window.focusCity = focusCity;
document.addEventListener('DOMContentLoaded', initOffline);

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.body.classList.add('can-install');
  status('App bereit. Du kannst sie jetzt installieren.');
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  document.body.classList.remove('can-install');
  status('App wurde installiert.');
});
function installApp(){
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) return alert('Die App ist bereits installiert bzw. läuft im App-Modus.');
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => { deferredInstallPrompt = null; });
    return;
  }
  if (isIos) return alert('iPhone/iPad: In Safari öffnen, Teilen-Button antippen und „Zum Home-Bildschirm“ wählen.');
  alert('Im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen. Auf GitHub Pages funktioniert das über HTTPS.');
}
window.installApp = installApp;
