/*
 * Service worker: laat de site ook zonder internet werken, als app op een tablet
 * of gsm. Wordt geregistreerd door js/core/install.js (alleen via http(s), niet
 * vanaf file://).
 *
 * Bij de installatie haalt hij de startpagina en elke spelpagina uit js/spellen.js
 * op, met alle scripts, stijlen en afbeeldingen die erin staan. Een nieuw spel
 * komt er dus vanzelf bij; verander je js/spellen.js, dan installeert de browser
 * de service worker opnieuw.
 *
 * Daarna geldt "eerst het netwerk": met internet krijgt het kind altijd de nieuwste
 * versie (en die gaat meteen in de kopie), zonder internet de laatst bewaarde.
 * Er is dus geen versienummer om bij te houden.
 */
importScripts('js/core/app.js', 'js/spellen.js');

const CACHE = 'oefenhoek';
const PAGES = ['./', 'index.html', ...App.sites.map((s) => s.page)];
const FONTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(precache().finally(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin && !FONTS.includes(url.hostname)) return;
  event.respondWith(networkFirst(request));
});

/* Elke pagina met alles wat ze laadt (lokale src= en href=). Wat mislukt, slaan we over. */
async function precache() {
  const cache = await caches.open(CACHE);
  const files = new Set(PAGES);
  await Promise.allSettled(PAGES.map(async (page) => {
    const html = await (await fetch(page, { cache: 'no-cache' })).text();
    for (const [, file] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) files.add(file);
  }));
  await Promise.allSettled([...files].map((file) => cache.add(new Request(file, { cache: 'no-cache' }))));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    // Het lettertype-CSS van Google komt "opaque" binnen (status 0) en mag ook mee.
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  } catch (e) {
    // Een pagina met ?... in de URL is dezelfde pagina.
    const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    return cached ?? Response.error();
  }
}
