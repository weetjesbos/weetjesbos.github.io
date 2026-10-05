/*
 * Het speelscherm rond elke oefening: bovenbalk met voortgang, de mascotte
 * van het spel (App.site.mascot) met een tekstballon, het speelveld en het
 * eindscherm met sterren.
 *
 * Het speelveld heeft twee zones die samen altijd op één scherm passen:
 *   game.stage      kaart, vlag, memorykaartjes... (neemt alle vrije ruimte)
 *   game.controls   knoppen, naamkaartjes, "Verder" (onder de kaart in
 *                   portret, ernaast in landschap; verdwijnt als ze leeg is)
 *
 * Oefeningen en vraagtypes praten alleen via deze API met het scherm:
 *   game.ask(tekst)                 de opdracht in de ballon (**woord** = gemarkeerd)
 *   game.say(tekst, stemming)       extra zinnetje eronder: 'good', 'bad' of 'info'
 *   game.correct(waar, {firstTry})  beloning; firstTry telt mee voor de sterren
 *   game.wrong(tekst)               troostend geluidje en uitleg
 *   game.miss(tekst)                reeks kwijt, zonder foutgeluid
 *   game.setProgress(klaar, totaal)
 *   game.clear()                    beide zones leegmaken voor een nieuwe vraag
 *   game.map(config, {keepFound})   kaart, hergebruikt zolang de config gelijk blijft
 *   game.continueButton()           wacht tot het kind op "Verder" drukt
 *   game.finish({max})              eindscherm; score = aantal keer firstTry
 */
App.Game = (() => {
  const { el, rich } = App.util;

  const COMFORT = ['Probeer nog eens!', 'Bijna, nog een keer!', 'Niet erg, probeer opnieuw!'];
  const STREAKS = { 3: '🔥 3 op rij!', 5: '🔥 5 op rij! Wauw!', 8: '🚀 8 op rij!', 10: '🏆 10 op rij! Kampioen!' };

  return class Game {
    constructor(exercise, { onExit, onReplay }) {
      this.exercise = exercise;
      this.onExit = onExit;
      this.onReplay = onReplay;
      this.points = 0;
      this.streak = 0;
      this.mapCache = null;
      this.alive = true;
      this.build();
    }

    build() {
      const ex = this.exercise;
      this.progressFill = el('div', { class: 'progress-fill' });
      this.streakNode = el('div', { class: 'chip chip-streak', title: 'Op rij juist' });
      this.pointsNode = el('div', { class: 'chip chip-points', title: 'Meteen juist' }, '⭐ 0');
      this.mascot = el('div', { class: 'mascot', 'aria-hidden': 'true' }, App.site.mascot);
      this.promptNode = el('div', { class: 'prompt' });
      this.feedbackNode = el('div', { class: 'feedback', 'aria-live': 'polite' });
      this.stage = el('div', { class: 'stage' });
      this.controls = el('div', { class: 'controls' });

      this.element = el('section', { class: `screen game group-${ex.group}` },
        el('header', { class: 'game-bar' },
          el('button', { class: 'btn-icon', 'aria-label': 'Terug naar start', onclick: () => this.exit() }, '🏠'),
          el('div', { class: 'game-title' }, el('span', { class: 'game-emoji' }, ex.emoji), ex.title),
          el('div', { class: 'progress' }, this.progressFill),
          this.streakNode,
          this.pointsNode,
        ),
        el('div', { class: 'speech' }, this.mascot, el('div', { class: 'bubble' }, this.promptNode, this.feedbackNode)),
        el('div', { class: 'play' }, this.stage, this.controls),
      );
      this.updateStreak();
    }

    ask(text) {
      this.promptNode.innerHTML = rich(text);
      this.say('');
    }

    say(text, mood = 'info') {
      this.feedbackNode.className = `feedback is-${mood}`;
      this.feedbackNode.innerHTML = rich(text);
    }

    clear() {
      this.stage.replaceChildren();
      this.controls.replaceChildren();
    }

    setProgress(done, total) {
      this.progressFill.style.width = `${(100 * done) / Math.max(total, 1)}%`;
    }

    map(config = {}, { keepFound = true } = {}) {
      const key = JSON.stringify(config);
      if (this.mapCache?.key !== key) {
        this.mapCache = { key, view: new App.MapView(config) };
      }
      this.mapCache.view.reset({ keepFound });
      this.mapCache.view.onPick = null;
      return this.mapCache.view;
    }

    correct(at, { firstTry = true, message } = {}) {
      this.streak += 1;
      if (firstTry) this.points += 1;
      this.pointsNode.textContent = `⭐ ${this.points}`;
      this.pointsNode.classList.remove('is-bump');
      void this.pointsNode.offsetWidth;
      this.pointsNode.classList.add('is-bump');
      this.updateStreak();
      this.animateMascot('is-happy');

      const big = STREAKS[this.streak];
      if (big) {
        App.sound.great();
        App.rewards.banner(big);
        App.rewards.cannons(0.6);
      } else {
        App.sound.good();
      }
      if (at) {
        App.rewards.burst(at);
        App.rewards.floatText(at, firstTry ? '+1 ⭐' : '👍');
      }
      this.say(message ?? App.rewards.praise(), 'good');
    }

    wrong(text) {
      this.streak = 0;
      this.updateStreak();
      App.sound.bad();
      this.animateMascot('is-sad');
      this.say(text ?? App.util.pick(COMFORT), 'bad');
    }

    /* Mis, maar geen echte fout (bv. bij memory): geen buzzer, wel de reeks kwijt. */
    miss(text) {
      this.streak = 0;
      this.updateStreak();
      this.say(text, 'info');
    }

    updateStreak() {
      this.streakNode.textContent = `🔥 ${this.streak}`;
      this.streakNode.classList.toggle('is-hot', this.streak >= 3);
    }

    animateMascot(cls) {
      this.mascot.classList.remove('is-happy', 'is-sad');
      void this.mascot.offsetWidth;
      this.mascot.classList.add(cls);
    }

    /* Knop "Verder" onder het speelveld; Enter werkt ook. */
    continueButton(label = 'Verder ➜') {
      return new Promise((resolve) => {
        const done = () => {
          removeEventListener('keydown', onKey);
          button.remove();
          resolve();
        };
        const onKey = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            done();
          }
        };
        const button = el('button', { class: 'btn btn-primary btn-continue', onclick: done }, label);
        this.controls.append(button);
        // Pas na deze toetsaanslag luisteren, anders slaat dezelfde Enter meteen door.
        setTimeout(() => addEventListener('keydown', onKey), 50);
        button.focus({ preventScroll: true });
      });
    }

    static starsFor(score, max) {
      const ratio = max ? score / max : 1;
      if (ratio >= 0.9) return 3;
      if (ratio >= 0.6) return 2;
      return 1;
    }

    finish({ max, score = this.points, detail } = {}) {
      if (!this.alive) return;
      this.setProgress(1, 1);
      const stars = Game.starsFor(score, max);
      const { newSticker } = App.storage.record(this.exercise.id, stars);
      this.showEnd(stars, detail ?? `${score} van de ${max} meteen juist`, newSticker);
    }

    showEnd(stars, detail, newSticker) {
      const titles = { 3: 'Fantastisch!', 2: 'Goed bezig!', 1: 'Goed geprobeerd!' };
      const starRow = el('div', { class: 'end-stars' },
        [1, 2, 3].map((i) => el('span', { class: `end-star ${i <= stars ? 'is-on' : ''}`, style: { animationDelay: `${0.3 + i * 0.35}s` } }, '★')));

      const card = el('div', { class: 'end-card' },
        el('div', { class: 'end-mascot' }, stars === 3 ? '🏆' : App.site.mascot),
        el('h2', {}, titles[stars]),
        starRow,
        el('p', { class: 'end-detail' }, detail),
        newSticker && el('div', { class: 'end-sticker' },
          el('span', { class: 'sticker-big' }, this.exercise.sticker),
          el('span', {}, 'Nieuwe sticker voor je stickerboek!')),
        stars < 3 && el('p', { class: 'end-tip' }, 'Haal 3 sterren om een sticker te verdienen!'),
        el('div', { class: 'end-actions' },
          el('button', { class: 'btn btn-secondary', onclick: () => this.onReplay() }, '🔁 Nog eens'),
          el('button', { class: 'btn btn-primary', onclick: () => this.exit() }, '🏠 Naar start'),
        ),
      );
      this.element.append(el('div', { class: 'end-overlay' }, card));

      App.sound.win();
      if (stars === 3) {
        App.rewards.cannons(1.2);
        App.rewards.fireworks(7);
        App.rewards.rain(3000);
      } else if (stars === 2) {
        App.rewards.cannons(0.8);
      } else {
        App.rewards.rain(1500);
      }
    }

    exit() {
      this.alive = false;
      this.onExit();
    }
  };
})();
