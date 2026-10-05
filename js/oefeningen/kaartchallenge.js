/* Eindbaas: een mix van vragen uit de andere oefeningen. */
(() => {
  // Elke quiz-oefening die hier staat, levert vragen voor de mix
  // (uitgeschakelde oefeningen, zoals de typoefeningen, worden overgeslagen).
  const SOURCES = [
    'provincies-aanwijzen', 'provincie-benoemen', 'provincies-schrijven',
    'hoofdplaatsen-kiezen', 'hoofdplaatsen-schrijven',
    'buren-aanwijzen', 'buren-schrijven', 'hoofdsteden-kiezen', 'woordbouwer',
  ];
  const COUNT = 15;

  App.registerGroup({ id: 'challenge', title: 'Grote kaartchallenge', emoji: '🏆', color: '#ff5d5d' });

  App.register({
    id: 'kaartchallenge',
    group: 'challenge',
    title: 'Kaartchallenge',
    emoji: '🏆',
    sticker: '👑',
    description: `${COUNT} gemengde vragen over alles. Ben jij de kaartkampioen?`,
    questions: () => App.util.sample(SOURCES.map((id) => App.exercise(id)).filter(Boolean).flatMap((e) => e.questions()), COUNT),
  });
})();
