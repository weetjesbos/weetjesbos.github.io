/*
 * Tik Tak Tijd: alles samen. De dienstregeling (lezen, interpreteren en rekenen
 * tegelijk) en de proeftoets, met van elke soort vraag een paar door elkaar.
 */
(() => {
  const { read, say, howLong, shift, convert, timetable } = App.klok;
  const { shuffle } = App.util;

  App.registerGroup({ id: 'klok-samen', title: 'Alles samen', emoji: '🎓', color: '#ff5d5d' });

  App.register({
    id: 'klok-rooster',
    group: 'klok-samen',
    title: 'De bus en de trein',
    emoji: '🚏',
    sticker: '🦝',
    description: 'Lees de dienstregeling: welke bus neem je, en hoe lang duurt de rit?',
    questions: () => shuffle([...timetable.kinds, ...timetable.kinds]).slice(0, 7).map((kind) => timetable(kind)),
  });

  App.register({
    id: 'klok-proeftoets',
    group: 'klok-samen',
    title: 'De klokproef',
    emoji: '📝',
    sticker: '🐆',
    description: 'Twaalf vragen over alles: klok lezen, hoe lang, hoe laat, omzetten en de bus.',
    questions: () => shuffle([
      read({ numbers: 'quarters' }),
      read({ numbers: 'none' }),
      read({ numbers: 'quarters', daypart: true }),
      say(),
      say(),
      howLong(),
      howLong(),
      shift('end'),
      shift('start'),
      convert(),
      convert(),
      timetable(),
    ]),
  });
})();
