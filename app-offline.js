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

function slug(city){ return String(city).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function status(msg){ const el=document.getElementById('status'); if(el) el.textContent=msg; }
function isOnline(){ return navigator.onLine !== false; }
function setConnectionMode(){ document.body.classList.toggle('is-offline', !isOnline()); document.body.classList.toggle('is-online', isOnline()); }
function maps(q){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function onlineWebsite(p){ return p.website || maps(p.query || `${p.name} ${p.city}`); }
function onlinePhoto(p){
  const q = encodeURIComponent(`${p.city} nightlife neon city`.replace(/\s+/g, ' '));
  return `https://source.unsplash.com/900x520/?${q}`;
}
function cityCount(city){ return PLACES.filter(p => p.city === city).length; }

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
    <div class="photo online-photo" data-photo="${photo}" style="background-image:linear-gradient(135deg,rgba(70,214,230,.35),rgba(255,79,216,.22)),url('${photo}')"><span class="tier">${p.priority}</span><span class="net-badge">Online-Bild</span></div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="badges"><span class="badge gold">⭐ ${p.rating || '4.0+'}</span><span class="badge pink">${p.category}</span></div>
      <div class="meta">${p.vibe || ''}<br>${p.address || ''}</div>
      <div class="actions">
        <a href="${onlineWebsite(p)}" target="_blank" rel="noopener">Website / Suche</a>
        <a class="secondary" href="${maps(p.query || `${p.name} ${p.city}`)}" target="_blank" rel="noopener">Google Maps</a>
      </div>
    </div>
  </article>`;
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
          <div class="eyebrow">${places.length} Locations · online frisch / offline gespeichert</div>
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
  const selected = activeCity === 'all' ? 'Route 66 Chicago St. Louis Tulsa Lawton Austin' : activeCity;
  el.className = 'online-map';
  el.innerHTML = `<iframe title="Online Google Maps Übersicht" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(selected)}&output=embed"></iframe>`;
  status(activeCity === 'all' ? `Online-Modus: Karte und Bilder werden live geladen.` : `Online-Modus: ${activeCity} live geladen.`);
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
  </svg>${buttons}<div class="offline-map-note">Kostenfreie Offline-Übersicht. Website- und Google-Maps-Buttons öffnen extern, sobald Internet verfügbar ist.</div>`;
  status(activeCity === 'all' ? `Offline-Karte: ${PLACES.length} Orte in ${CITY_ORDER.length} Städten.` : `Offline-Karte: ${activeCity} ausgewählt.`);
}

function renderMap(activeCity='all'){
  setConnectionMode();
  if (isOnline()) renderOnlineMap(activeCity);
  else renderOfflineMap(activeCity);
}
function fitAll(){ renderMap('all'); document.getElementById('karte')?.scrollIntoView({behavior:'smooth', block:'start'}); }
function focusCity(city){
  renderMap(city);
  const target = document.getElementById(slug(city));
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
}
function nearMe(){ alert(isOnline() ? 'Online-Modus: Karte, Bilder, Website- und Google-Maps-Links werden live geladen. Ohne Empfang schaltet die App automatisch auf Offline-Cache um.' : 'Offline-Modus: Keine Verbindung. Die App nutzt gespeicherte Inhalte und die Offline-Übersicht.'); }
function initOffline(){
  setConnectionMode();
  renderCities();
  renderMap('all');
  window.addEventListener('online', () => renderMap('all'));
  window.addEventListener('offline', () => renderMap('all'));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js?v=hybrid4').catch(() => {});
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
  status('Offline-App bereit. Du kannst sie jetzt installieren.');
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
