/* Gedeelde bouwstenen voor vragen en spelvormen. */
App.ui = {
  /* Vlag als gekleurde strepen: { dir: 'h' | 'v', colors: [...] } */
  flag(spec, className = '') {
    return App.util.el('span', { class: `flag flag-${spec.dir} ${className}`, 'aria-hidden': 'true' },
      spec.colors.map((c) => App.util.el('span', { style: { background: c } })));
  },

  /* Antwoord op de kaart zetten: bij de speld als die er is, anders op het gebied. */
  revealOnMap(map, show, answer) {
    if (!map) return;
    if (show.city) {
      map.pinText(show.city, '✓');
      map.showLabel(show.city, answer);
    } else if (show.region) {
      map.showLabel(show.region, answer);
    }
  },

  /*
   * Maakt een element sleepbaar met muis of vinger. Zonder te bewegen telt
   * het als tikken. Tijdens het slepen volgt een kopie de aanwijzer.
   *   onTap()  onMove(x, y)  onDrop(x, y)
   */
  draggable(node, { onTap, onMove, onDrop }) {
    node.style.touchAction = 'none';
    node.addEventListener('click', (e) => {
      if (e.detail === 0) onTap?.(); // toetsenbord (Enter/spatie)
    });
    node.addEventListener('pointerdown', (down) => {
      if (down.button !== 0) return;
      down.preventDefault();
      node.setPointerCapture(down.pointerId);
      let ghost = null;

      const move = (e) => {
        if (!ghost && Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) > 8) {
          ghost = node.cloneNode(true);
          ghost.classList.add('drag-ghost');
          document.body.append(ghost);
          node.classList.add('is-dragging');
        }
        if (!ghost) return;
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
        onMove?.(e.clientX, e.clientY);
      };
      const up = (e) => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        if (!ghost) {
          if (e.type === 'pointerup') onTap?.();
          return;
        }
        ghost.remove();
        node.classList.remove('is-dragging');
        if (e.type === 'pointerup') onDrop?.(e.clientX, e.clientY);
        else onMove?.(-1, -1);
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
  },

  /*
   * Wat er bij een vraag te zien is (`q.show`):
   *   { map: {...config}, region: 'namen' }   kaart met één oplichtend gebied
   *   { ..., city: 'stad-namen' }             plus een speld met '?' op die stad
   *   { flag: 'nl' }                          vlag en naam van een buurland
   *   { emoji: '🏙️', text: 'Hasselt' }       groot plaatje met tekst (of een lange uitleg)
   *   { node: element, reveal: fn }           een eigen plaatje, bv. een klok (App.clock);
   *                                           reveal() toont er de uitleg bij het antwoord op
   * De kaart toont hier nooit gevonden namen: die zouden het antwoord verklappen.
   */
  showVisual(show, game) {
    if (!show) return null;
    if (show.node) {
      game.stage.append(show.node);
      return null;
    }
    if (show.map) {
      const map = game.map(show.map, { keepFound: false });
      if (show.region) map.mark(show.region, 'target');
      if (show.city) map.pin(show.city);
      for (const id of show.labels ?? []) map.showLabel(id);
      game.stage.append(map.element);
      return map;
    }
    if (show.flag) {
      const land = App.data.belgie.neighbours.find((n) => n.id === show.flag);
      game.stage.append(App.util.el('div', { class: 'visual-card' }, App.ui.flag(land.flag, 'flag-big'), App.util.el('div', { class: 'visual-text' }, land.name)));
      return null;
    }
    // Een lange tekst (bv. een uitleg) krijgt een kleinere letter, zodat ze past.
    const text = show.text ?? '';
    game.stage.append(App.util.el('div', { class: 'visual-card' },
      App.util.el('div', { class: 'visual-emoji' }, show.emoji ?? '❓'),
      App.util.el('div', { class: `visual-text ${text.length > 24 ? 'is-long' : ''}` }, text)));
    return null;
  },

  /*
   * Maakt de letter in `node` zo groot als past, tussen `min` en `max` pixels,
   * en opnieuw als de ruimte verandert. Voor lijsten met lange teksten die nooit
   * mogen scrollen. `node` moet zelf een vaste maat hebben (bv. flex: 1 met
   * min-height: 0), anders groeit hij gewoon mee. Geeft de functie terug, om
   * opnieuw te passen als de inhoud verandert.
   */
  fitText(node, { min = 11, max = 24 } = {}) {
    const fits = () => node.scrollHeight <= node.clientHeight + 1 && node.scrollWidth <= node.clientWidth + 1;
    const fit = () => {
      if (!node.isConnected || !node.clientHeight) return;
      let lo = min;
      let hi = max;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        node.style.fontSize = `${mid}px`;
        if (fits()) lo = mid;
        else hi = mid - 1;
      }
      node.style.fontSize = `${lo}px`;
    };
    new ResizeObserver(fit).observe(node);
    // Het lettertype komt soms pas later binnen: dan verandert de tekst, maar niet de maat van node.
    document.fonts?.ready.then(fit);
    fit();
    return fit;
  },
};
