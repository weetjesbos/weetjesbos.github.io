/*
 * Vraagbouwers voor de woorden van "vroeger en nu", gedeeld door verschillende
 * oefeningen (zoals App.maps bij België Ontdekker):
 *   App.tijd.meaning(woord)   "Wat betekent ...?", kies de uitleg
 *   App.tijd.word(woord)      kies het woord bij de uitleg
 *   App.tijd.letters(woord)   bouw het woord bij de uitleg met letterblokjes
 *   App.tijd.history()       vraagreeksen over tijdvakken, leven, eeuwen en verklaringen
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

  // Eén gedeelde bouwer: bij een fout noemt Otto de gekozen optie.
  function choice(prompt, answer, options, explain, text = 'Denk aan je werkblad.', ordered = false) {
    const answers = [...new Set([...options, answer])];
    return {
      type: 'choice', long: true, prompt,
      show: { emoji: '📜', text },
      options: ordered ? answers : shuffle(answers), answer, explain,
      whyNot: (option) => `Je koos **${option}**. ${explain}`,
    };
  }

  // Vóór Christus telt af: een hogere eeuw of een hoger jaartal ligt vroeger.
  function chronological(options) {
    const position = (text) => Number(text.match(/\d+/)[0]) * (text.includes('v.C.') ? -1 : 1);
    return [...options].sort((a, b) => position(a) - position(b));
  }

  function eraQuestion(text, prompt) {
    const { eras } = App.data.tijd;
    const era = App.data.tijd.era(text.era);
    return choice(prompt, era.name, eras.map((e) => e.name),
      'Vergelijk de kenmerken met de zes tijdvakken op je overzicht.', text.text, true);
  }

  function history() {
    const { eras, life, reasons } = App.data.tijd;
    const years = [[1752, false], [1358, false], [681, false], [2434, true], [800, false],
      [1700, false], [1701, false], [2400, true], [2401, true]];
    const centuries = years.map(([year, before]) => {
      const century = Math.ceil(year / 100);
      const label = (n) => `${n}${n === 1 || n === 8 || n >= 20 ? 'ste' : 'de'} eeuw${before ? ' v.C.' : ''}`;
      const answer = label(century);
      const yearText = `${year}${before ? ' v.C.' : ''}`;
      const first = before ? century * 100 : (century - 1) * 100 + 1;
      const last = before ? (century - 1) * 100 + 1 : century * 100;
      return choice(`In welke eeuw ligt **${yearText}**?`, answer,
        chronological([answer, label(century - 1), label(century + 1), before ? label(century).replace(' v.C.', '') : `${answer} v.C.`]),
        `${answer} loopt van ${first}${before ? ' v.C.' : ''} tot ${last}${before ? ' v.C.' : ''}. ${before ? 'Vóór Christus tellen de jaren af.' : 'Een eeuw begint op een jaar dat eindigt op 01 en eindigt op een honderdtal.'}`,
        yearText, true);
    });
    const ranges = [
      ['11de eeuw', '1001 tot 1100', ['1000 tot 1099', '1101 tot 1200'], 'De 10de eeuw eindigt in 1000; de 11de begint in 1001.'],
      ['22ste eeuw', '2101 tot 2200', ['2100 tot 2199', '2201 tot 2300'], 'De 21ste eeuw eindigt in 2100; de 22ste begint in 2101.'],
      ['6de eeuw v.C.', '600 v.C. tot 501 v.C.', ['501 v.C. tot 600 v.C.', '601 v.C. tot 700 v.C.'], 'Vóór Christus tellen we af: eerst 600 v.C., als laatste 501 v.C.'],
    ].map(([name, answer, wrong, explain]) => choice(`Wat zijn het eerste en laatste jaar van de **${name}**?`, answer,
      chronological([answer, ...wrong]), explain, name, true));
    return {
      periods: eras.map((e) => choice(`Welke jaartallen horen op je overzicht bij **${e.name}**?`, e.period,
        eras.map((x) => x.period),
        'Let op de begin- en eindjaren van elk tijdvak.', e.name, true)),
      people: eras.map((e) => eraQuestion({ text: e.people, era: e.id }, 'In welk tijdvak leven deze personages op je werkblad?')),
      life: eras.flatMap((e) => App.util.sample(life.filter((x) => x.era === e.id), 2))
        .map((item) => eraQuestion(item, 'Bij welk tijdvak staat dit kenmerk op je overzicht?')),
      centuries: [...centuries, ...ranges],
      // Drie lange opties laten ook plaats voor feedback en Verder op een gedraaide gsm.
      reasons: reasons.map((r) => ({
        ...choice(r.prompt, r.answer, App.util.sample(r.wrong, 2),
          'Denk aan wonen, school, werk en hulpmiddelen in die tijd.', 'Hoe leefden mensen toen?'),
        explain: r.explain,
      })),
    };
  }

  return {
    history,
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
