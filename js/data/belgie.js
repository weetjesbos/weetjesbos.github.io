/*
 * Leerstof: provincies, hoofdplaatsen, buurlanden en hoofdsteden.
 * De `id` van een provincie, land of zee is ook de id van het gebied op de kaart.
 * `accept` bevat andere schrijfwijzen die we ook goedkeuren (bv. de Franse naam).
 */
App.data.belgie = {
  provinces: [
    { id: 'west-vlaanderen', name: 'West-Vlaanderen', capital: 'Brugge', city: [51.209, 3.225] },
    { id: 'oost-vlaanderen', name: 'Oost-Vlaanderen', capital: 'Gent', city: [51.054, 3.717] },
    { id: 'antwerpen', name: 'Antwerpen', capital: 'Antwerpen', city: [51.219, 4.402] },
    { id: 'limburg', name: 'Limburg', capital: 'Hasselt', city: [50.930, 5.338] },
    { id: 'vlaams-brabant', name: 'Vlaams-Brabant', capital: 'Leuven', city: [50.879, 4.700] },
    { id: 'waals-brabant', name: 'Waals-Brabant', capital: 'Waver', city: [50.717, 4.612], accept: ['Wavre'] },
    { id: 'henegouwen', name: 'Henegouwen', capital: 'Bergen', city: [50.454, 3.952], accept: ['Mons'] },
    { id: 'namen', name: 'Namen', capital: 'Namen', city: [50.467, 4.872], accept: ['Namur'] },
    { id: 'luik', name: 'Luik', capital: 'Luik', city: [50.633, 5.567], accept: ['Liège', 'Liege'] },
    { id: 'luxemburg', name: 'Luxemburg', capital: 'Aarlen', city: [49.683, 5.817], accept: ['Arlon'] },
  ],

  brussels: {
    id: 'brussel',
    name: 'Brussel',
    city: [50.847, 4.357],
    note: 'Brussel is geen provincie! Het is het Brussels Hoofdstedelijk Gewest, en de hoofdstad van België.',
  },

  // Vlaggen als strepen, zodat ze overal hetzelfde tonen (vlag-emoji werken niet op elke computer).
  neighbours: [
    { id: 'nl', name: 'Nederland', capital: 'Amsterdam', flag: { dir: 'h', colors: ['#ae1c28', '#ffffff', '#21468b'] } },
    { id: 'de', name: 'Duitsland', capital: 'Berlijn', flag: { dir: 'h', colors: ['#000000', '#dd0000', '#ffce00'] }, accept: ['Berlin'] },
    { id: 'fr', name: 'Frankrijk', capital: 'Parijs', flag: { dir: 'v', colors: ['#0055a4', '#ffffff', '#ef4135'] }, accept: ['Paris'] },
    { id: 'lu', name: 'Luxemburg', capital: 'Luxemburg', flag: { dir: 'h', colors: ['#ed2939', '#ffffff', '#00a1de'] } },
  ],

  belgiumFlag: { dir: 'v', colors: ['#000000', '#fdda24', '#ef3340'] },

  sea: { id: 'noordzee', name: 'Noordzee' },

  /* Naam van eender welk gebied of stad op de kaart. */
  name(id) {
    if (id.startsWith('stad-')) {
      const p = this.provinces.find((x) => `stad-${x.id}` === id);
      return p ? p.capital : this.brussels.name;
    }
    const all = [...this.provinces, ...this.neighbours, this.brussels, this.sea];
    return all.find((x) => x.id === id)?.name ?? id;
  },

  /* Extra uitleg als een kind op dit gebied klikt terwijl het iets anders zocht. */
  note(id) {
    return id === this.brussels.id ? this.brussels.note : null;
  },
};
