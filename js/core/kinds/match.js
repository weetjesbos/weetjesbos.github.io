/*
 * Spelvorm 'match': sleep elk woord naar zijn uitleg, zoals verbinden op een
 * werkblad. Tikken werkt ook: eerst een woord, dan een uitleg.
 *
 *   start: App.kinds.match({
 *     pairs: [{ text: 'villa', target: 'groot Romeins huis' }, ...],
 *     count: 6,    // optioneel: zoveel paren per spel, willekeurig gekozen
 *     prompt: 'Sleep elk woord naar zijn uitleg.',
 *     texts: { pick, wrong, reveal },   // optioneel: eigen zinnetjes, elk (woord) => tekst
 *   })
 *
 * Twee woorden met precies dezelfde uitleg mogen allebei op die uitleg. De
 * lijst met uitleg past zich aan de vrije ruimte aan (App.ui.fitText).
 */
App.kinds.match = ({ pairs, count, prompt, texts }) => (game) => {
  const { el, shuffle, sample, wait } = App.util;
  const say = {
    pick: (text) => `Wat betekent **${text}**? Tik op de juiste uitleg.`,
    wrong: (text) => `**${text}** betekent iets anders. Probeer nog eens!`,
    reveal: (text) => `Kijk, de uitleg van **${text}** licht nu groen op!`,
    ...texts,
  };
  const chosen = count ? sample(pairs, count) : pairs;
  const mistakes = {};
  let selected = null;
  let placed = 0;

  game.ask(prompt ?? 'Sleep elk woord naar zijn uitleg.');
  game.setProgress(0, chosen.length);

  const list = el('div', { class: 'match-list' });
  const slots = shuffle(chosen).map((pair) => {
    const node = el('button', { class: 'match-slot', type: 'button', onclick: () => tapSlot(slot) },
      el('span', { class: 'match-drop' }),
      el('span', { class: 'match-target' }, pair.target));
    const slot = { node, target: pair.target, filled: false };
    list.append(node);
    return slot;
  });
  game.stage.append(list);
  const tray = el('div', { class: 'label-tray' });
  game.controls.append(tray);
  const refit = App.ui.fitText(list, { min: 12, max: 24 });

  for (const pair of shuffle(chosen)) {
    const chip = el('button', { class: 'label-chip', type: 'button' }, pair.text);
    chip.pair = pair;
    tray.append(chip);
    App.ui.draggable(chip, {
      onTap: () => select(chip),
      onMove: (x, y) => hover(slotAt(x, y)),
      onDrop: (x, y) => {
        hover(null);
        const slot = slotAt(x, y);
        if (slot) place(chip, pair, slot);
      },
    });
  }

  function slotAt(x, y) {
    const node = document.elementFromPoint(x, y)?.closest('.match-slot');
    return slots.find((s) => s.node === node && !s.filled) ?? null;
  }

  let hovered = null;
  function hover(slot) {
    if (slot === hovered) return;
    hovered?.node.classList.remove('is-drop');
    slot?.node.classList.add('is-drop');
    hovered = slot;
  }

  function select(chip) {
    tray.querySelectorAll('.is-selected').forEach((c) => c !== chip && c.classList.remove('is-selected'));
    chip.classList.toggle('is-selected');
    selected = chip.classList.contains('is-selected') ? chip : null;
    if (selected) game.say(say.pick(chip.pair.text));
  }

  function tapSlot(slot) {
    if (slot.filled) return;
    if (selected) place(selected, selected.pair, slot);
    else game.say('Kies eerst een woord. 👆');
  }

  async function place(chip, pair, slot) {
    if (slot.target === pair.target) {
      selected = null;
      chip.remove();
      slot.filled = true;
      slot.node.disabled = true;
      slot.node.classList.remove('is-reveal');
      slot.node.classList.add('is-done');
      slot.node.querySelector('.match-drop').textContent = pair.text;
      refit();
      placed += 1;
      game.setProgress(placed, chosen.length);
      game.correct(slot.node, { firstTry: !mistakes[pair.text] });
      if (placed === chosen.length) {
        await wait(900);
        game.finish({ max: chosen.length });
      }
      return;
    }

    mistakes[pair.text] = (mistakes[pair.text] ?? 0) + 1;
    slot.node.classList.remove('is-wrong');
    chip.classList.remove('is-shake');
    void chip.offsetWidth;
    slot.node.classList.add('is-wrong');
    chip.classList.add('is-shake');
    setTimeout(() => slot.node.classList.remove('is-wrong'), 700);
    if (mistakes[pair.text] >= 2) {
      slots.find((s) => !s.filled && s.target === pair.target).node.classList.add('is-reveal');
      game.wrong(say.reveal(pair.text));
    } else {
      game.wrong(say.wrong(pair.text));
    }
  }
};
