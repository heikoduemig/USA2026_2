
// v9 marker update
const LIVE_MARKERS = true;

function maps(q){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function createMarker(name, city, x, y){
  return `
    <a class="live-marker" 
       href="${maps(name + ' ' + city)}"
       target="_blank"
       style="left:${x}%;top:${y}%">
       <span class="dot"></span>
       <span class="label">${name}</span>
    </a>`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const map = document.getElementById('map');
  if(!map) return;

  map.innerHTML += createMarker("Rick's Cabaret","Chicago",80,18);
  map.innerHTML += createMarker("Night Trips","Tulsa",43,60);
  map.innerHTML += createMarker("Yellow Rose","Austin",28,92);
});
