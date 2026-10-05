/* Geluidjes, gemaakt met de Web Audio API (geen geluidsbestanden nodig). */
App.sound = (() => {
  let ctx = null;

  function audio() {
    if (App.storage.muted) return null;
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function tone(freq, start, duration, { type = 'sine', volume = 0.18, slide } = {}) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime + start;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  return {
    pop() {
      tone(660, 0, 0.08, { type: 'triangle', volume: 0.12 });
    },
    good() {
      [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.18, { type: 'triangle' }));
    },
    great() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.06, 0.22, { type: 'triangle' }));
    },
    bad() {
      tone(240, 0, 0.25, { type: 'sawtooth', volume: 0.07, slide: 160 });
    },
    flip() {
      tone(400, 0, 0.06, { type: 'square', volume: 0.04, slide: 600 });
    },
    win() {
      const melody = [523, 523, 523, 659, 784, 659, 784, 1047];
      melody.forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', volume: 0.16 }));
    },
  };
})();
