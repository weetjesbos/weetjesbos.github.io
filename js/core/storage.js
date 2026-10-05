/*
 * Voortgang (sterren per oefening) en instellingen, bewaard in localStorage.
 * Elke toegang zit in try/catch: in een privévenster kan opslag ontbreken,
 * en dan werkt de site gewoon zonder te onthouden.
 */
App.storage = (() => {
  // Elk spel bewaart apart: zo houdt elk kind zijn eigen sterren.
  const KEY = App.site.storageKey;
  let state = { exercises: {}, muted: false };

  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) state = { ...state, ...saved };
  } catch (e) { /* geen opslag beschikbaar */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* idem */ }
  }

  return {
    stars(id) {
      return state.exercises[id]?.stars ?? 0;
    },

    /* Bewaart een resultaat; geeft terug of er een nieuwe sticker is. */
    record(id, stars) {
      const before = this.stars(id);
      const entry = state.exercises[id] ?? { stars: 0, plays: 0 };
      entry.stars = Math.max(entry.stars, stars);
      entry.plays += 1;
      state.exercises[id] = entry;
      save();
      return { improved: stars > before, newSticker: stars === 3 && before < 3 };
    },

    totalStars() {
      return App.exercises.reduce((sum, e) => sum + this.stars(e.id), 0);
    },

    hasSticker(id) {
      return this.stars(id) === 3;
    },

    get muted() {
      return state.muted;
    },

    set muted(value) {
      state.muted = value;
      save();
    },

    reset() {
      state.exercises = {};
      save();
    },
  };
})();
