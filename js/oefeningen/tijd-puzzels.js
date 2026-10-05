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
    description: 'In welke tijd hoort elk woord? Sorteer ze van de Oudheid tot nu.',
    start: App.kinds.sort({
      count: 10,
      bins: eras,
      items: words.filter((w) => w.era).map((w) => ({ text: w.word, emoji: w.emoji, bin: w.era })),
      prompt: 'In welke tijd hoort dit woord?',
    }),
  });
})();
