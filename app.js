
const CITY_GROUPS = {
  "Chicago":[
    {name:"Rick's Cabaret Chicago",website:"https://www.rickschicago.com/",image:"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"},
    {name:"Polekatz Chicago",website:"https://www.google.com/search?q=Polekatz+Chicago",image:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"},
    {name:"The Baton Show Lounge",website:"https://thebatonshowlounge.com/",image:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"}
  ],
  "Austin":[
    {name:"Yellow Rose Austin",website:"https://www.yellowrose.com/",image:"https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1200&q=80"},
    {name:"Palazio Austin",website:"https://palaziomensclub.com/",image:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"},
    {name:"XTC Cabaret Austin",website:"https://www.google.com/search?q=XTC+Cabaret+Austin",image:"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"}
  ]
};

function slug(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'')}

function render(){
  const main=document.getElementById('days');
  main.innerHTML=Object.entries(CITY_GROUPS).map(([city,places])=>`
    <section class="city" id="${slug(city)}">
      <h2>${city}</h2>
      <div class="place-grid">
        ${places.map(p=>`
          <article class="place">
            <div class="photo" style="background-image:url('${p.image}')"></div>
            <div class="body">
              <h3>${p.name}</h3>
              <div class="actions">
                <a href="${p.website}" target="_blank">Website</a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function nearMe(){
 alert('Near me aktiviert');
}

function initMap(){
  const map=new google.maps.Map(document.getElementById('map'),{
    center:{lat:39,lng:-96},
    zoom:4,
    mapTypeControl:false,
    streetViewControl:false,
    styles:[]
  });
}

window.initMap=initMap;
render();
