/*
 * De site als app: registreert de service worker (sw.js) en maakt de knop om de
 * site op het beginscherm te zetten. Elke pagina laadt dit, direct na util.js.
 *
 *   App.install.button()   knop "📲 Installeer als app", voor de startpagina
 *
 * Chrome en Edge (Android, computer) melden zelf wanneer installeren kan; pas dan
 * verschijnt de knop, en die opent hun vraag. Safari op iPad en iPhone heeft daar
 * geen API voor: daar toont de knop hoe het via "Deel" gaat. Draait de site al als
 * app, of vanaf file://, dan blijft de knop weg.
 *
 * Een pagina zonder knop laat de installatiebalk van Chrome zelf staan.
 */
(() => {
  const web = location.protocol.startsWith('http');
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const apple = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad doet zich voor als Mac
  let prompt = null; // de uitgestelde installatievraag van Chrome
  let wanted = false; // staat er een knop op deze pagina?

  if (web && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* dan maar zonder offline */ });
  }

  addEventListener('beforeinstallprompt', (event) => {
    if (!wanted) return;
    event.preventDefault();
    prompt = event;
    update();
  });

  addEventListener('appinstalled', () => {
    prompt = null;
    update();
  });

  const available = () => web && !standalone && (prompt !== null || apple);

  function update() {
    for (const button of document.querySelectorAll('.install-button')) button.hidden = !available();
  }

  async function install() {
    if (!prompt) {
      appleHelp();
      return;
    }
    const event = prompt;
    prompt = null; // Chrome laat de vraag maar één keer stellen
    update();
    await event.prompt();
  }

  function appleHelp() {
    const { el } = App.util;
    const overlay = el('div', { class: 'end-overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } },
      el('div', { class: 'end-card install-help' },
        el('h2', {}, '📲 Als app'),
        el('ol', {},
          el('li', {}, 'Tik in Safari op de knop ', el('b', {}, 'Deel'), ' (een vierkantje met een pijl ⬆️; soms zit die eerst achter •••).'),
          el('li', {}, 'Kies ', el('b', {}, 'Zet op beginscherm'), '.'),
          el('li', {}, 'Tik op ', el('b', {}, 'Voeg toe'), '. WeetjesBos.Be staat nu bij je apps.')),
        el('div', { class: 'end-actions' },
          el('button', { class: 'btn btn-primary', type: 'button', onclick: () => overlay.remove() }, 'Begrepen'))));
    document.body.append(overlay);
  }

  App.install = {
    button() {
      wanted = true;
      return App.util.el('button', {
        class: 'btn btn-pill install-button', type: 'button', hidden: !available(), onclick: install,
      }, '📲 Installeer als app');
    },
  };
})();
