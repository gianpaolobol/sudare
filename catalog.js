export const categories = {
  tutti: { label: 'Tutti', icon: '◉' },
  discoteche: { label: 'Discoteche', icon: '✺' },
  club: { label: 'Club', icon: '♫' },
  balere: { label: 'Balere', icon: '♬' },
  circoli: { label: 'Circoli', icon: '⌂' },
  sociali: { label: 'Balli sociali', icon: '♧' },
  aperto: { label: 'All’aperto', icon: '☀' }
}

export const venues = [
  {
    id: 'cassero', name: 'Cassero LGBTI+ Center', types: ['club', 'circoli'],
    point: { lat: 44.5029370, lon: 11.3351500 },
    address: 'Via Don Giovanni Minzoni 18', styles: 'House, techno e serate queer',
    site: 'https://www.cassero.it/', source: 'https://www.bolognawelcome.com/it/locali/nightlife/cassero-lgbti-center'
  },
  {
    id: 'locomotiv', name: 'Locomotiv Club', types: ['club', 'circoli'],
    point: { lat: 44.5073203, lon: 11.3523062 },
    address: 'Via Sebastiano Serlio 25/2', styles: 'DJ set e concerti',
    site: 'https://www.locomotivclub.it/', source: 'https://www.bolognawelcome.com/it/locali/nightlife/locomotiv-club'
  },
  {
    id: 'tropical-balera', name: 'Tropical Balera', types: ['balere', 'sociali', 'aperto'],
    point: { lat: 44.5073203, lon: 11.3523062 },
    address: 'Via Sebastiano Serlio 25/2 · Parco del DLF', styles: 'Filuzzi, liscio e balli popolari',
    note: 'Rassegna estiva. Consulta il programma per la prossima edizione.',
    source: 'https://cittadellamusica.comune.bologna.it/objects/tropical-balera-2026'
  },
  {
    id: 'dumbo', name: 'DumBO', types: ['club', 'aperto'],
    point: { lat: 44.5046442, lon: 11.3270273 },
    address: 'Via Camillo Casarini 19', styles: 'Serate da ballo, DJ set e clubbing all’aperto',
    site: 'https://dumbospace.it/eventi/', source: 'https://www.bolognaestate.it/calendario-bolognaestate-2026/kindergarten-goes-to-city-soft-clubbing'
  },
  {
    id: 'link', name: 'Link', types: ['club', 'discoteche'],
    point: { lat: 44.5124297, lon: 11.4154374 },
    address: 'Via Francesco Fantoni 21', styles: 'Elettronica, techno e DJ set',
    site: 'https://www.link.bo.it/events', source: 'https://vitaromagna.it/discoteche/link-bologna'
  },
  {
    id: 'numa', name: 'Numa Club', types: ['discoteche', 'club'],
    point: { lat: 44.5154764, lon: 11.3624002 },
    address: 'Via Alfieri Maserati 9', styles: 'Serate in discoteca',
    source: 'https://numaclub.com/home/numa/'
  },
  {
    id: 'matis', name: 'Matis Club', types: ['discoteche', 'club'],
    point: { lat: 44.4995703, lon: 11.2758899 },
    address: 'Via Rotta 10', styles: 'DJ set e serate house',
    site: 'https://www.matisdinnerclub.com/', source: 'https://www.bolognawelcome.com/it/locali/nightlife/matis-dinner-club'
  },
  {
    id: 'bach-art-center', name: 'Bach Art Center', types: ['sociali'],
    point: { lat: 44.5247590, lon: 11.3178210 },
    address: 'Via Zanardi 230/2', styles: 'Milonga di tango argentino',
    source: 'https://www.flordetangoargentino.it/bachartcenter/'
  },
  {
    id: 'saffi', name: 'Casa di Quartiere Saffi', types: ['circoli', 'sociali'],
    point: { lat: 44.5024678, lon: 11.3302837 },
    address: 'Via Lodovico Berti 2/10', styles: 'Attività di ballo di quartiere',
    source: 'https://www.casaquartieresaffi.it/'
  },
  {
    id: 'pace', name: 'Centro Sociale della Pace', types: ['circoli', 'balere', 'sociali'],
    point: { lat: 44.495545, lon: 11.3318707 },
    address: 'Via del Pratello 53', styles: 'Ballo liscio, tango e swing',
    site: 'https://www.centrosocialedellapace.org/',
    source: 'https://www.centrosocialedellapace.org/wp-content/uploads/2026/03/programma-CSA-Pace-marzo-2026.pdf'
  }
]
