/*
 * Spelvorm 'memory': draai kaartjes om en zoek de paren.
 *
 *   start: App.kinds.memory({
 *     pairs: [{ a: { text: 'Duitsland', flag: {...} }, b: { text: 'Berlijn' } }, ...],
 *     count: 6,   // optioneel: zoveel paren per spel, willekeurig gekozen
 *   })
 *
 * Een paar keer mis is normaal bij memory: pas na meer missers dan er paren
 * zijn, gaan er sterren af.
 */
App.kinds.memory = ({ pairs, count, prompt }) => (game) => {
  const { el, shuffle, sample, wait } = App.util;
  const chosen = count ? sample(pairs, count) : pairs;
  let open = [];
  let found = 0;
  let misses = 0;
  let turns = 0;
  let busy = false;

  game.ask(prompt ?? 'Draai twee kaartjes om. Vind je de paren die bij elkaar horen?');
  game.setProgress(0, chosen.length);

  const cards = shuffle(chosen.flatMap((pair, key) => [
    { key, side: 'a', ...pair.a },
    { key, side: 'b', ...pair.b },
  ]));
  const grid = el('div', { class: 'memory' });
  game.stage.append(grid);
  fitGrid(grid, cards.length, game.stage);

  for (const card of cards) {
    const node = el('button', { class: `memory-card side-${card.side}`, type: 'button', 'aria-label': 'Kaartje' },
      el('span', { class: 'memory-inner' },
        el('span', { class: 'memory-back' }, '?'),
        el('span', { class: 'memory-front' },
          card.flag && App.ui.flag(card.flag),
          card.emoji && el('span', { class: 'memory-emoji' }, card.emoji),
          el('span', { class: 'memory-text' }, card.text))));
    node.addEventListener('click', () => flip(node, card));
    grid.append(node);
  }

  async function flip(node, card) {
    if (busy || node.classList.contains('is-open')) return;
    App.sound.flip();
    node.classList.add('is-open');
    node.setAttribute('aria-label', card.text);
    open.push({ node, card });
    if (open.length < 2) return;

    turns += 1;
    const [first, second] = open;
    open = [];
    if (first.card.key === second.card.key) {
      found += 1;
      first.node.classList.add('is-matched');
      second.node.classList.add('is-matched');
      game.setProgress(found, chosen.length);
      game.correct(second.node, { message: `${App.rewards.praise()} **${first.card.text}** en **${second.card.text}** horen samen.` });
      if (found === chosen.length) {
        await wait(1000);
        const score = Math.max(0, chosen.length - Math.max(0, misses - chosen.length));
        game.finish({ max: chosen.length, score, detail: `Alle paren gevonden in ${turns} beurten!` });
      }
      return;
    }

    misses += 1;
    game.miss('Geen paar. Onthoud goed waar ze liggen! 🧠');
    busy = true;
    await wait(1100);
    first.node.classList.remove('is-open');
    second.node.classList.remove('is-open');
    first.node.setAttribute('aria-label', 'Kaartje');
    second.node.setAttribute('aria-label', 'Kaartje');
    busy = false;
  }

  /*
   * Kies het aantal kolommen waarbij de kaartjes (4:3) het grootst zijn en
   * toch allemaal in de vrije ruimte passen. Opnieuw bij draaien van het scherm.
   */
  function fitGrid(grid, count, area) {
    const GAP = 10;
    const fit = () => {
      const { width, height } = area.getBoundingClientRect();
      if (!width || !height) return;
      let best = { size: 0, cols: 1 };
      for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const w = (width - GAP * (cols - 1)) / cols;
        const h = (height - GAP * (rows - 1)) / rows;
        const size = Math.min(w, (h * 4) / 3, 240);
        if (size > best.size) best = { size, cols };
      }
      grid.style.gridTemplateColumns = `repeat(${best.cols}, ${Math.floor(best.size)}px)`;
    };
    new ResizeObserver(fit).observe(area);
    fit();
  }
};
