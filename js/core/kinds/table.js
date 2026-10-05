/*
 * Spelvorm 'table': een invultabel zoals op het werkblad.
 *
 *   start: App.kinds.table({
 *     columns: ['Buurland van België', 'Hoofdstad'],
 *     rows: [{ given: 'Nederland', answer: 'Amsterdam', accept: [...] }, ...],
 *     prompt: 'Vul in zonder te kijken.',
 *   })
 *
 * Score = rijen die bij de eerste controle meteen juist zijn. Foute rijen
 * mag het kind verbeteren; na twee keer fout verschijnt de eerste letter.
 */
App.kinds.table = ({ columns, rows, prompt, shuffle = false }) => (game) => {
  const { el, normalize, wait } = App.util;
  const ordered = shuffle ? App.util.shuffle(rows) : rows;
  const state = ordered.map((row) => ({ row, done: false, mistakes: 0 }));
  let checks = 0;

  game.ask(prompt ?? 'Vul in zonder te kijken.');
  game.setProgress(0, rows.length);

  const body = el('tbody');
  for (const s of state) {
    s.input = el('input', {
      type: 'text', class: 'table-input', autocomplete: 'off', autocapitalize: 'off',
      autocorrect: 'off', spellcheck: 'false', 'aria-label': `${columns[1]} bij ${s.row.given}`,
    });
    s.hint = el('span', { class: 'table-hint' });
    s.tr = el('tr', {}, el('td', { class: 'table-given' }, s.row.given), el('td', {}, s.input, s.hint));
    body.append(s.tr);
  }
  const check = el('button', { class: 'btn btn-primary', type: 'submit' }, 'Controleer ✔');
  const form = el('form', { class: 'worksheet' },
    el('table', {}, el('thead', {}, el('tr', {}, columns.map((c) => el('th', {}, c)))), body),
    check);
  game.stage.append(form);
  state[0].input.focus({ preventScroll: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const todo = state.filter((s) => !s.done);
    if (todo.every((s) => !s.input.value.trim())) {
      game.say('Vul eerst iets in. ✏️');
      return;
    }
    const firstCheck = checks === 0;
    checks += 1;

    check.disabled = true;
    let wrong = 0;
    for (const s of todo) {
      const answers = [s.row.answer, ...(s.row.accept ?? [])].map(normalize);
      if (answers.includes(normalize(s.input.value))) {
        s.done = true;
        s.input.value = s.row.answer;
        s.input.disabled = true;
        s.hint.textContent = '';
        s.tr.className = 'is-good';
        game.correct(s.input, { firstTry: firstCheck });
        await wait(280);
      } else {
        wrong += 1;
        s.mistakes += 1;
        s.tr.className = '';
        void s.tr.offsetWidth;
        s.tr.className = 'is-wrong';
        if (s.mistakes >= 2) s.hint.textContent = `Begint met: ${s.row.answer.slice(0, s.mistakes - 1)}…`;
      }
    }
    check.disabled = false;
    game.setProgress(state.filter((s) => s.done).length, rows.length);

    if (wrong === 0) {
      await wait(600);
      game.finish({ max: rows.length });
      return;
    }
    game.wrong(wrong === 1 ? 'Eentje is nog niet juist. Verbeter de rode rij!' : `Nog ${wrong} rijen verbeteren. Je kan het!`);
    state.find((s) => !s.done).input.focus();
  });
};
