/*
 * Alle spellen van de site, elk voor een leerjaar en een vak.
 *
 * De startpagina (index.html) toont ze per leerjaar. Een spelpagina zegt welk
 * spel ze is met <body data-spel="...">; dat spel komt in App.site en geeft de
 * kern de titel, mascotte en opslag. Wordt geladen direct na js/core/app.js.
 *
 * Een nieuw spel: voeg het hier toe en maak een pagina zoals tijdreizigers.html.
 * Verander nooit een bestaande `storageKey`: daar staan de sterren van het kind.
 */
App.sites = [
  {
    id: 'belgie',
    page: 'belgie.html',
    grade: 3,
    subject: 'Aardrijkskunde',
    topic: 'Provincies, hoofdplaatsen en buurlanden',
    color: '#ff8a3d',
    title: 'België Ontdekker',
    subtitle: 'Aanwijzen • vertellen • doen',
    storageKey: 'belgie-ontdekker/v1',
    mascot: '🦊',
    heroIcon: () => App.ui.flag(App.data.belgie.belgiumFlag, 'flag-hero'),
    welcome: 'Hoi! Ik ben Vic de vos. 🗺️ Kies een oefening en verdien sterren en stickers!',
    champion: 'Wauw, alle sterren! Jij bent een echte kaartkampioen! 👑',
  },
  {
    id: 'tijdreizigers',
    page: 'tijdreizigers.html',
    grade: 5,
    subject: 'Geschiedenis',
    topic: 'Het leven van het kind, vroeger en nu',
    color: '#7c5cff',
    title: 'Tijdreizigers',
    subtitle: 'Het leven van het kind, vroeger en nu',
    storageKey: 'tijdreizigers/v1',
    mascot: '🦉',
    heroIcon: () => App.util.el('span', { class: 'hero-icon', 'aria-hidden': 'true' }, '⏳'),
    welcome: 'Hoi! Ik ben Otto de uil. 🕰️ Reis met mij door de tijd en leer alle woorden van je werkkatern!',
    champion: 'Alle sterren! Jij bent helemaal klaar voor de toets! 🎓',
  },
];

App.site = App.sites.find((s) => s.id === document.body.dataset.spel) ?? null;
