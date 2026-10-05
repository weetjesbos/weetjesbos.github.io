/* Vroeger en nu: de woorden en hun uitleg, met keuzevragen en letterblokjes. */
(() => {
  const { words } = App.data.tijd;
  const { sample } = App.util;

  App.registerGroup({ id: 'tijd-woorden', title: 'Woorden leren', emoji: '📖', color: '#7c5cff' });

  App.register({
    id: 'tijd-betekenis',
    group: 'tijd-woorden',
    title: 'Wat betekent het?',
    emoji: '🤔',
    sticker: '🦜',
    description: 'Je krijgt een woord. Kies de juiste uitleg.',
    questions: () => sample(words, 10).map(App.tijd.meaning),
  });

  App.register({
    id: 'tijd-welk-woord',
    group: 'tijd-woorden',
    title: 'Welk woord?',
    emoji: '🔎',
    sticker: '🐘',
    description: 'Je krijgt de uitleg. Welk woord hoort erbij?',
    questions: () => sample(words, 10).map(App.tijd.word),
  });

  App.register({
    id: 'tijd-letters',
    group: 'tijd-woorden',
    title: 'Bouw het woord',
    emoji: '🔤',
    sticker: '🦚',
    description: 'Leg de letterblokjes in de juiste volgorde. Zo leer je het woord ook schrijven.',
    questions: () => sample(words, 8).map(App.tijd.letters),
  });
})();
