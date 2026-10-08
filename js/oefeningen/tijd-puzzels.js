/* Vroeger en nu: verbinden, memory en de tijdmachine (sorteren per tijdvak). */
(() => {
  const { words, eras } = App.data.tijd;

  App.registerGroup({ id: 'tijd-puzzels', title: 'Puzzelen', emoji: '🧩', color: '#e07a2e' });

  App.register({
    id: 'tijd-verbinden',
    group: 'tijd-puzzels',
    title: 'Verbind woord en uitleg',
    emoji: '🔗',
    sticker: '🦙',
    description: 'Sleep elk woord naar zijn uitleg, zoals op je werkblad.',
    start: App.kinds.match({
      count: 6,
      pairs: App.tijd.uniqueMeanings().map((w) => ({ text: w.word, target: w.meaning })),
      prompt: 'Sleep elk woord naar zijn uitleg.',
    }),
  });

  App.register({
    id: 'tijd-memory',
    group: 'tijd-puzzels',
    title: 'Woordmemory',
    emoji: '🃏',
    sticker: '🐿️',
    description: 'Zoek telkens het woord en zijn uitleg.',
    start: App.kinds.memory({
      count: 6,
      // Alleen korte uitleg: een lange past niet leesbaar op een kaartje.
      pairs: App.tijd.uniqueMeanings()
        .filter((w) => w.meaning.length <= 38)
        .map((w) => ({ a: { text: w.word, emoji: w.emoji }, b: { text: w.meaning } })),
      prompt: 'Draai twee kaartjes om. Vind je het woord en zijn uitleg?',
    }),
  });

  App.register({
    id: 'tijd-tijdmachine',
    group: 'tijd-puzzels',
    title: 'De tijdmachine',
    emoji: '🕰️',
    sticker: '🐫',
    description: 'In welke tijd hoort elk woord? Sorteer woorden en kenmerken van de prehistorie tot onze tijd.',
    start: App.kinds.sort({
      count: 10,
      bins: eras,
      items: [
        ...words.filter((w) => w.era).map((w) => ({ text: w.word, emoji: w.emoji, bin: w.era })),
        ...App.data.tijd.life.filter((item) => item.text.length <= 30).map((item) => ({ text: item.text, emoji: '📜', bin: item.era })),
      ],
      prompt: 'Bij welk tijdvak hoort dit op je schooloverzicht?',
    }),
  });
  App.registerGroup({ id: 'tijd-tijdvakken', title: 'Tijdvakken en eeuwen', emoji: '⏳', color: '#1e9bd7' });
  [
    ['tijd-periodes', 'Tijdvakken en jaartallen', '📅', '🦥', 'Kies de jaartallen bij elk van de zes tijdvakken.', 'periods'],
    ['tijd-personages', 'Wie leeft wanneer?', '👥', '🦊', 'Plaats alle personages van je werkblad in hun tijdvak.', 'people'],
    ['tijd-eeuwen', 'Eeuwen speuren', '🔍', '🦇', 'Zoek de eeuw en haar eerste en laatste jaar, ook vóór Christus.', 'centuries'],
  ].forEach(([id, title, emoji, sticker, description, section]) => App.register({
    id, group: 'tijd-tijdvakken', title, emoji, sticker, description,
    questions: () => App.util.shuffle(App.tijd.history()[section]),
  }));

  App.registerGroup({ id: 'tijd-leven', title: 'Leven vroeger en nu', emoji: '🏡', color: '#2a997b' });
  App.register({
    id: 'tijd-leven', group: 'tijd-leven', title: 'Leven door de tijd', emoji: '🧺', sticker: '🦭',
    description: 'Herken wonen, school, werk en vrije tijd. Twee vragen per tijdvak.',
    questions: () => App.util.shuffle(App.tijd.history().life),
  });
  App.register({
    id: 'tijd-waarom', group: 'tijd-leven', title: 'Zo leefden ze', emoji: '💡', sticker: '🦎',
    description: 'Waarom leefden mensen anders? Alle verklaringen van vragen 5 en 6.',
    questions: () => App.util.shuffle(App.tijd.history().reasons),
  });
})();
