/*
 * Vraagtype 'letters': bouw het woord met letterblokjes, zonder te typen.
 * Tik een blokje en het schuift in het eerste lege vakje; tik een vakje om
 * de letter terug te leggen. Zo oefent het kind ook de schrijfwijze.
 *
 *   { type: 'letters', prompt: 'Welk woord is dit?',
 *     show: { emoji: '📜', text: 'groot Romeins huis' },  // optioneel, zie App.ui.showVisual
 *     answer: 'villa', tries: 2,
 *     blanks: 3 }   // optioneel: maar zoveel letters open, de rest staat er al
 *
 * Met `blanks` gaat het sneller voor jonge kinderen: willekeurige letters zijn
 * al ingevuld en het kind legt alleen de open vakjes. Een spatie in het
 * antwoord (bv. "Nieuwe Wereld") wordt een tussenruimte; een koppelteken
 * (bv. "West-Vlaanderen") staat er altijd al. Na een fout blijven de letters die al goed staan groen liggen; na `tries`
 * fouten verschijnt het hele woord.
 */
App.registerQuestionType('letters', {
  ask(q, game) {
    const { el, shuffle, sample, wait } = App.util;
    const tries = q.tries ?? 2;
    const chars = [...q.answer.toLocaleUpperCase('nl')];
    const letterAt = chars.flatMap((c, i) => (/\p{L}/u.test(c) ? [i] : []));
    const open = new Set(q.blanks ? sample(letterAt, q.blanks) : letterAt);
    let mistakes = 0;
    let busy = false;

    return new Promise((resolve) => {
      game.ask(q.prompt);
      const map = App.ui.showVisual(q.show, game);

      // Eén vakje per teken, gegroepeerd per woord. `slots` zijn alleen de open vakjes.
      const slots = [];
      const words = [[]];
      chars.forEach((letter, i) => {
        if (letter === ' ') {
          words.push([]);
          return;
        }
        if (!open.has(i)) {
          words.at(-1).push(el('button', { class: 'letter-slot is-given', type: 'button', disabled: true }, letter));
          return;
        }
        const slot = { letter, tile: null, locked: false };
        slot.node = el('button', { class: 'letter-slot', type: 'button', onclick: () => takeBack(slot) });
        slots.push(slot);
        words.at(-1).push(slot.node);
      });
      // --n: het langste woord, zodat de vakjes klein genoeg worden om op één rij te passen.
      const board = el('div', { class: 'letters-board', 'aria-label': 'Jouw woord', style: { '--n': Math.max(...words.map((w) => w.length)) } },
        words.map((nodes) => el('div', { class: 'letters-word' }, nodes)));
      game.stage.append(board);
      const letters = slots.map((s) => s.letter);

      // Nooit meteen in de juiste volgorde, dat zou het antwoord verklappen.
      let order = shuffle(letters);
      while (letters.length > 1 && new Set(letters).size > 1 && order.join('') === letters.join('')) order = shuffle(letters);
      const tray = el('div', { class: 'letters-tray' });
      const tiles = order.map((letter) => {
        const tile = el('button', { class: 'letter-tile', type: 'button' }, letter);
        tile.addEventListener('click', () => place(tile));
        return tile;
      });
      tray.append(...tiles);
      game.controls.append(tray);

      function place(tile) {
        if (busy || tile.classList.contains('is-used')) return;
        const slot = slots.find((s) => !s.tile);
        if (!slot) return;
        App.sound.pop();
        slot.tile = tile;
        slot.node.textContent = tile.textContent;
        slot.node.classList.add('is-filled');
        tile.classList.add('is-used');
        if (slots.every((s) => s.tile)) check();
      }

      function takeBack(slot) {
        if (busy || !slot.tile || slot.locked) return;
        release(slot);
      }

      function release(slot) {
        slot.tile.classList.remove('is-used');
        slot.tile = null;
        slot.node.textContent = '';
        slot.node.className = 'letter-slot';
      }

      async function check() {
        busy = true;
        await wait(250);
        const wrong = slots.filter((s) => s.tile.textContent !== s.letter);
        if (!wrong.length) {
          board.querySelectorAll('.letter-slot').forEach((n) => n.classList.add('is-good'));
          App.ui.revealOnMap(map, q.show, q.answer);
          game.correct(board, { firstTry: mistakes === 0, message: `${App.rewards.praise()} Het woord is **${q.answer}**.` });
          await wait(1100);
          resolve();
          return;
        }

        mistakes += 1;
        if (mistakes >= tries) {
          for (const s of slots) {
            s.node.textContent = s.letter;
            s.node.className = 'letter-slot is-filled is-reveal';
          }
          tiles.forEach((t) => { t.disabled = true; t.classList.add('is-used'); });
          App.ui.revealOnMap(map, q.show, q.answer);
          game.wrong(`Het woord is **${q.answer}**. Kijk goed hoe je het schrijft!`);
          await game.continueButton();
          resolve();
          return;
        }

        // Wat goed staat, blijft liggen; de rest gaat na een tel terug naar het bakje.
        for (const s of slots) {
          s.locked = !wrong.includes(s);
          s.node.classList.add(s.locked ? 'is-good' : 'is-wrong');
          s.node.disabled = s.locked;
        }
        const good = slots.length - wrong.length;
        game.wrong(good ? `Bijna! ${good === 1 ? 'De groene letter staat' : 'De groene letters staan'} al goed.` : 'Nog niet juist. Probeer nog eens!');
        await wait(900);
        wrong.forEach(release);
        busy = false;
      }
    });
  },
});
