/*
 * Startscherm, stickerboek en navigatie (#/ en #/oefening/<id>).
 * Wordt als laatste geladen, nadat alle oefeningen geregistreerd zijn.
 */
(() => {
  const { el } = App.util;
  const root = document.getElementById('app');

  function route() {
    const match = location.hash.match(/^#\/oefening\/(.+)$/);
    const exercise = match && App.exercise(decodeURIComponent(match[1]));
    if (exercise) play(exercise);
    else home();
    window.scrollTo(0, 0);
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function play(exercise) {
    App.rewards.clear();
    const game = new App.Game(exercise, {
      onExit: () => go('#/'),
      onReplay: () => play(exercise),
    });
    root.replaceChildren(game.element);
    if (exercise.questions) App.runQuiz(exercise, game);
    else exercise.start(game);
  }

  /* ---------- startscherm ---------- */

  function home() {
    App.rewards.clear();
    const total = App.storage.totalStars();
    const max = App.exercises.length * 3;
    const stickers = App.exercises.filter((e) => App.storage.hasSticker(e.id)).length;

    const soundButton = el('button', { class: 'btn btn-pill', onclick: toggleSound });
    const updateSound = () => { soundButton.textContent = App.storage.muted ? '🔇' : '🔊'; };
    soundButton.setAttribute('aria-label', 'Geluid aan of uit');
    updateSound();
    function toggleSound() {
      App.storage.muted = !App.storage.muted;
      updateSound();
      App.sound.pop();
    }

    // Alles past op één scherm: een compacte kop en daaronder één rij per groep.
    const groups = App.groups.filter((g) => App.exercises.some((e) => e.group === g.id));
    root.replaceChildren(el('section', { class: 'screen home' },
      el('header', { class: 'hero' },
        el('div', { class: 'hero-title' },
          el('a', { class: 'btn-icon btn-back', href: 'index.html', 'aria-label': 'Naar alle onderwerpen', title: 'Naar alle onderwerpen' }, '⬅️'),
          App.site.heroIcon(),
          el('div', {},
            el('h1', {}, App.site.title),
            el('p', { class: 'hero-sub' }, App.site.subtitle))),
        el('div', { class: 'hero-stats' },
          el('div', { class: 'btn btn-pill stat-stars' }, `⭐ ${total} / ${max}`),
          el('button', { class: 'btn btn-pill', onclick: stickerBook }, `📒 ${stickers}/${App.exercises.length}`),
          soundButton),
        el('div', { class: 'speech speech-home' },
          el('div', { class: 'mascot mascot-wave', 'aria-hidden': 'true' }, App.site.mascot),
          el('div', { class: 'bubble' }, greeting(total, max)))),
      el('div', { class: 'groups', style: { '--rows': groups.length } }, groups.map(groupSection)),
    ));
  }

  function greeting(total, max) {
    if (total === 0) return App.site.welcome;
    if (total === max) return App.site.champion;
    return `Goed bezig! Je hebt al ${total} ${total === 1 ? 'ster' : 'sterren'}. Haal 3 sterren voor een sticker!`;
  }

  function groupSection(group) {
    const exercises = App.exercises.filter((e) => e.group === group.id);
    return el('section', { class: 'group', style: { '--group': group.color } },
      el('h2', { title: group.title }, el('span', { class: 'group-emoji' }, group.emoji), el('span', { class: 'group-title' }, group.title)),
      el('div', { class: 'cards', style: { '--cols': Math.max(3, exercises.length) } }, exercises.map(card)));
  }

  function card(exercise) {
    const stars = App.storage.stars(exercise.id);
    return el('a', { class: 'card', href: `#/oefening/${encodeURIComponent(exercise.id)}` },
      el('div', { class: 'card-emoji' }, exercise.emoji),
      el('div', { class: 'card-text' },
        el('div', { class: 'card-title' }, exercise.title),
        el('div', { class: 'card-desc' }, exercise.description ?? '')),
      el('div', { class: 'card-stars', 'aria-label': `${stars} van de 3 sterren` },
        [1, 2, 3].map((i) => el('span', { class: i <= stars ? 'is-on' : '' }, '★'))),
      stars === 3 && el('div', { class: 'card-sticker', title: 'Sticker verdiend!' }, exercise.sticker));
  }

  function stickerBook() {
    const overlay = el('div', { class: 'end-overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } },
      el('div', { class: 'end-card sticker-book' },
        el('h2', {}, '📒 Mijn stickerboek'),
        el('p', { class: 'end-detail' }, 'Haal 3 sterren bij een oefening om haar sticker te verdienen.'),
        el('div', { class: 'sticker-grid' }, App.exercises.map((e) => {
          const has = App.storage.hasSticker(e.id);
          return el('div', { class: `sticker ${has ? 'is-earned' : ''}` },
            el('span', { class: 'sticker-emoji' }, has ? e.sticker : '❔'),
            el('span', { class: 'sticker-name' }, e.title));
        })),
        el('div', { class: 'end-actions' },
          el('button', { class: 'btn btn-primary', onclick: () => overlay.remove() }, 'Sluiten')),
        el('div', { class: 'home-footer' }, resetButton())));
    root.append(overlay);
    if (App.exercises.some((e) => App.storage.hasSticker(e.id))) App.rewards.rain(1200);
  }

  function resetButton() {
    const button = el('button', { class: 'btn-link' }, 'Alle sterren wissen');
    button.addEventListener('click', () => {
      if (button.dataset.confirm) {
        App.storage.reset();
        home();
        return;
      }
      button.dataset.confirm = 'yes';
      button.textContent = 'Zeker? Klik nog eens om alles te wissen.';
      setTimeout(() => {
        delete button.dataset.confirm;
        button.textContent = 'Alle sterren wissen';
      }, 4000);
    });
    return button;
  }

  addEventListener('hashchange', route);
  route();
})();
