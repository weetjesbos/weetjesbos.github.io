/* De vier buurlanden en de Noordzee. */
(() => {
  const { neighbours, sea } = App.data.belgie;
  const { shuffle } = App.util;
  const places = [...neighbours, sea];

  App.registerGroup({ id: 'buren', title: 'Buurlanden en Noordzee', emoji: '🌍', color: '#2ec27e' });

  App.register({
    id: 'buren-aanwijzen',
    group: 'buren',
    title: 'Wijs de buren aan',
    emoji: '👉',
    sticker: '🐝',
    description: 'Klik op de 4 buurlanden en op de Noordzee.',
    questions: () => shuffle(places).map((n) => ({
      type: 'map-click',
      // "het land" erbij, want Luxemburg is ook een provincie.
      prompt: n.id === 'lu' ? 'Waar ligt het land **Luxemburg**?' : `Waar ligt **${n.name}**?`,
      target: n.id,
      map: App.maps.neighbours,
    })),
  });

  App.register({
    id: 'buren-invullen',
    group: 'buren',
    title: 'Buren op de kaart',
    emoji: '🧩',
    sticker: '🦩',
    description: 'Sleep de namen van de buurlanden en de zee naar hun plaats.',
    start: App.kinds.labelMap({
      items: places.map((n) => n.id),
      map: App.maps.neighbours,
      prompt: 'Sleep elke naam naar de juiste plaats rond België.',
    }),
  });

  App.register({
    id: 'buren-schrijven',
    typing: true,
    group: 'buren',
    title: 'Schrijf het buurland',
    emoji: '✏️',
    sticker: '🐼',
    description: 'Een buurland of de zee licht op. Schrijf de naam.',
    questions: () => shuffle(places).map((n) => ({
      type: 'type',
      prompt: n === sea ? 'Hoe heet de zee die oplicht?' : 'Hoe heet het buurland dat oplicht?',
      show: { map: App.maps.neighboursShow, region: n.id },
      answer: n.name,
    })),
  });
})();
