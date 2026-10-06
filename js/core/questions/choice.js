/*
 * Vraagtype 'choice': kies het juiste antwoord uit een paar knoppen.
 *
 *   { type: 'choice', prompt: 'Welke provincie licht op?',
 *     show: { map: {...}, region: 'luik' },     // optioneel, zie App.ui.showVisual
 *     options: ['Luik', 'Namen', ...], answer: 'Luik', tries: 2,
 *     long: true,                               // optioneel: lange antwoorden, bv. een uitleg
 *     whyNot: (option) => 'Dat is 16:15.',      // optioneel: wat er mis is aan een fout antwoord
 *     explain: 'Tel eerst door tot 15:00.' }    // optioneel: uitleg bij het juiste antwoord
 *
 * Heeft het plaatje een `show.reveal`, dan toont dat bij het antwoord zijn uitleg
 * (bv. de sprongen op een tijdlijn) en blijft de vraag wat langer staan.
 */
App.registerQuestionType('choice', {
  ask(q, game) {
    const { el } = App.util;
    const tries = q.tries ?? 2;
    let mistakes = 0;

    game.ask(q.prompt);
    const map = App.ui.showVisual(q.show, game);
    const grid = el('div', { class: `choices ${q.long ? 'is-long' : ''}` });
    game.controls.append(grid);

    return new Promise((resolve) => {
      const buttons = q.options.map((option, i) => el('button', {
        class: `btn choice choice-${i % 4}`,
        onclick: (event) => pick(option, event.currentTarget),
      }, option));
      grid.append(...buttons);

      const reveal = () => {
        buttons.forEach((b) => { b.disabled = true; });
        buttons.find((b) => b.textContent === q.answer)?.classList.add('is-good');
        App.ui.revealOnMap(map, q.show, q.answer);
        q.show?.reveal?.();
      };

      async function pick(option, button) {
        if (option === q.answer) {
          reveal();
          game.correct(button, { firstTry: mistakes === 0 });
          await App.util.wait(q.show?.reveal ? 2000 : 1100);
          resolve();
          return;
        }
        mistakes += 1;
        button.disabled = true;
        button.classList.add('is-wrong');
        if (mistakes < tries) {
          game.wrong(q.whyNot?.(option));
          return;
        }
        reveal();
        game.wrong(`Het juiste antwoord is **${q.answer}**.${q.explain ? ` ${q.explain}` : ''}`);
        await game.continueButton();
        resolve();
      }
    });
  },
});
