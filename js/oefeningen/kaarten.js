/* Kaartinstellingen die door verschillende oefeningen gedeeld worden. */
App.maps = (() => {
  const provinceIds = App.data.belgie.provinces.map((p) => p.id);
  const neighbourIds = App.data.belgie.neighbours.map((n) => n.id);
  return {
    // Provincies aanklikken; Brussel is klikbaar zodat de vos kan uitleggen dat het geen provincie is.
    provinces: { clickable: [...provinceIds, 'brussel'] },
    // Alleen kijken, niets klikbaar.
    provincesShow: {},
    // België als één vlak; buurlanden en zee aanklikken.
    neighbours: { belgium: 'plain', clickable: [...neighbourIds, 'noordzee'] },
    neighboursShow: { belgium: 'plain' },
    // Hoofdplaatsen als klikbare stippen.
    cities: { cities: 'targets' },
    // Hoofdplaatsen als stippen om naar te kijken.
    citiesShow: { cities: 'dots' },
  };
})();
