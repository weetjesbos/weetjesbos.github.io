/* Hoofdsteden van de buurlanden (en van België zelf). */
(() => {
  const { neighbours, belgiumFlag } = App.data.belgie;
  const { shuffle, options } = App.util;
  const capitals = neighbours.map((n) => n.capital);
  const countries = neighbours.map((n) => n.name);

  App.registerGroup({ id: 'hoofdsteden', title: 'Hoofdsteden', emoji: '🏰', color: '#3db7ff' });

  App.register({
    id: 'hoofdsteden-kiezen',
    group: 'hoofdsteden',
    title: 'Land en hoofdstad',
    emoji: '🏰',
    sticker: '🦔',
    description: 'Kies de juiste hoofdstad, of het juiste land.',
    questions: () => shuffle([
      ...neighbours.map((n) => ({
        type: 'choice',
        prompt: `Wat is de hoofdstad van **${n.name}**?`,
        show: { flag: n.id },
        options: shuffle(capitals),
        answer: n.capital,
      })),
      ...neighbours.map((n) => ({
        type: 'choice',
        prompt: `**${n.capital}** is de hoofdstad van welk land?`,
        show: { emoji: '🏰', text: n.capital },
        options: options(n.name, countries),
        answer: n.name,
      })),
    ]),
  });

  App.register({
    id: 'hoofdsteden-memory',
    group: 'hoofdsteden',
    title: 'Hoofdsteden-memory',
    emoji: '🃏',
    sticker: '🐳',
    description: 'Zoek elk land met zijn hoofdstad. België doet ook mee!',
    start: App.kinds.memory({
      pairs: [
        ...neighbours.map((n) => ({ a: { text: n.name, flag: n.flag }, b: { text: n.capital, emoji: '🏰' } })),
        { a: { text: 'België', flag: belgiumFlag }, b: { text: 'Brussel', emoji: '🏰' } },
      ],
    }),
  });

  App.register({
    id: 'hoofdsteden-tabel',
    typing: true,
    group: 'hoofdsteden',
    title: 'Invultabel hoofdsteden',
    emoji: '📝',
    sticker: '🚀',
    description: 'Zoals op je werkblad: vul de hoofdsteden in zonder te kijken.',
    start: App.kinds.table({
      columns: ['Buurland van België', 'Hoofdstad'],
      rows: neighbours.map((n) => ({ given: n.name, answer: n.capital, accept: n.accept })),
      prompt: 'Vul in zonder te kijken.',
    }),
  });
})();
