/*
 * Beloningen: confetti, vuurwerk, zwevende tekst en grote banners.
 * Eén canvas over het hele scherm; de animatie loopt alleen zolang er
 * deeltjes zijn.
 */
App.rewards = (() => {
  const COLORS = ['#ff5d5d', '#ffb340', '#ffd23f', '#2ec27e', '#3db7ff', '#7c5cff', '#ff6fb5'];
  const EMOJI = ['⭐', '🎉', '✨', '🌟'];
  const PRAISE = ['Super!', 'Knap zo!', 'Goed gedaan!', 'Toppie!', 'Wauw!', 'Juist!', 'Prima!', 'Geweldig!', 'Bravo!'];

  let canvas, ctx, particles = [], running = false, rainUntil = 0;

  function ensureCanvas() {
    if (canvas) return;
    canvas = App.util.el('canvas', { class: 'confetti-canvas', 'aria-hidden': 'true' });
    document.body.append(canvas);
    ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    addEventListener('resize', resize);
    resize();
  }

  function scale(count) {
    return App.util.reducedMotion() ? Math.ceil(count / 5) : count;
  }

  function spawn({ x, y, count = 40, power = 9, spread = Math.PI * 2, angle = -Math.PI / 2, emoji = 0.12, gravity = 0.25 }) {
    ensureCanvas();
    for (let i = 0; i < scale(count); i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = power * (0.4 + Math.random() * 0.8);
      const isEmoji = Math.random() < emoji;
      particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        gravity,
        size: isEmoji ? 16 + Math.random() * 10 : 6 + Math.random() * 6,
        color: App.util.pick(COLORS),
        emoji: isEmoji ? App.util.pick(EMOJI) : null,
        round: Math.random() < 0.3,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * 10,
        life: 0,
        maxLife: 140 + Math.random() * 80,
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter((p) => p.life < p.maxLife && p.y < innerHeight + 40);
    for (const p of particles) {
      p.life++;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.gravity;
      p.x += p.vx + Math.sin((p.life + p.wobble) / 8) * 0.6;
      p.y += p.vy;
      p.rot += p.spin;
      const fade = Math.min(1, (p.maxLife - p.life) / 30);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.emoji) {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Kantelend papiertje: de breedte varieert met de hoek.
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size * Math.cos(p.life / 6), p.size / 2);
        }
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(tick);
    else running = false;
  }

  return {
    praise() {
      return App.util.pick(PRAISE);
    },

    /* Kleine uitbarsting op een punt of element. */
    burst(at, options = {}) {
      const { x, y } = at instanceof Element ? App.util.center(at) : at;
      spawn({ x, y, count: 36, power: 8, ...options });
    },

    /* Confetti die van beide kanten het scherm in schiet. */
    cannons(strength = 1) {
      const count = Math.round(80 * strength);
      spawn({ x: 0, y: innerHeight * 0.8, count, power: 18, angle: -Math.PI / 3, spread: 0.7 });
      spawn({ x: innerWidth, y: innerHeight * 0.8, count, power: 18, angle: -Math.PI * 2 / 3, spread: 0.7 });
    },

    /* Confettiregen van bovenaf. */
    rain(duration = 2500) {
      rainUntil = performance.now() + duration;
      const drop = () => {
        if (performance.now() >= rainUntil) return;
        spawn({ x: Math.random() * innerWidth, y: -20, count: 6, power: 2, angle: Math.PI / 2, spread: 1, gravity: 0.12 });
        setTimeout(drop, 60);
      };
      drop();
    },

    /* Een paar vuurwerkpijlen op willekeurige plaatsen. */
    fireworks(shots = 6) {
      for (let i = 0; i < shots; i++) {
        setTimeout(() => {
          spawn({
            x: innerWidth * (0.15 + Math.random() * 0.7),
            y: innerHeight * (0.15 + Math.random() * 0.35),
            count: 60, power: 7, gravity: 0.12, emoji: 0.2,
          });
          App.sound.pop();
        }, i * 350);
      }
    },

    /* Alles weg, bv. bij het wisselen van scherm. */
    clear() {
      particles = [];
      rainUntil = 0;
      document.querySelectorAll('.float-text, .banner').forEach((n) => n.remove());
    },

    /* "+1" of een ander woordje dat omhoog zweeft. */
    floatText(at, text, className = '') {
      const { x, y } = at instanceof Element ? App.util.center(at) : at;
      const node = App.util.el('div', { class: `float-text ${className}`, text, style: { left: `${x}px`, top: `${y}px` } });
      document.body.append(node);
      node.addEventListener('animationend', () => node.remove());
    },

    /* Grote tekst midden op het scherm, bv. "🔥 5 op rij!". */
    banner(text) {
      const node = App.util.el('div', { class: 'banner', text });
      document.body.append(node);
      node.addEventListener('animationend', () => node.remove());
    },
  };
})();
