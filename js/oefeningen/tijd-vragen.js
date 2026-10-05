/*
 * Vraagbouwers voor de woorden van "vroeger en nu", gedeeld door verschillende
 * oefeningen (zoals App.maps bij België Ontdekker):
 *   App.tijd.meaning(woord)   "Wat betekent ...?", kies de uitleg
 *   App.tijd.word(woord)      kies het woord bij de uitleg
 *   App.tijd.letters(woord)   bouw het woord bij de uitleg met letterblokjes
 */
App.tijd = (() => {
  const { words } = App.data.tijd;
  const { shuffle } = App.util;

  /*
   * Drie foute antwoorden: twee uit hetzelfde tijdvak (dat is moeilijker dan
   * "laptop" naast "groot Romeins huis"), de rest van elders. Nooit twee met
   * dezelfde uitleg, want Grieken en Romeinen zijn allebei "volk uit de Oudheid".
   */
  function wrongOnes(w) {
    const seen = new Set([w.meaning]);
    const near = shuffle(words.filter((x) => w.era && x.era === w.era));
    const far = shuffle(words.filter((x) => !w.era || x.era !== w.era));
    const picked = [];
    for (const [list, upTo] of [[near, 2], [far, 3]]) {
      for (const x of list) {
        if (picked.length >= upTo) break;
        if (seen.has(x.meaning)) continue;
        seen.add(x.meaning);
        picked.push(x);
      }
    }
    return picked;
  }

  return {
    meaning: (w) => ({
      type: 'choice',
      long: true,
      prompt: `Wat betekent **${w.word}**?`,
      show: { emoji: w.emoji, text: w.word },
      options: shuffle([w, ...wrongOnes(w)]).map((x) => x.meaning),
      answer: w.meaning,
    }),
    // De rol met de uitleg, geen emoji van het woord: dat zou het antwoord verklappen.
    word: (w) => ({
      type: 'choice',
      prompt: 'Welk woord past bij deze uitleg?',
      show: { emoji: '📜', text: w.meaning },
      options: shuffle([w, ...wrongOnes(w)]).map((x) => x.word),
      answer: w.word,
    }),
    letters: (w) => ({
      type: 'letters',
      prompt: 'Welk woord is dit? Tik de letters in de juiste volgorde.',
      show: { emoji: '📜', text: w.meaning },
      answer: w.word,
    }),

    /* Woorden zonder twee keer dezelfde uitleg, voor memory en verbinden. */
    uniqueMeanings(list = words) {
      return list.filter((w, i) => list.findIndex((x) => x.meaning === w.meaning) === i);
    },
  };
})();
