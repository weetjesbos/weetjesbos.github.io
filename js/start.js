/*
 * Startpagina (index.html): eerst het leerjaar, dan een onderwerp.
 * Het leerjaar wordt maar één keer gevraagd en daarna onthouden; met
 * "Ander leerjaar" kies je opnieuw. De onderwerpen zijn de spellen uit
 * App.sites (js/spellen.js), met de sterren die het kind er al haalde.
 * Bovenaan staat ook de knop om de site als app te installeren (js/core/install.js).
 */
(() => {
  const { el } = App.util;
  const root = document.getElementById('app');
  const KEY = 'oefenhoek/v1';
  const GRADES = [1, 2, 3, 4, 5, 6];
  const COLORS = ['#ff6fb5', '#2ec27e', '#ff8a3d', '#3db7ff', '#7c5cff', '#ff5d5d'];

  // Oude links naar België Ontdekker (index.html#/oefening/...) blijven werken.
  if (location.hash.startsWith('#/oefening/')) {
    location.replace(`belgie.html${location.hash}`);
    return;
  }

  // In een privévenster kan opslag ontbreken: dan vragen we het leerjaar gewoon elke keer.
  function savedGrade() {
    try { return JSON.parse(localStorage.getItem(KEY))?.grade ?? null; } catch (e) { return null; }
  }

  function saveGrade(grade) {
    try { localStorage.setItem(KEY, JSON.stringify({ grade })); } catch (e) { /* geen opslag */ }
  }

  const label = (grade) => `${grade}${grade === 1 ? 'ste' : 'de'} leerjaar`;
  const sitesFor = (grade) => App.sites.filter((s) => s.grade === grade);

  /* Sterren en stickers uit de opslag van een spel, zonder het spel te laden. */
  function progress(site) {
    try {
      const stars = Object.values(JSON.parse(localStorage.getItem(site.storageKey))?.exercises ?? {}).map((e) => e.stars);
      return { stars: stars.reduce((a, b) => a + b, 0), stickers: stars.filter((s) => s === 3).length };
    } catch (e) {
      return { stars: 0, stickers: 0 };
    }
  }

  function screen(bubble, extra, content) {
    root.replaceChildren(el('section', { class: 'screen home start' },
      el('header', { class: 'hero' },
        el('div', { class: 'hero-title' },
          el('span', { class: 'hero-icon', 'aria-hidden': 'true' }, '🎒'),
          el('div', {},
            el('h1', {}, 'WeetjesBos.Be'),
            el('p', { class: 'hero-sub' }, 'Oefenen voor school, met sterren en stickers'))),
        el('div', { class: 'hero-stats' }, extra),
        el('div', { class: 'speech speech-home' },
          el('div', { class: 'mascot mascot-wave', 'aria-hidden': 'true' }, '🐻'),
          el('div', { class: 'bubble' }, bubble))),
      content));
  }

  function chooseGrade() {
    screen('Hoi! In welk leerjaar zit jij? Dat vraag ik maar één keer.', App.install.button(),
      el('div', { class: 'grade-grid' }, GRADES.map((grade, i) => {
        const count = sitesFor(grade).length;
        return el('button', {
          class: 'grade', type: 'button', disabled: !count, style: { '--c': COLORS[i] },
          onclick: () => { saveGrade(grade); chooseTopic(grade); },
        },
        el('span', { class: 'grade-nr' }, grade),
        el('span', { class: 'grade-name' }, label(grade)),
        el('span', { class: 'grade-count' }, count ? `${count} ${count === 1 ? 'onderwerp' : 'onderwerpen'}` : 'nog leeg'));
      })));
  }

  function chooseTopic(grade) {
    const sites = sitesFor(grade);
    screen(`Welkom in het ${label(grade)}! Kies een onderwerp. 📚`,
      [el('button', { class: 'btn btn-pill', type: 'button', onclick: chooseGrade }, '🔄 Ander leerjaar'), App.install.button()],
      el('div', { class: 'start-main' },
        el('h2', { class: 'start-heading' }, label(grade)),
        el('div', { class: 'topics' }, sites.map(topicCard))));
  }

  function topicCard(site) {
    const { stars, stickers } = progress(site);
    return el('a', { class: 'topic', href: site.page, style: { '--topic': site.color } },
      el('span', { class: 'topic-mascot', 'aria-hidden': 'true' }, site.mascot),
      el('span', { class: 'topic-text' },
        el('span', { class: 'topic-subject' }, site.subject),
        el('span', { class: 'topic-title' }, site.title),
        el('span', { class: 'topic-desc' }, site.topic),
        el('span', { class: 'topic-stars' }, `⭐ ${stars}   📒 ${stickers}`)));
  }

  const grade = savedGrade();
  if (sitesFor(grade).length) chooseTopic(grade);
  else chooseGrade();
})();
