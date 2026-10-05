/*
 * Blinde kaart van België met buurlanden en Noordzee, als SVG.
 *
 *   const map = new App.MapView({
 *     clickable: ['namen', 'luik'],   // gebieden die op klikken reageren
 *     belgium: 'provinces',          // of 'plain': België als één vlak
 *     cities: false,                 // of 'dots' / 'targets' (klikbare hoofdplaatsen)
 *     focus: 'belgium',              // of 'all'; standaard 'all' als belgium 'plain' is
 *   });
 *
 * De kaart vult de vrije ruimte: bij focus 'belgium' kiest ze een uitsnede
 * rond België met dezelfde verhouding als die ruimte (zie fitView).
 *   map.onPick = (id, event) => { ... };
 *   game.stage.append(map.element);   // past zich aan de vrije ruimte aan
 *
 * Toestanden van een gebied (CSS-klassen): target, good, wrong, reveal, drop, done.
 * reset() wist alles behalve 'done', zodat gevonden gebieden gekleurd blijven.
 */
App.MapView = (() => {
  const { el, svg } = App.util;

  // Elk gebied krijgt zijn eigen kleur zodra het gevonden is.
  const COLORS = {
    'west-vlaanderen': '#ff9f9f', 'oost-vlaanderen': '#ffc56b', antwerpen: '#ffe36b',
    limburg: '#b5e86b', 'vlaams-brabant': '#7fe0b0', 'waals-brabant': '#7fd6ef',
    henegouwen: '#8fb5ff', namen: '#b9a0ff', luik: '#f0a0e8', luxemburg: '#ffa8c8',
    brussel: '#ff7b7b', nl: '#ffb36b', de: '#ffd84d', fr: '#8fb5ff', lu: '#c3a6ff',
    noordzee: '#3db7ff',
  };

  // Betere plaatsen voor namen dan het berekende zwaartepunt.
  const LABEL_POSITIONS = {
    'vlaams-brabant': [548, 314],
    brussel: [466, 312],
    noordzee: [120, 150],
    nl: [640, 90],
    fr: [250, 650],
  };

  const BELGIUM_LABEL = [520, 440];
  const TRANSIENT = ['target', 'good', 'wrong', 'reveal', 'drop'];
  let instances = 0;

  /* Rechthoek rond `inner` met verhouding `aspect`, zo goed mogelijk binnen `outer`. */
  function fitAspect(inner, aspect, outer) {
    let w = inner.w;
    let h = inner.h;
    if (w / h < aspect) w = h * aspect;
    else h = w / aspect;
    w = Math.min(w, outer.w);
    h = Math.min(h, outer.h);
    const clamp = (v, max) => Math.max(0, Math.min(v, max));
    return {
      x: clamp(inner.x + inner.w / 2 - w / 2, outer.w - w),
      y: clamp(inner.y + inner.h / 2 - h / 2, outer.h - h),
      w, h,
    };
  }

  return class MapView {
    constructor({ clickable = [], belgium = 'provinces', cities = false, focus } = {}) {
      this.geo = App.data.kaartBelgie;
      this.focus = focus ?? (belgium === 'plain' ? 'all' : 'belgium');
      this.clickable = new Set(clickable);
      this.onPick = null;
      this.nodes = {};
      this.labels = {};
      this.permanentLabels = new Set();
      this.build(belgium, cities);
    }

    build(belgium, cities) {
      const { width, height, regions } = this.geo;
      const patternId = `waves-${++instances}`;
      this.svg = svg('svg', {
        class: `map ${belgium === 'plain' ? 'is-plain' : ''}`,
        viewBox: `0 0 ${width} ${height}`,
        role: 'img',
        'aria-label': 'Blinde kaart van België en de buurlanden',
      });

      const defs = svg('defs');
      const pattern = svg('pattern', { id: patternId, width: 60, height: 24, patternUnits: 'userSpaceOnUse' });
      pattern.append(svg('path', { d: 'M0 12 Q15 4 30 12 T60 12', class: 'wave' }));
      defs.append(pattern);
      this.svg.append(defs);

      const sea = svg('rect', { width, height, class: 'region sea', 'data-id': 'noordzee' });
      this.svg.append(sea, svg('rect', { width, height, fill: `url(#${patternId})`, class: 'waves' }));
      this.register('noordzee', sea);

      const neighbours = svg('g', { class: 'layer-neighbours' });
      const provinces = svg('g', { class: 'layer-belgium' });
      for (const [id, region] of Object.entries(regions)) {
        const isBelgian = id.length > 2;
        const path = svg('path', { d: region.d, class: `region ${isBelgian ? 'province' : 'neighbour'}`, 'data-id': id });
        (isBelgian ? provinces : neighbours).append(path);
        this.register(id, path);
      }
      // Brussel bovenaan, anders verdwijnt het onder Vlaams-Brabant.
      const brussels = provinces.querySelector('[data-id="brussel"]');
      if (brussels) provinces.append(brussels);
      this.svg.append(neighbours, provinces);

      if (cities) this.svg.append(this.buildCities(cities === 'targets'));
      this.pinLayer = svg('g', { class: 'layer-pins' });
      this.svg.append(this.pinLayer);
      this.pins = {};

      this.labelLayer = svg('g', { class: 'layer-labels' });
      this.svg.append(this.labelLayer);
      if (belgium === 'plain') {
        const t = svg('text', { x: BELGIUM_LABEL[0], y: BELGIUM_LABEL[1], class: 'label label-belgium' });
        t.textContent = 'België';
        this.labelLayer.append(t);
      }

      this.svg.addEventListener('click', (event) => {
        const id = this.regionFromNode(event.target);
        if (id && this.onPick) this.onPick(id, event);
      });

      // map-area neemt de vrije ruimte in; map-wrap past daarin met de juiste verhouding.
      this.element = el('div', { class: 'map-area' }, el('div', { class: 'map-wrap' }, this.svg));
      new ResizeObserver(() => this.fitView()).observe(this.element);
    }

    /*
     * Kies de uitsnede (viewBox): altijd heel België met wat marge (boven extra,
     * voor spelden en namen), en verder zoveel van de buren als nodig is om de
     * vrije ruimte te vullen. Zo is België op een smal gsm-scherm toch groot.
     */
    fitView() {
      const { width, height } = this.element.getBoundingClientRect();
      if (!width || !height) return;
      const full = { x: 0, y: 0, w: this.geo.width, h: this.geo.height };
      let box = full;
      if (this.focus === 'belgium') {
        if (!this.focusBox) {
          const b = this.svg.querySelector('.layer-belgium').getBBox();
          this.focusBox = { x: b.x - 30, y: b.y - 80, w: b.width + 60, h: b.height + 110 };
        }
        box = fitAspect(this.focusBox, width / height, full);
      }
      this.svg.setAttribute('viewBox', [box.x, box.y, box.w, box.h].map((v) => v.toFixed(1)).join(' '));
      this.element.style.setProperty('--ratio', (box.w / box.h).toFixed(4));
    }

    buildCities(clickable) {
      const layer = svg('g', { class: 'layer-cities' });
      const all = [...App.data.belgie.provinces.map((p) => ({ id: p.id, city: p.city })), App.data.belgie.brussels];
      for (const { id, city } of all) {
        const [x, y] = this.project(city);
        const cityId = `stad-${id}`;
        const g = svg('g', { class: 'region city', 'data-id': cityId, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
        g.append(svg('circle', { r: 22, class: 'city-hit' }), svg('circle', { r: 9, class: 'city-dot' }));
        layer.append(g);
        if (clickable) this.clickable.add(cityId);
        this.register(cityId, g);
      }
      return layer;
    }

    register(id, node) {
      this.nodes[id] = node;
      node.style.setProperty('--found', COLORS[id] ?? '#7fe0b0');
      node.classList.toggle('is-clickable', this.clickable.has(id));
    }

    project([lat, lon]) {
      const p = this.geo.projection;
      return [(lon - p.lonMin) * p.cos * p.k, (p.latMax - lat) * p.k];
    }

    regionFromNode(node) {
      const id = node?.closest?.('[data-id]')?.dataset.id;
      return id && this.clickable.has(id) ? id : null;
    }

    /* Welk klikbaar gebied ligt onder dit schermpunt? (voor slepen) */
    regionAt(x, y) {
      return this.regionFromNode(document.elementFromPoint(x, y));
    }

    node(id) {
      return this.nodes[id];
    }

    mark(id, state) {
      this.nodes[id]?.classList.add(`is-${state}`);
      if (state === 'target' || state === 'reveal') this.raise(id);
    }

    /* Bovenaan tekenen, zodat de dikke rand niet onder de buren verdwijnt. Brussel blijft wel boven. */
    raise(id) {
      const node = this.nodes[id];
      if (!node || node.tagName !== 'path') return;
      node.parentNode.append(node);
      const brussels = this.nodes.brussel;
      if (brussels && brussels !== node && brussels.parentNode === node.parentNode) node.parentNode.append(brussels);
    }

    unmark(id, state) {
      this.nodes[id]?.classList.remove(`is-${state}`);
    }

    /* Even oplichten in een toestand, bv. rood bij een fout. */
    flash(id, state, ms = 900) {
      const node = this.nodes[id];
      if (!node) return;
      node.classList.remove(`is-${state}`);
      void node.getBoundingClientRect(); // animatie herstarten
      node.classList.add(`is-${state}`);
      setTimeout(() => node.classList.remove(`is-${state}`), ms);
    }

    /* Gevonden: blijft gekleurd met naam erbij. */
    found(id) {
      this.mark(id, 'done');
      this.showLabel(id, App.data.belgie.name(id), true);
    }

    showLabel(id, text = App.data.belgie.name(id), permanent = false) {
      this.hideLabel(id);
      const [x, y] = this.labelPosition(id);
      const isCity = id.startsWith('stad-');
      const pinned = Boolean(this.pins[id]);
      const t = svg('text', {
        x, y: pinned ? y - 118 : isCity ? y - 18 : y,
        class: `label ${isCity ? 'label-city' : ''} ${pinned ? 'label-pinned' : ''} label-pop`,
      });
      t.textContent = text;
      this.labelLayer.append(t);
      this.labels[id] = t;
      if (permanent) this.permanentLabels.add(id);
    }

    /*
     * Grote speld met een vraagteken op een stad, met een golvende ring
     * eromheen. Met pinText(id, '✓') verandert het teken na het antwoord.
     */
    pin(id, text = '?') {
      this.unpin(id);
      const [x, y] = this.labelPosition(id);
      const g = svg('g', { class: 'pin', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.6)` });
      const drop = svg('g', { class: 'pin-drop' });
      const label = svg('text', { y: -35, class: 'pin-text' });
      label.textContent = text;
      drop.append(
        svg('path', { d: 'M0 0 C-5 -12 -22 -22 -22 -37 A22 22 0 1 1 22 -37 C22 -22 5 -12 0 0 Z', class: 'pin-body' }),
        svg('circle', { cy: -37, r: 15, class: 'pin-head' }),
        label,
      );
      g.append(svg('circle', { r: 14, class: 'pin-ring' }), svg('circle', { r: 7, class: 'pin-dot' }), drop);
      this.pinLayer.append(g);
      this.pins[id] = { g, label };
    }

    pinText(id, text) {
      if (this.pins[id]) this.pins[id].label.textContent = text;
      this.pins[id]?.g.classList.add('is-answered');
    }

    unpin(id) {
      this.pins[id]?.g.remove();
      delete this.pins[id];
    }

    /* Naam even tonen, tenzij die er al vast staat. */
    peekLabel(id, ms = 1300) {
      if (this.permanentLabels.has(id)) return;
      this.showLabel(id);
      const label = this.labels[id];
      setTimeout(() => {
        if (this.labels[id] === label && !this.permanentLabels.has(id)) this.hideLabel(id);
      }, ms);
    }

    hideLabel(id) {
      this.labels[id]?.remove();
      delete this.labels[id];
      this.permanentLabels.delete(id);
    }

    labelPosition(id) {
      if (id.startsWith('stad-')) {
        const pid = id.slice(5);
        const place = App.data.belgie.provinces.find((p) => p.id === pid) ?? App.data.belgie.brussels;
        return this.project(place.city);
      }
      return LABEL_POSITIONS[id] ?? this.geo.regions[id]?.label ?? [0, 0];
    }

    /* Wis tijdelijke markeringen; gevonden gebieden blijven staan, tenzij keepFound false is. */
    reset({ keepFound = true } = {}) {
      const states = keepFound ? TRANSIENT : [...TRANSIENT, 'done'];
      for (const node of Object.values(this.nodes)) {
        node.classList.remove(...states.map((s) => `is-${s}`));
      }
      for (const id of Object.keys(this.labels)) {
        if (!keepFound || !this.permanentLabels.has(id)) this.hideLabel(id);
      }
      for (const id of Object.keys(this.pins)) this.unpin(id);
    }
  };
})();
