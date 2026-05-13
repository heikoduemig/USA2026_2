window.CITY_ORDER = ['Chicago','St. Louis','Tulsa','Lawton','Austin'];

window.CITY_META = {
  'Chicago': {
    center:{lat:41.8781,lng:-87.6298},
    note:'Chicago ist als eine Stadt zusammengefasst – keine Aufteilung nach Reisetagen.',
    scores:{nightlife:9.2,safety:7.8,tourist:9.0,lateFood:9.4}
  },
  'St. Louis': {
    center:{lat:38.6270,lng:-90.1994},
    note:'Kompakte Auswahl, am besten per Rideshare planen.',
    scores:{nightlife:7.4,safety:7.0,tourist:7.6,lateFood:7.8}
  },
  'Tulsa': {
    center:{lat:36.1540,lng:-95.9928},
    note:'Tulsa bewusst reduziert. Der falsche Jaguar-Autohaus-Treffer wird blockiert.',
    scores:{nightlife:7.1,safety:7.5,tourist:7.2,lateFood:7.0}
  },
  'Lawton': {
    center:{lat:34.6036,lng:-98.3959},
    note:'Kleine lokale Auswahl plus Casino-/Bar-Alternative.',
    scores:{nightlife:5.7,safety:7.2,tourist:6.2,lateFood:5.9}
  },
  'Austin': {
    center:{lat:30.2672,lng:-97.7431},
    note:'Austin ist als eine Stadt zusammengefasst und erweitert.',
    scores:{nightlife:9.5,safety:8.1,tourist:9.2,lateFood:9.1}
  }
};

window.ADULT_PLACES = [
  { name:"Rick's Cabaret Chicago", image:'https://www.rickschicago.com/store2/34/469/thumbnails/1.jpg', city:'Chicago', category:"Tabledance", priority:'Pflichtmarker', rating:4.5, vibe:'Zentral, Premium-Vibe, starke Hauptoption.', address:'1531 N Kingsbury St, Chicago, IL 60642', query:"Rick's Cabaret Chicago 1531 N Kingsbury St Chicago", website:'https://www.rickschicago.com/' },
  { name:'Polekatz Chicago', image:'https://polekatzchicago.net/wp-content/uploads/2026/02/polekatz-img2.jpg', city:'Chicago', category:"Tabledance", priority:'Top Rated', rating:4.6, vibe:'Großer Club und starke Alternative.', address:'Chicago, IL', query:'Polekatz Chicago adult nightclub', website:'https://polekatzchicago.net/' },
  { name:'The Baton Show Lounge', image:'https://static.wixstatic.com/media/b706b6_5e64214ae7c74eeeaf4eb3f7d162e7b2~mv2.jpg/v1/fill/w_900,h_520,al_c,q_80,enc_auto/b706b6_5e64214ae7c74eeeaf4eb3f7d162e7b2~mv2.jpg', city:'Chicago', category:'Cabaret / Drag Show', priority:'Special', rating:4.7, vibe:'Show-Alternative statt klassischem Stripclub.', address:'Chicago, IL', query:'The Baton Show Lounge Chicago', website:'https://www.thebatonshowlounge.com/' },
  { name:'Deja Vu Showgirls Chicago', image:'https://cdn2.lnk.bi/otherpics/-1415854_20250724622.png', city:'Chicago', category:"Tabledance", priority:'Top Rated', rating:4.2, vibe:'Bekannte, mainstreamige Option.', address:'Chicago, IL', query:'Deja Vu Showgirls Chicago adult nightclub', website:'https://lnk.bio/dejavuchicago' },
  { name:'The Gold Room Chicago', image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70', city:'Chicago', category:"Gentlemen’s Club", priority:'Top Rated', rating:4.4, vibe:'Gute Zusatzoption für einen späteren Abend.', address:'Chicago, IL', query:"The Gold Room Chicago Gentlemen's Club", website:'https://www.google.com/search?q=The+Gold+Room+Chicago+Gentlemen%27s+Club' },
  { name:'Admiral Theatre Chicago', image:'https://cdn2.lnk.bi/otherpics/-1892172_20250130705.png', city:'Chicago', category:"Adult Entertainment", priority:'Special', rating:4.1, vibe:'Bekannte Chicago-Adresse, vorher Website/Google prüfen.', address:'Chicago, IL', query:'Admiral Theatre Chicago adult entertainment', website:'https://lnk.bio/admiralx' },

  { name:"Scarlett's Cabaret St. Louis", image:'https://www.scarlettsstlouis.com/images/sites/33/scarletts-st-louis-logo-sm.png', city:'St. Louis', category:"Tabledance", priority:'Pflichtmarker', rating:4.3, vibe:'Hauptpick für St. Louis.', address:'St. Louis / East St. Louis area', query:"Scarlett's Cabaret St. Louis", website:'https://www.scarlettsstlouis.com/' },
  { name:'Country Rock Cabaret', image:'https://www.countryrockcabaret.com/images/sites/98/7461/country-rock-cabaret-strip-club-pole.jpg', city:'St. Louis', category:"Tabledance", priority:'Top Rated', rating:4.1, vibe:'Lokalerer Vibe und gute zweite Option.', address:'St. Louis area', query:'Country Rock Cabaret St. Louis', website:'https://www.countryrockcabaret.com/' },

  { name:'Night Trips Tulsa', image:'https://nighttrips.com/Tulsa/wp-content/uploads/2015/09/Night-Trips_Main-Stage-South-View-1024x683.jpg', city:'Tulsa', category:"Tabledance", priority:'Pflichtmarker', rating:4.2, vibe:'Bekannteste Tulsa-Empfehlung.', address:'3902 S Sheridan Rd, Tulsa, OK 74145', query:'Night Trips Tulsa 3902 S Sheridan Rd Tulsa OK', website:'https://nighttrips.com/Tulsa/' },
  { name:"Lady Godiva's Tulsa", image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70', city:'Tulsa', category:"Adult Nightlife", priority:'Top Rated', rating:4.1, vibe:'Lokale Option, nicht als Hauptziel pushen.', address:'Tulsa, OK', query:"Lady Godiva's Tulsa adult nightlife", website:'https://www.google.com/search?q=Lady+Godiva%27s+Tulsa' },

  { name:'Dragon West', image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70', city:'Lawton', category:"Gentlemen’s Club", priority:'Pflichtmarker', rating:4.0, vibe:'Lokaler Nightlife-Pick für Lawton.', address:'Lawton, OK', query:'Dragon West Lawton OK gentlemen club', website:'https://www.google.com/search?q=Dragon+West+Lawton+OK' },
  { name:'Apache Casino Bar Area', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Apache_Casino_Hotel_Billboard.jpg/960px-Apache_Casino_Hotel_Billboard.jpg', city:'Lawton', category:'Casino / Bar', priority:'Special', rating:4.2, vibe:'Saubere Bar-/Casino-Alternative.', address:'Apache Casino Hotel, Lawton, OK', query:'Apache Casino Hotel Lawton', website:'https://www.apachecasinohotel.com/' },

  { name:'Yellow Rose Austin', image:'https://static.wixstatic.com/media/b706b6_5e64214ae7c74eeeaf4eb3f7d162e7b2~mv2.jpg/v1/fill/w_900,h_520,al_c,q_80,enc_auto/b706b6_5e64214ae7c74eeeaf4eb3f7d162e7b2~mv2.jpg', city:'Austin', category:"Tabledance", priority:'Pflichtmarker', rating:4.6, vibe:'Austin-Klassiker und stärkster Premium-Hauptpick.', address:'6528 N Lamar Blvd, Austin, TX 78752', query:'Yellow Rose Austin 6528 N Lamar Blvd', website:'https://www.yellowrose.com/' },
  { name:'Palazio Austin', image:'https://palaziomensclub.com/wp-content/uploads/2025/08/image-8-scaled.jpg', city:'Austin', category:"Tabledance", priority:'Pflichtmarker', rating:4.5, vibe:'Premium Cabaret und zweiter Pflichtmarker in Austin.', address:'Austin, TX', query:'Palazio Austin', website:'https://palaziomensclub.com/' },
  { name:'XTC Cabaret Austin', image:'https://www.rickschicago.com/store2/34/469/thumbnails/1.jpg', city:'Austin', category:"Tabledance", priority:'Top Rated', rating:4.2, vibe:'Großer Club, gut für späten Abend.', address:'Austin, TX', query:'XTC Cabaret Austin', website:'https://www.google.com/search?q=XTC+Cabaret+Austin' },
  { name:"Michelle's Beach House", image:'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=70', city:'Austin', category:"Steakhouse / Gentlemen’s Club", priority:'Top Rated', rating:4.3, vibe:'Steakhouse-/Club-Konzept, besonderer Zusatzpick.', address:'Austin, TX', query:"Michelle's Beach House Austin", website:'https://www.google.com/search?q=Michelle%27s+Beach+House+Austin' },
  { name:'Chicas Bonitas Austin', image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70', city:'Austin', category:"Adult Nightlife", priority:'Top Rated', rating:4.0, vibe:'Alternative mit rauerem Vibe, nicht als Hauptziel.', address:'Austin, TX', query:'Chicas Bonitas Austin', website:'https://www.google.com/search?q=Chicas+Bonitas+Austin' },
  { name:'Perfect 10 Austin', image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70', city:'Austin', category:"Gentlemen’s Club", priority:'Special', rating:4.1, vibe:'Zusätzliche Austin-Option, vorher prüfen.', address:'Austin, TX', query:'Perfect 10 Austin gentlemen club', website:'https://www.google.com/search?q=Perfect+10+Austin+gentlemen+club' }
];
