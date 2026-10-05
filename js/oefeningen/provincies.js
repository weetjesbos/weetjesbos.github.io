/* Provincies: aanwijzen, benoemen en opschrijven. */
(() => {
  const { provinces } = App.data.belgie;
  const { shuffle, options } = App.util;
  const names = provinces.map((p) => p.name);

  App.registerGroup({ id: 'provincies', title: 'Provincies', emoji: '🗺️', color: '#ff8a3d' });

  App.register({
    id: 'provincies-aanwijzen',
    group: 'provincies',
    title: 'Wijs de provincie aan',
    emoji: '👆',
    sticker: '🦁',
    description: 'Klik op de blinde kaart op de provincie die de vos zoekt.',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'map-click',
      prompt: `Waar ligt de provincie **${p.name}**?`,
      target: p.id,
      map: App.maps.provinces,
    })),
  });

  App.register({
    id: 'provincie-benoemen',
    group: 'provincies',
    title: 'Welke provincie licht op?',
    emoji: '💡',
    sticker: '🐸',
    description: 'Eén provincie licht op. Weet jij hoe ze heet?',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'choice',
      prompt: 'Hoe heet de provincie die oplicht?',
      show: { map: App.maps.provincesShow, region: p.id },
      options: options(p.name, names),
      answer: p.name,
    })),
  });

  App.register({
    id: 'provincies-invullen',
    group: 'provincies',
    title: 'Vul de kaart in',
    emoji: '🧩',
    sticker: '🦄',
    description: 'Sleep alle namen naar de juiste provincie.',
    start: App.kinds.labelMap({
      items: provinces.map((p) => p.id),
      map: App.maps.provinces,
      prompt: 'Sleep elke naam naar de juiste provincie.',
    }),
  });

  App.register({
    id: 'provincies-schrijven',
    typing: true,
    group: 'provincies',
    title: 'Schrijf de provincie',
    emoji: '✏️',
    sticker: '🐙',
    description: 'Een provincie licht op. Schrijf haar naam juist op.',
    questions: () => shuffle(provinces).map((p) => ({
      type: 'type',
      prompt: 'Schrijf de naam van de provincie die oplicht.',
      show: { map: App.maps.provincesShow, region: p.id },
      answer: p.name,
    })),
  });
})();
