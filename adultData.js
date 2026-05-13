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
  { name:"Rick's Cabaret Chicago", city:'Chicago', category:"Tabledance", priority:'Pflichtmarker', rating:4.5, vibe:'Zentral, Premium-Vibe, starke Hauptoption.', address:'1531 N Kingsbury St, Chicago, IL 60642', query:"Rick's Cabaret Chicago 1531 N Kingsbury St Chicago", website:'https://www.rickschicago.com/' },
  { name:'Polekatz Chicago', city:'Chicago', category:"Tabledance", priority:'Top Rated', rating:4.6, vibe:'Großer Club und starke Alternative.', address:'Chicago, IL', query:'Polekatz Chicago adult nightclub', website:'https://www.google.com/search?q=Polekatz+Chicago' },
  { name:'The Baton Show Lounge', city:'Chicago', category:'Cabaret / Drag Show', priority:'Special', rating:4.7, vibe:'Show-Alternative statt klassischem Stripclub.', address:'Chicago, IL', query:'The Baton Show Lounge Chicago', website:'https://thebatonshowlounge.com/' },
  { name:'Deja Vu Showgirls Chicago', city:'Chicago', category:"Tabledance", priority:'Top Rated', rating:4.2, vibe:'Bekannte, mainstreamige Option.', address:'Chicago, IL', query:'Deja Vu Showgirls Chicago adult nightclub', website:'https://www.google.com/search?q=Deja+Vu+Showgirls+Chicago' },
  { name:'The Gold Room Chicago', city:'Chicago', category:"Gentlemen’s Club", priority:'Top Rated', rating:4.4, vibe:'Gute Zusatzoption für einen späteren Abend.', address:'Chicago, IL', query:"The Gold Room Chicago Gentlemen's Club", website:'https://www.google.com/search?q=The+Gold+Room+Chicago+Gentlemen%27s+Club' },
  { name:'Admiral Theatre Chicago', city:'Chicago', category:"Adult Entertainment", priority:'Special', rating:4.1, vibe:'Bekannte Chicago-Adresse, vorher Website/Google prüfen.', address:'Chicago, IL', query:'Admiral Theatre Chicago adult entertainment', website:'https://www.google.com/search?q=Admiral+Theatre+Chicago' },

  { name:"Scarlett's Cabaret St. Louis", city:'St. Louis', category:"Tabledance", priority:'Pflichtmarker', rating:4.3, vibe:'Hauptpick für St. Louis.', address:'St. Louis / East St. Louis area', query:"Scarlett's Cabaret St. Louis", website:'https://www.google.com/search?q=Scarlett%27s+Cabaret+St.+Louis' },
  { name:'Country Rock Cabaret', city:'St. Louis', category:"Tabledance", priority:'Top Rated', rating:4.1, vibe:'Lokalerer Vibe und gute zweite Option.', address:'St. Louis area', query:'Country Rock Cabaret St. Louis', website:'https://www.google.com/search?q=Country+Rock+Cabaret+St.+Louis' },

  { name:'Night Trips Tulsa', city:'Tulsa', category:"Tabledance", priority:'Pflichtmarker', rating:4.2, vibe:'Bekannteste Tulsa-Empfehlung.', address:'3902 S Sheridan Rd, Tulsa, OK 74145', query:'Night Trips Tulsa 3902 S Sheridan Rd Tulsa OK', website:'https://nighttrips.com/Tulsa/' },
  { name:"Lady Godiva's Tulsa", city:'Tulsa', category:"Adult Nightlife", priority:'Top Rated', rating:4.1, vibe:'Lokale Option, nicht als Hauptziel pushen.', address:'Tulsa, OK', query:"Lady Godiva's Tulsa adult nightlife", website:'https://www.google.com/search?q=Lady+Godiva%27s+Tulsa' },

  { name:'Dragon West', city:'Lawton', category:"Gentlemen’s Club", priority:'Pflichtmarker', rating:4.0, vibe:'Lokaler Nightlife-Pick für Lawton.', address:'Lawton, OK', query:'Dragon West Lawton OK gentlemen club', website:'https://www.google.com/search?q=Dragon+West+Lawton+OK' },
  { name:'Apache Casino Bar Area', city:'Lawton', category:'Casino / Bar', priority:'Special', rating:4.2, vibe:'Saubere Bar-/Casino-Alternative.', address:'Apache Casino Hotel, Lawton, OK', query:'Apache Casino Hotel Lawton', website:'https://www.apachecasinohotel.com/' },

  { name:'Yellow Rose Austin', city:'Austin', category:"Tabledance", priority:'Pflichtmarker', rating:4.6, vibe:'Austin-Klassiker und stärkster Premium-Hauptpick.', address:'6528 N Lamar Blvd, Austin, TX 78752', query:'Yellow Rose Austin 6528 N Lamar Blvd', website:'https://www.yellowrose.com/' },
  { name:'Palazio Austin', city:'Austin', category:"Tabledance", priority:'Pflichtmarker', rating:4.5, vibe:'Premium Cabaret und zweiter Pflichtmarker in Austin.', address:'Austin, TX', query:'Palazio Austin', website:'https://palaziomensclub.com/' },
  { name:'XTC Cabaret Austin', city:'Austin', category:"Tabledance", priority:'Top Rated', rating:4.2, vibe:'Großer Club, gut für späten Abend.', address:'Austin, TX', query:'XTC Cabaret Austin', website:'https://www.google.com/search?q=XTC+Cabaret+Austin' },
  { name:"Michelle's Beach House", city:'Austin', category:"Steakhouse / Gentlemen’s Club", priority:'Top Rated', rating:4.3, vibe:'Steakhouse-/Club-Konzept, besonderer Zusatzpick.', address:'Austin, TX', query:"Michelle's Beach House Austin", website:'https://www.google.com/search?q=Michelle%27s+Beach+House+Austin' },
  { name:'Chicas Bonitas Austin', city:'Austin', category:"Adult Nightlife", priority:'Top Rated', rating:4.0, vibe:'Alternative mit rauerem Vibe, nicht als Hauptziel.', address:'Austin, TX', query:'Chicas Bonitas Austin', website:'https://www.google.com/search?q=Chicas+Bonitas+Austin' },
  { name:'Perfect 10 Austin', city:'Austin', category:"Gentlemen’s Club", priority:'Special', rating:4.1, vibe:'Zusätzliche Austin-Option, vorher prüfen.', address:'Austin, TX', query:'Perfect 10 Austin gentlemen club', website:'https://www.google.com/search?q=Perfect+10+Austin+gentlemen+club' }
];
