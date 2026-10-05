/*
 * Vraagtype 'map-click': wijs iets aan op de kaart.
 *
 *   { type: 'map-click', prompt: 'Waar ligt **Namen**?', target: 'namen',
 *     map: { clickable: [...], belgium, cities }, tries: 2 }
 *
 * Bij een fout zegt de vos wat je wél aanklikte. Na `tries` fouten toont
 * de kaart het juiste antwoord.
 */
App.registerQuestionType('map-click', {
  ask(q, game) {
    const data = App.data.belgie;
    const map = game.map(q.map);
    const tries = q.tries ?? 2;
    let mistakes = 0;

    game.ask(q.prompt);
    game.stage.append(map.element);

    return new Promise((resolve) => {
      map.onPick = async (id, event) => {
        if (id === q.target) {
          map.onPick = null;
          map.found(id);
          map.mark(id, 'good');
          game.correct({ x: event.clientX, y: event.clientY }, {
            firstTry: mistakes === 0,
            message: `${App.rewards.praise()} Dat is **${data.name(id)}**.`,
          });
          await App.util.wait(1100);
          resolve();
          return;
        }

        mistakes += 1;
        map.flash(id, 'wrong');
        map.peekLabel(id);
        const note = data.note(id);
        if (mistakes < tries) {
          game.wrong(`Oei, dat is **${data.name(id)}**. ${note ?? 'Probeer nog eens!'}`);
          return;
        }

        map.onPick = null;
        game.wrong(`Dat is **${data.name(id)}**. ${note ?? ''} Kijk: hier ligt **${data.name(q.target)}**!`);
        map.mark(q.target, 'reveal');
        map.showLabel(q.target);
        await game.continueButton();
        resolve();
      };
    });
  },
});
