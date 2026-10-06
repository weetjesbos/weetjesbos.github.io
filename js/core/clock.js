/*
 * Klokken, tijdlijnen en dienstregelingen om tijd te tonen (zonder leerstof).
 *
 * Een tijdstip is een aantal minuten na middernacht (15:45 = 945), een tijdsduur
 * ook een aantal minuten. Na middernacht tel je gewoon verder (7:15 de volgende
 * ochtend = 1440 + 435); time() toont dat weer als 7:15.
 *
 *   App.clock.time(945)              '15:45'
 *   App.clock.parse('15:45')         945
 *   App.clock.duration(95)           '1 u 35 min'
 *   App.clock.face(945, { numbers, caption })
 *       wijzerklok die zich aanpast aan de vrije ruimte. numbers: 'all' (1 tot 12),
 *       'quarters' (alleen 12, 3, 6, 9) of 'none'; caption: tekstje eronder
 *   App.clock.digital(945)           cijferklok met '15:45'
 *   App.clock.timeline({ from, to, ask, emoji })
 *       tijdlijn om door te tellen, met eerst een vraagteken. ask: 'duration'
 *       (hoe lang?), 'end' (hoe laat dan?) of 'start' (hoe laat was het?).
 *       Geeft { element, reveal }: reveal() toont de sprongen tot het volle uur,
 *       de hele uren en de rest, en het antwoord.
 *   App.clock.timetable({ emoji, title, stops, runs, mark })
 *       dienstregeling: een rij per halte, een kolom per rit (runs: lijsten met
 *       tijdstippen). mark: rij die oplicht. Geeft { element, reveal(cells) }:
 *       reveal([[rij, kolom], ...]) kleurt die vakjes groen.
 *
 * In een vraag: show: { node: App.clock.face(945) } of, met uitleg bij het
 * antwoord, show: { node: line.element, reveal: line.reveal } (zie App.ui.showVisual).
 */
App.clock = (() => {
  const { el, svg } = App.util;
  let markers = 0;

  const time = (t) => `${Math.floor(t / 60) % 24}:${String(((t % 60) + 60) % 60).padStart(2, '0')}`;

  function parse(text) {
    const [h, m] = text.split(':').map(Number);
    return h * 60 + m;
  }

  function duration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h && `${h} u`, (m || !h) && `${m} min`].filter(Boolean).join(' ');
  }

  /* Punt op de wijzerplaat: hoek in graden (0 = boven, met de klok mee), straal r. */
  function polar(degrees, r) {
    const a = (degrees * Math.PI) / 180;
    return [r * Math.sin(a), -r * Math.cos(a)];
  }

  function face(t, { numbers = 'all', caption } = {}) {
    const h = Math.floor(t / 60) % 12;
    const m = t % 60;
    const drawing = svg('svg', { class: 'clock-face', viewBox: '-100 -100 200 200', role: 'img', 'aria-label': 'Wijzerklok' });
    drawing.append(
      svg('circle', { class: 'clock-rim', r: 97 }),
      svg('circle', { class: 'clock-dial', r: 88 }),
    );
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const [x1, y1] = polar(i * 6, big ? 75 : 80);
      const [x2, y2] = polar(i * 6, 85);
      drawing.append(svg('line', { class: big ? 'clock-tick is-big' : 'clock-tick', x1, y1, x2, y2 }));
    }
    const shown = { all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], quarters: [3, 6, 9, 12], none: [] }[numbers];
    for (const n of shown) {
      const [x, y] = polar(n * 30, 61);
      const label = svg('text', { class: `clock-number ${numbers === 'quarters' ? 'is-big' : ''}`, x, y });
      label.textContent = n;
      drawing.append(label);
    }
    // De kleine wijzer schuift mee met de minuten: om 4:50 staat hij bijna op de 5.
    drawing.append(
      svg('line', { class: 'clock-hand is-hour', x1: 0, y1: 10, x2: 0, y2: -44, transform: `rotate(${(h + m / 60) * 30})` }),
      svg('line', { class: 'clock-hand is-minute', x1: 0, y1: 14, x2: 0, y2: -72, transform: `rotate(${m * 6})` }),
      svg('circle', { class: 'clock-pin', r: 6 }),
    );
    return el('div', { class: 'clock' },
      el('div', { class: 'clock-box' }, drawing),
      caption && el('div', { class: 'clock-caption' }, caption));
  }

  function digital(t) {
    return el('div', { class: 'clock-digital', role: 'img', 'aria-label': `Cijferklok: ${time(t)}` }, time(t));
  }

  /*
   * Sprongen om door te tellen van a naar b (a < b): eerst tot het volle uur,
   * dan alle hele uren in één keer, dan de rest. Achteruit (van b terug naar a)
   * is hetzelfde met negatieve tijden.
   */
  function jumps(a, b) {
    const list = [];
    let t = a;
    const hour = Math.ceil(t / 60) * 60;
    if (t !== hour && hour <= b) {
      list.push([t, hour]);
      t = hour;
    }
    const whole = Math.floor((b - t) / 60) * 60;
    if (whole) {
      list.push([t, t + whole]);
      t += whole;
    }
    if (t < b) list.push([t, b]);
    return list;
  }

  function timeline({ from, to, ask = 'duration', emoji }) {
    // Smal getekend, zodat de tekst ook op een gsm groot genoeg is.
    const W = 480;
    const BASE = 118;
    const back = ask === 'start';
    const hops = back ? jumps(-to, -from).map(([a, b]) => [-a, -b]) : jumps(from, to);
    const id = `tl-arrow-${++markers}`;

    // Elke sprong krijgt minstens een kwart van de lijn, anders past zijn label niet.
    const total = to - from;
    const sorted = hops.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((p, q) => p[0] - q[0]);
    const weights = sorted.map(([a, b]) => Math.max(b - a, total * 0.25));
    const sum = weights.reduce((x, y) => x + y, 0);
    const xs = new Map([[from, 40]]);
    let x = 40;
    sorted.forEach(([, b], i) => {
      x += ((W - 80) * weights[i]) / sum;
      xs.set(b, x);
    });

    const drawing = svg('svg', { class: 'timeline-svg', viewBox: `0 0 ${W} 172` });
    const defs = svg('defs');
    for (const kind of ['plain', 'jump']) {
      const marker = svg('marker', { id: `${id}-${kind}`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' });
      marker.append(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: `timeline-head is-${kind}` }));
      defs.append(marker);
    }
    drawing.append(defs, svg('line', { class: 'timeline-line', x1: 20, y1: BASE, x2: W - 20, y2: BASE }));

    const arc = (x1, x2, label, cls) => {
      const g = svg('g', { class: `timeline-hop ${cls}` });
      const height = Math.min(70, Math.abs(x2 - x1) * 0.5);
      const head = cls === 'is-jump' ? 'jump' : 'plain';
      g.append(svg('path', { d: `M${x1},${BASE - 4} Q${(x1 + x2) / 2},${BASE - 4 - height * 2} ${x2},${BASE - 4}`, 'marker-end': `url(#${id}-${head})` }));
      const text = svg('text', { x: (x1 + x2) / 2, y: BASE - 16 - height });
      text.textContent = label;
      g.append(text);
      return g;
    };
    const tick = (t, label, cls = '') => {
      const g = svg('g', { class: `timeline-tick ${cls}` });
      g.append(svg('circle', { cx: xs.get(t), cy: BASE, r: 7 }));
      const text = svg('text', { x: xs.get(t), y: BASE + 40 });
      text.textContent = label;
      g.append(text);
      return g;
    };

    // Vooraf: één grote boog met een vraagteken (of met de gegeven duur).
    const sign = back ? '−' : '+';
    const before = svg('g', { class: 'timeline-before' });
    before.append(
      back ? arc(xs.get(to), xs.get(from), `${sign} ${duration(total)}`, 'is-given')
        : arc(xs.get(from), xs.get(to), ask === 'duration' ? '?' : `${sign} ${duration(total)}`, ask === 'duration' ? 'is-question' : 'is-given'),
      tick(from, ask === 'start' ? '?' : time(from), ask === 'start' ? 'is-question' : ''),
      tick(to, ask === 'end' ? '?' : time(to), ask === 'end' ? 'is-question' : ''),
    );
    drawing.append(before);

    const sumNode = el('div', { class: 'timeline-sum' });
    const element = el('div', { class: 'timeline' },
      emoji && el('div', { class: 'timeline-emoji', 'aria-hidden': 'true' }, emoji),
      drawing,
      sumNode);

    function reveal() {
      if (!before.isConnected) return;
      before.remove();
      const after = svg('g', { class: 'timeline-after' });
      for (const [a, b] of hops) after.append(arc(xs.get(a), xs.get(b), `${sign} ${duration(Math.abs(b - a))}`, 'is-jump'));
      for (const [a, b] of sorted.slice(0, -1)) after.append(tick(b, time(b), 'is-step'));
      after.append(
        tick(from, time(from), ask === 'start' ? 'is-answer' : ''),
        tick(to, time(to), ask === 'end' ? 'is-answer' : ''),
      );
      drawing.append(after);
      if (hops.length > 1) {
        sumNode.innerHTML = App.util.rich(`${hops.map(([a, b]) => duration(Math.abs(b - a))).join(' + ')} = **${duration(total)}**`);
      }
    }

    return { element, reveal };
  }

  function timetable({ emoji, title, stops, runs, mark }) {
    const cells = stops.map((stop, row) => el('tr', { class: row === mark ? 'is-mark' : '' },
      el('th', { scope: 'row' }, stop),
      runs.map((run) => el('td', {}, time(run[row])))));
    const element = el('div', { class: 'timetable' },
      el('div', { class: 'timetable-card' },
        el('div', { class: 'timetable-title' }, `${emoji} ${title}`),
        el('table', {}, el('tbody', {}, cells))));
    App.ui.fitText(element, { min: 11, max: 28 });

    function reveal(list = []) {
      for (const [row, col] of list) cells[row].children[col + 1].classList.add('is-good');
    }
    return { element, reveal };
  }

  return { time, parse, duration, face, digital, timeline, timetable };
})();
