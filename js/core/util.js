/* Kleine hulpfuncties die overal gebruikt worden. */
App.util = {
  /* el('button', {class: 'x', onclick: fn}, 'tekst', kindElement) */
  el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    App.util.applyAttrs(node, attrs);
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(child));
    }
    return node;
  },

  svg(tag, attrs = {}) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    App.util.applyAttrs(node, attrs);
    return node;
  },

  applyAttrs(node, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (key === 'html') node.innerHTML = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'style' && typeof value === 'object') {
        for (const [prop, v] of Object.entries(value)) {
          if (prop.startsWith('--')) node.style.setProperty(prop, v);
          else node.style[prop] = v;
        }
      }
      else node.setAttribute(key, value === true ? '' : value);
    }
  },

  escape(text) {
    return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  },

  /* Zet "Waar ligt **Namen**?" om naar veilige HTML met een markering. */
  rich(text) {
    return App.util.escape(text).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
  },

  shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  sample(list, n) {
    return App.util.shuffle(list).slice(0, n);
  },

  pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  },

  /* Het juiste antwoord plus (n - 1) andere, door elkaar. */
  options(correct, all, n = 4) {
    const others = App.util.sample(all.filter((x) => x !== correct), n - 1);
    return App.util.shuffle([correct, ...others]);
  },

  /* Hoofdletters, accenten, spaties, koppeltekens... maken niet uit. */
  normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/^\s*(de\s+)?provincie\s+/, '')
      .replace(/[^a-z0-9]/g, '');
  },

  levenshtein(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  },

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  center(element) {
    const r = element.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  },

  reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};
