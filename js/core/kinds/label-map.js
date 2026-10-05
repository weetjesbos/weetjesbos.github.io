/*
 * Spelvorm 'labelMap': sleep namen naar de juiste plaats op de blinde kaart.
 * Tikken werkt ook: eerst een naam, dan een gebied.
 *
 *   start: App.kinds.labelMap({
 *     items: ['namen', 'luik'],            // gebieden die een naam krijgen
 *     map: { clickable: [...], ... },      // kaartconfig, zie App.MapView
 *     prompt: 'Sleep elke naam naar ...',
 *   })
 */
App.kinds.labelMap = ({ items, map: config, prompt }) => (game) => {
  const { el, shuffle } = App.util;
  const data = App.data.belgie;
  const map = game.map(config);
  const tray = el('div', { class: 'label-tray' });
  const mistakes = {};
  let selected = null;
  let placed = 0;

  game.ask(prompt ?? 'Sleep elke naam naar de juiste plaats op de kaart.');
  game.stage.append(map.element);
  game.controls.append(tray);
  game.setProgress(0, items.length);

  for (const id of shuffle(items)) {
    const chip = el('button', { class: 'label-chip', type: 'button', 'data-id': id }, data.name(id));
    tray.append(chip);
    App.ui.draggable(chip, {
      onTap: () => select(chip),
      onMove: (x, y) => hover(map.regionAt(x, y)),
      onDrop: (x, y) => {
        hover(null);
        const region = map.regionAt(x, y);
        if (region) place(chip, region, { x, y });
      },
    });
  }

  map.onPick = (region, event) => {
    if (selected) place(selected, region, { x: event.clientX, y: event.clientY });
    else game.say('Kies eerst een naam hieronder. 👇');
  };

  let hovered = null;
  function hover(region) {
    if (region === hovered) return;
    if (hovered) map.unmark(hovered, 'drop');
    if (region) map.mark(region, 'drop');
    hovered = region;
  }

  function select(chip) {
    tray.querySelectorAll('.is-selected').forEach((c) => c !== chip && c.classList.remove('is-selected'));
    chip.classList.toggle('is-selected');
    selected = chip.classList.contains('is-selected') ? chip : null;
    if (selected) game.say(`Waar ligt **${data.name(chip.dataset.id)}**? Tik op de kaart.`);
  }

  async function place(chip, region, at) {
    const id = chip.dataset.id;
    if (region === id) {
      selected = null;
      chip.remove();
      map.found(id);
      placed += 1;
      game.setProgress(placed, items.length);
      game.correct(at, { firstTry: !mistakes[id] });
      if (placed === items.length) {
        await App.util.wait(900);
        game.finish({ max: items.length });
      }
      return;
    }

    mistakes[id] = (mistakes[id] ?? 0) + 1;
    map.flash(region, 'wrong');
    chip.classList.remove('is-shake');
    void chip.offsetWidth;
    chip.classList.add('is-shake');
    const note = data.note(region);
    if (note) game.wrong(note);
    else if (mistakes[id] >= 2) {
      game.wrong(`Kijk, **${data.name(id)}** knippert nu op de kaart!`);
      map.flash(id, 'reveal', 2400);
    } else game.wrong(`Daar ligt **${data.name(id)}** niet. Probeer nog eens!`);
  }
};
