/*
 * Vraagtype 'type': schrijf het antwoord zelf.
 *
 *   { type: 'type', prompt: 'Hoe heet deze provincie?',
 *     show: {...},                       // optioneel, zie App.ui.showVisual
 *     answer: 'West-Vlaanderen', accept: ['andere schrijfwijze'] }
 *
 * Hoofdletters, spaties en koppeltekens tellen niet. Een kleine tikfout
 * geeft "bijna!". Met de tip-knop verschijnt telkens een letter meer.
 * Na drie pogingen staat het antwoord er en schrijft het kind het over.
 */
App.registerQuestionType('type', {
  ask(q, game) {
    const { el, normalize, levenshtein } = App.util;
    const answers = [q.answer, ...(q.accept ?? [])].map(normalize);
    const target = normalize(q.answer);
    let attempts = 0;
    let tips = 0;
    let copying = false;

    game.ask(q.prompt);
    const map = App.ui.showVisual(q.show, game);

    const input = el('input', {
      class: 'type-input', type: 'text', autocomplete: 'off', autocapitalize: 'off',
      autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Jouw antwoord', placeholder: 'Typ hier…',
    });
    const check = el('button', { class: 'btn btn-primary', type: 'submit' }, 'Controleer ✔');
    const tip = el('button', { class: 'btn btn-secondary', type: 'button' }, '💡 Tip');
    const hint = el('div', { class: 'type-hint' });
    const form = el('form', { class: 'type-form' }, input, check, tip);
    game.controls.append(form, hint);
    input.focus({ preventScroll: true });

    tip.addEventListener('click', () => {
      tips = Math.min(tips + 1, q.answer.length);
      hint.textContent = `Begint met: ${q.answer.slice(0, tips)}…`;
      input.focus();
    });

    return new Promise((resolve) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const given = normalize(input.value);
        if (!given) return;

        if (copying ? given === target : answers.includes(given)) {
          form.classList.add('is-good');
          input.disabled = check.disabled = tip.disabled = true;
          input.value = q.answer;
          hint.textContent = '';
          App.ui.revealOnMap(map, q.show, q.answer);
          const foreign = given !== target && !copying;
          game.correct(input, {
            firstTry: attempts === 0 && tips === 0 && !copying,
            message: foreign ? `Juist! In het Nederlands schrijven we **${q.answer}**.` : undefined,
          });
          await App.util.wait(1200);
          resolve();
          return;
        }

        attempts += 1;
        form.classList.remove('is-shake');
        void form.offsetWidth;
        form.classList.add('is-shake');
        if (copying) {
          game.wrong(`Schrijf het over: **${q.answer}**`);
          return;
        }
        if (attempts >= 3) {
          copying = true;
          tip.disabled = true;
          hint.textContent = '';
          game.wrong(`Het is **${q.answer}**. Schrijf het eens over!`);
          input.value = '';
          input.focus();
          return;
        }
        const close = levenshtein(given, target) <= Math.max(1, Math.floor(target.length / 5));
        game.wrong(close ? 'Bijna! Kijk goed naar de spelling.' : 'Nog niet juist. Probeer nog eens of vraag een 💡 tip.');
        input.select();
      });
    });
  },
});
