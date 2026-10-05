/*
 * Kern van de site: de globale namespace en het register van oefeningen.
 *
 * Alles hangt aan één globaal object `App`, zodat de site zonder build-stap
 * en rechtstreeks via file:// werkt (ES-modules worden daar geblokkeerd).
 * Dit bestand wordt als eerste geladen, meteen gevolgd door js/spellen.js,
 * dat zegt welk spel deze pagina is. Ook de service worker (sw.js) laadt die
 * twee, voor de lijst spellen; daarom `self` en niet `window`.
 */
self.App = {
  sites: [],         // alle spellen van de site (js/spellen.js)
  site: null,        // het spel op deze pagina: titel, mascotte en opslag
  data: {},          // feiten en kaartgeometrie (js/data)
  questionTypes: {}, // vraagtypes voor de quiz-speler (js/core/questions)
  kinds: {},         // herbruikbare spelvormen met eigen speelveld (js/core/kinds)
  groups: [],
  exercises: [],

  config: {
    // Oefeningen waarin het kind moet typen. Voorlopig uit: alleen tikken en slepen.
    // Zet op true om ze terug te tonen.
    typing: false,
  },

  registerGroup(group) {
    this.groups.push(group);
  },

  registerQuestionType(name, type) {
    this.questionTypes[name] = type;
  },

  /*
   * Een oefening is een object met:
   *   id, group, title, emoji, description, sticker
   *   typing: true           als het kind moet typen (zie config.typing)
   * en precies één van:
   *   questions()            geeft een lijst vragen voor de quiz-speler
   *   start(game)            bouwt zelf een speelveld in game.stage (en
   *                          game.controls) en roept
   *                          game.finish() op (zie de spelvormen in js/core/kinds)
   */
  register(exercise) {
    for (const key of ['id', 'group', 'title', 'emoji', 'sticker']) {
      if (!exercise[key]) throw new Error(`Oefening mist '${key}': ${JSON.stringify(exercise)}`);
    }
    if (!exercise.questions === !exercise.start) {
      throw new Error(`Oefening '${exercise.id}' heeft ofwel questions() ofwel start() nodig`);
    }
    if (this.exercise(exercise.id)) {
      throw new Error(`Oefening '${exercise.id}' bestaat al`);
    }
    if (exercise.typing && !this.config.typing) return;
    this.exercises.push(exercise);
  },

  exercise(id) {
    return this.exercises.find((e) => e.id === id);
  },
};
