/*
 * Woordbouwer: namen van provincies, hoofdplaatsen, buurlanden en hoofdsteden
 * aanvullen met letterblokjes. Een deel van de letters staat er al, zodat jonge
 * kinderen niet te lang met één woord bezig zijn.
 */
(() => {
  const { provinces, neighbours, sea } = App.data.belgie;
  const { shuffle, sample } = App.util;

  // Hoogstens 4 open letters, en nooit meer dan de helft van het woord.
  const blanks = (word) => Math.min(4, Math.ceil(word.replace(/[^\p{L}]/gu, '').length / 2));
  const build = (q) => ({ type: 'letters', blanks: blanks(q.answer), ...q });

  // Per soort vraag: de lijst en hoeveel er per spel uit komen (samen 10).
  // Antwoorden die al in de vraag staan (de hoofdplaats van Antwerpen) doen niet mee.
  const KINDS = [
    [3, provinces.map((p) => build({
      prompt: 'Hoe heet de provincie die oplicht?',
      show: { map: App.maps.provincesShow, region: p.id },
      answer: p.name,
    }))],
    [3, provinces.filter((p) => p.capital !== p.name).map((p) => build({
      prompt: `Wat is de hoofdplaats van **${p.name}**?`,
      show: { map: App.maps.citiesShow, region: p.id, city: `stad-${p.id}` },
      answer: p.capital,
    }))],
    [2, [...neighbours, sea].map((n) => build({
      prompt: n === sea ? 'Hoe heet de zee die oplicht?' : 'Hoe heet het buurland dat oplicht?',
      show: { map: App.maps.neighboursShow, region: n.id },
      answer: n.name,
    }))],
    [2, neighbours.filter((n) => n.capital !== n.name).map((n) => build({
      prompt: `Wat is de hoofdstad van **${n.name}**?`,
      show: { flag: n.id },
      answer: n.capital,
    }))],
  ];

  App.registerGroup({ id: 'woordbouwer', title: 'Woordbouwer', emoji: '🔤', color: '#ff6fb5' });

  App.register({
    id: 'woordbouwer',
    group: 'woordbouwer',
    title: 'Bouw het woord',
    emoji: '🧱',
    sticker: '🐧',
    description: 'Vul de letters aan die nog ontbreken. Zo leer je de namen ook schrijven.',
    questions: () => shuffle(KINDS.flatMap(([count, list]) => sample(list, count))),
  });
})();
