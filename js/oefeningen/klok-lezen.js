/* Tik Tak Tijd: de wijzerklok en de cijferklok lezen, in cijfers en in woorden. */
(() => {
  const { read, say, sayPairs } = App.klok;

  App.registerGroup({ id: 'klok-lezen', title: 'Klok lezen', emoji: '🕰️', color: '#2ec27e' });

  App.register({
    id: 'klok-hoe-laat',
    group: 'klok-lezen',
    title: 'Hoe laat is het?',
    emoji: '🕒',
    sticker: '🐨',
    description: 'Lees de wijzerklok tot op de minuut. Eerst met alle cijfers, op het einde zonder.',
    // Steeds minder hulp op de wijzerplaat, en op het einde de 24-urenklok.
    questions: () => [
      ...[1, 2, 3].map(() => read({ numbers: 'all' })),
      ...[1, 2, 3].map(() => read({ numbers: 'quarters' })),
      ...[1, 2].map(() => read({ numbers: 'none' })),
      ...[1, 2].map(() => read({ numbers: 'quarters', daypart: true })),
    ],
  });

  App.register({
    id: 'klok-zeg-het',
    group: 'klok-lezen',
    title: 'Zeg het in woorden',
    emoji: '💬',
    sticker: '🦒',
    description: 'Hoe zeg je 15:45? Kies de juiste woorden, met het juiste dagdeel.',
    questions: () => [1, 2, 3, 4, 5, 6, 7, 8].map(say),
  });

  App.register({
    id: 'klok-verbind',
    group: 'klok-lezen',
    title: 'Verbind de tijden',
    emoji: '🔗',
    sticker: '🦦',
    description: 'Sleep elke cijferklok naar dezelfde tijd in woorden.',
    start: App.kinds.match({
      pairs: sayPairs(),
      count: 6,
      prompt: 'Sleep elke tijd naar dezelfde tijd in woorden.',
      texts: {
        pick: (text) => `Hoe zeg je **${text}**? Tik op de juiste woorden.`,
        wrong: (text) => `Dat is niet **${text}**. Kijk naar het uur én naar het dagdeel!`,
        reveal: (text) => `Kijk, **${text}** in woorden licht nu groen op!`,
      },
    }),
  });
})();
