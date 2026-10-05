/* Hoofdplaatsen van de provincies. */
(() => {
  const { provinces } = App.data.belgie;
  const { shuffle, options } = App.util;
  const capitals = provinces.map((p) => p.capital);

  App.registerGroup({ id: 'hoofdplaatsen', title: 'Hoofdplaatsen', emoji: '🏙️', color: '#7c5cff' });

  App.register({
    id: 'hoofdplaatsen-kiezen',
    group: 'hoofdplaatsen',
    title: 'Kies de hoofdplaats',
    emoji: '🎯',
    sticker: '🦖',
    description: 'Wat is de hoofdplaats van de provincie die oplicht?',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'choice',
      prompt: `Wat is de hoofdplaats van **${p.name}**?`,
      show: { map: App.maps.citiesShow, region: p.id, city: `stad-${p.id}` },
      options: options(p.capital, capitals),
      answer: p.capital,
    })),
  });

  App.register({
    id: 'hoofdplaatsen-aanwijzen',
    group: 'hoofdplaatsen',
    title: 'Waar ligt de stad?',
    emoji: '📍',
    sticker: '🐢',
    description: 'Klik op het juiste bolletje op de kaart.',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'map-click',
      prompt: `Waar ligt **${p.capital}**?`,
      target: `stad-${p.id}`,
      map: App.maps.cities,
    })),
  });

  App.register({
    id: 'hoofdplaatsen-memory',
    group: 'hoofdplaatsen',
    title: 'Hoofdplaatsen-memory',
    emoji: '🃏',
    sticker: '🦋',
    description: 'Zoek telkens de provincie en haar hoofdplaats.',
    start: App.kinds.memory({
      count: 6,
      pairs: provinces
        .filter((p) => p.capital !== p.name) // Antwerpen-Antwerpen is geen leuk paar
        .map((p) => ({ a: { text: p.name, emoji: '🗺️' }, b: { text: p.capital, emoji: '🏙️' } })),
    }),
  });

  App.register({
    id: 'hoofdplaatsen-tabel',
    typing: true,
    group: 'hoofdplaatsen',
    title: 'Invultabel hoofdplaatsen',
    emoji: '📝',
    sticker: '🐬',
    description: 'Vul bij elke provincie de hoofdplaats in, zonder te kijken.',
    start: App.kinds.table({
      columns: ['Provincie', 'Hoofdplaats'],
      rows: provinces.map((p) => ({ given: p.name, answer: p.capital, accept: p.accept })),
      prompt: 'Vul in zonder te kijken.',
    }),
  });

  App.register({
    id: 'hoofdplaatsen-schrijven',
    typing: true,
    group: 'hoofdplaatsen',
    title: 'Schrijf de hoofdplaats',
    emoji: '✏️',
    sticker: '🦉',
    description: 'Schrijf de hoofdplaats van de provincie die oplicht.',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'type',
      prompt: `Schrijf de hoofdplaats van **${p.name}**.`,
      show: { map: App.maps.citiesShow, region: p.id, city: `stad-${p.id}` },
      answer: p.capital,
      accept: p.accept,
    })),
  });
})();
