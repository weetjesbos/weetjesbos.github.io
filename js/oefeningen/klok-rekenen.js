/*
 * Tik Tak Tijd: rekenen met tijd, de kern van het 5de leerjaar. Hoe lang duurt
 * het, hoe laat is het dan, en omzetten tussen uren, minuten en seconden.
 */
(() => {
  const { howLong, shift, convert } = App.klok;
  const { shuffle } = App.util;

  App.registerGroup({ id: 'klok-rekenen', title: 'Rekenen met tijd', emoji: '⏱️', color: '#3db7ff' });

  App.register({
    id: 'klok-hoe-lang',
    group: 'klok-rekenen',
    title: 'Hoe lang duurt het?',
    emoji: '⏳',
    sticker: '🐌',
    description: 'Van een begin tot een einde: hoeveel uren en minuten zijn dat? Tel door tot het volle uur.',
    questions: () => [1, 2, 3, 4, 5, 6, 7, 8].map(() => howLong()),
  });

  App.register({
    id: 'klok-later',
    group: 'klok-rekenen',
    title: 'Hoe laat is het dan?',
    emoji: '⏩',
    sticker: '🦀',
    description: 'Wanneer is de film gedaan? Wanneer moet je vertrekken? Tel door of tel terug.',
    questions: () => shuffle(['end', 'end', 'end', 'end', 'start', 'start', 'start', 'start']).map((ask) => shift(ask)),
  });

  App.register({
    id: 'klok-omzetten',
    group: 'klok-rekenen',
    title: 'Uren, minuten, seconden',
    emoji: '🔄',
    sticker: '🐞',
    description: 'Een uur is 60 minuten, een minuut is 60 seconden. Reken om!',
    // Elke soort één keer, en twee extra.
    questions: () => shuffle([...convert.kinds, ...shuffle(convert.kinds).slice(0, 2)]).map((kind) => convert(kind)),
  });
})();
