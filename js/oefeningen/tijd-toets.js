/* Vroeger en nu: de proeftoets, met alle woorden en elk nieuw onderdeel van de herhaling. */
(() => {
  const { words } = App.data.tijd;
  const { shuffle, pick } = App.util;

  App.registerGroup({ id: 'tijd-toets', title: 'Klaar voor de toets?', emoji: '🎓', color: '#ff5d5d' });

  App.register({
    id: 'tijd-proeftoets',
    group: 'tijd-toets',
    title: 'De proeftoets',
    emoji: '📝',
    sticker: '🐉',
    description: `Alle ${words.length} woorden, plus tijdvakken, personages, leven, eeuwen en verklaringen.`,
    // Elk woord één keer, telkens op een andere manier gevraagd.
    questions: () => shuffle([
      ...words.map((w) => pick([App.tijd.meaning, App.tijd.word, App.tijd.letters])(w)),
      ...Object.values(App.tijd.history()).map((questions) => pick(questions)),
    ]),
  });
})();
