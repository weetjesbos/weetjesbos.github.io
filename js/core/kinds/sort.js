/*
 * Spelvorm 'sort': sorteer kaartjes in vakken (bv. woorden per tijdvak).
 * Er ligt telkens één kaartje klaar: sleep het naar een vak, of tik op het vak.
 *
 *   start: App.kinds.sort({
 *     bins: [{ id: 'oudheid', name: 'Oudheid', hint: 'Grieken en Romeinen', emoji: '🏛️', color: '#d9822b' }, ...],
 *     items: [{ text: 'toga', emoji: '🥻', bin: 'oudheid' }, ...],
 *     count: 10,   // optioneel: zoveel kaartjes, zo gelijk mogelijk verdeeld over de vakken
 *     prompt: 'In welke tijd hoort dit woord?',
 *   })
 *
 * De vakken staan onder elkaar als het speelveld hoog is en naast elkaar als
 * het breed is. Wat juist ligt, blijft als klein kaartje in het vak liggen.
 */
App.kinds.sort = ({ bins, items, count, prompt }) => (game) => {
  const { el, shuffle, wait } = App.util;
  const deck = count ? spread(items, count) : shuffle(items);
  let current = 0;
  let mistakes = 0;
  let busy = false;

  game.ask(prompt ?? 'In welk vak hoort dit kaartje?');
  game.setProgress(0, deck.length);

  const nodes = {};
  const grid = el('div', { class: 'sort-bins', style: { '--bins': bins.length } }, bins.map((bin) => {
    const pile = el('span', { class: 'sort-pile' });
    nodes[bin.id] = { bin, pile, node: el('button', { class: 'sort-bin', type: 'button', style: { '--bin': bin.color }, onclick: () => drop(bin.id) },
      el('span', { class: 'sort-head' },
        el('span', { class: 'sort-emoji' }, bin.emoji),
        el('span', { class: 'sort-name' }, el('b', {}, bin.name), bin.hint && el('small', {}, bin.hint))),
      pile) };
    return nodes[bin.id].node;
  }));
  game.stage.append(el('div', { class: 'sort-area' }, grid));

  const left = el('div', { class: 'sort-left' });
  const holder = el('div', { class: 'sort-holder' });
  game.controls.append(el('div', { class: 'sort-deck' }, holder, left));
  deal();

  /* Kies `n` kaartjes, om beurten uit elk vak, zodat elk vak aan bod komt. */
  function spread(all, n) {
    const perBin = bins.map((b) => shuffle(all.filter((i) => i.bin === b.id)));
    const picked = [];
    for (let round = 0; picked.length < n && perBin.some((l) => l[round]); round++) {
      for (const list of shuffle(perBin)) if (list[round] && picked.length < n) picked.push(list[round]);
    }
    return shuffle(picked);
  }

  function deal() {
    const item = deck[current];
    mistakes = 0;
    left.textContent = deck.length - current === 1 ? 'Laatste kaartje!' : `Nog ${deck.length - current} kaartjes`;
    const card = el('button', { class: 'sort-card', type: 'button' },
      el('span', { class: 'sort-card-emoji' }, item.emoji),
      el('span', { class: 'sort-card-text' }, item.text));
    App.ui.draggable(card, {
      onTap: () => game.say('Sleep het kaartje naar het juiste vak, of tik op het vak.'),
      onMove: (x, y) => hover(binAt(x, y)),
      onDrop: (x, y) => {
        hover(null);
        const id = binAt(x, y);
        if (id) drop(id);
      },
    });
    holder.replaceChildren(card);
  }

  function binAt(x, y) {
    const node = document.elementFromPoint(x, y)?.closest('.sort-bin');
    return Object.values(nodes).find((n) => n.node === node)?.bin.id ?? null;
  }

  let hovered = null;
  function hover(id) {
    if (id === hovered) return;
    if (hovered) nodes[hovered].node.classList.remove('is-drop');
    if (id) nodes[id].node.classList.add('is-drop');
    hovered = id;
  }

  async function drop(id) {
    if (busy || current >= deck.length) return;
    const item = deck[current];
    const target = nodes[id];
    const card = holder.firstChild;
    if (id === item.bin) {
      busy = true;
      target.node.classList.remove('is-reveal');
      target.pile.append(el('span', { class: 'sort-chip' }, `${item.emoji} ${item.text}`));
      current += 1;
      game.setProgress(current, deck.length);
      game.correct(target.node, { firstTry: mistakes === 0, message: `${App.rewards.praise()} **${item.text}** hoort in het vak **${target.bin.name}**.` });
      card.classList.add('is-gone');
      await wait(600);
      busy = false;
      if (current < deck.length) deal();
      else {
        holder.replaceChildren();
        left.textContent = 'Alles gesorteerd! 🎉';
        await wait(500);
        game.finish({ max: deck.length });
      }
      return;
    }

    mistakes += 1;
    target.node.classList.remove('is-wrong');
    card.classList.remove('is-shake');
    void card.offsetWidth;
    target.node.classList.add('is-wrong');
    card.classList.add('is-shake');
    setTimeout(() => target.node.classList.remove('is-wrong'), 700);
    if (mistakes >= 2) {
      nodes[item.bin].node.classList.add('is-reveal');
      game.wrong(`Kijk: **${item.text}** hoort in het vak **${nodes[item.bin].bin.name}**. Leg het daar maar!`);
    } else {
      game.wrong(`**${item.text}** hoort niet in het vak **${target.bin.name}**. Probeer nog eens!`);
    }
  }
};
