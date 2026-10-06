/*
 * Vraagbouwers voor Tik Tak Tijd, gedeeld door de oefeningen en de proeftoets
 * (zoals App.tijd bij Tijdreizigers). Elke bouwer maakt één willekeurige vraag:
 *   App.klok.read({ numbers, daypart })   wijzerklok aflezen, kies de cijferklok
 *   App.klok.say()                        cijferklok (24 uur) in woorden, met dagdeel
 *   App.klok.howLong()                    hoe lang duurt het? (tijdlijn bij het antwoord)
 *   App.klok.shift(ask)                   hoe laat is het dan? ask: 'end' of 'start'
 *   App.klok.convert(kind)                uren, minuten en seconden omzetten
 *   App.klok.timetable()                  een vraag over een dienstregeling
 * en de paren voor verbinden:
 *   App.klok.sayPairs()
 *
 * De foute antwoorden zijn de fouten die kinderen echt maken (wijzers verwisseld,
 * rekenen alsof een uur 100 minuten heeft, het verkeerde uur bij "kwart voor").
 * Kiest het kind er een, dan zegt `whyNot` wat er mis aan is.
 */
App.klok = (() => {
  const { hours, spoken, dayparts, durations, shifts, timetables } = App.data.klok;
  const { time, parse, duration, face, digital, timeline } = App.clock;
  const { shuffle, pick, sample } = App.util;

  const rand = (lo, hi, step = 1) => lo + step * Math.floor(Math.random() * (Math.floor((hi - lo) / step) + 1));
  const pad = (m) => String(m).padStart(2, '0');
  const hour12 = (h) => ((h % 12) + 11) % 12 + 1;
  const fill = (text, values) => text.replace(/\{(\w)\}/g, (_, k) => `**${values[k]}**`);

  /* Keuzevraag met het juiste antwoord en de eerste drie verschillende foute (elk { text, why }). */
  function choice({ answer, wrong, ...rest }) {
    const why = new Map();
    for (const w of wrong) {
      if (w && w.text !== answer && !why.has(w.text) && why.size < 3) why.set(w.text, w.why);
    }
    return { type: 'choice', ...rest, answer, options: shuffle([answer, ...why.keys()]), whyNot: (o) => why.get(o) };
  }

  /* Een tijdstip in woorden, bv. "kwart voor vier" (h: 0 tot 23). */
  function words(h, m) {
    const s = spoken.find((x) => x.m === m);
    return s.say(hours[(s.next ? h + 1 : h) % 12]);
  }

  /* ---------- klok lezen ---------- */

  function read({ numbers = 'all', daypart = false } = {}) {
    const part = daypart && pick(dayparts);
    const h = part ? pick(part.hours) : rand(1, 12);
    // Meestal tot op de minuut, soms een veelvoud van 5.
    const m = Math.random() < 0.2 ? rand(5, 55, 5) : rand(1, 59);
    const show = (hh, mm) => (part ? time(((hh + 24) % 24) * 60 + mm) : `${hour12(hh)}:${pad(mm)}`);
    const answer = show(h, m);

    const wrong = [];
    if (part) {
      const other = h >= 12 ? h - 12 : h + 12;
      wrong.push({ text: show(other, m), why: h >= 12
        ? `Dat is ${show(other, m)} 's nachts! Na de middag tel je 12 uur bij: ${other} + 12 = ${h}.`
        : `${show(other, m)} is 's avonds. Het is ochtend, dus vóór 12 uur.` });
    }
    const next = hour12(h + 1);
    wrong.push(m >= 30
      ? { text: show(h + 1, m), why: `De kleine wijzer staat nog vóór de ${next}: het is nog geen ${next} uur.` }
      : { text: show(h - 1, m), why: `De kleine wijzer is al voorbij de ${hour12(h)}: het is al ${hour12(h)} uur geweest.` });
    // Wijzers verwisseld: de grote wijzer als uur lezen en de kleine als minuten.
    // Niet als dat bijna hetzelfde geeft (om 5:26 wordt het 5:27).
    const swapHour = Math.floor(m / 5) || 12;
    if (swapHour % 12 !== h % 12) {
      wrong.push({ text: show(h - (h % 12) + (swapHour % 12), Math.round(((h % 12) + m / 60) * 5) % 60),
        why: 'Je hebt de wijzers verwisseld. De **kleine** wijzer toont het uur, de **grote** wijzer de minuten.' });
    }
    if (m >= 5) {
      const n = Math.floor(m / 5);
      wrong.push({ text: show(h, n), why: `De grote wijzer staat bij de ${n}. Dat zijn geen ${n} minuten: tel per 5, dus al ${n * 5} minuten.` });
    }
    for (const d of shuffle([5, -5, 10, -10])) {
      if (m + d >= 0 && m + d < 60) wrong.push({ text: show(h, m + d), why: 'Bijna! Tel de minuten nog eens na, streepje per streepje.' });
    }

    return choice({
      prompt: part ? `Het is **${part.name}**. Hoe laat is het op een cijferklok?` : 'Hoe laat is het op deze klok?',
      show: { node: face(h * 60 + m, { numbers, caption: part && `${part.emoji} ${part.name}` }) },
      answer,
      wrong,
    });
  }

  function say() {
    const part = pick(dayparts);
    const h = pick(part.hours);
    const { m, next } = pick(spoken);
    const answer = `${words(h, m)} ${part.name}`;
    const now = hours[h % 12];
    const coming = hours[(h + 1) % 12];

    const wrong = [];
    if (m) {
      wrong.push(next
        ? { text: `${spoken.find((x) => x.m === m).say(now)} ${part.name}`, why: `Bij **half** en **voor** noem je het uur dat eraan komt: na ${now} uur komt ${coming} uur.` }
        : { text: `${spoken.find((x) => x.m === m).say(coming)} ${part.name}`, why: `Bij **over** noem je het uur dat al begonnen is: het is al ${now} uur geweest.` });
    }
    const mirror = spoken.find((x) => x.m === 60 - m && x.m !== 30);
    if (mirror && m !== 30) {
      wrong.push({ text: `${mirror.say(next ? coming : now)} ${part.name}`, why: m > 30
        ? 'Er zijn al meer dan 30 minuten voorbij: dan zeg je **voor** het volgende uur.'
        : 'Er zijn nog geen 30 minuten voorbij: dan zeg je **over** het uur.' });
    }
    if (h >= 13) {
      wrong.push({ text: `${words(h - 10, m)} ${part.name}`, why: `${h} uur is geen ${h - 10} uur. Trek er 12 af: ${h} − 12 = ${h - 12}.` });
    }
    const otherPart = h < 12 ? dayparts[2] : dayparts[0];
    wrong.push({ text: `${words(h, m)} ${otherPart.name}`, why: h < 12
      ? `${time(h * 60 + m)} is vóór 12 uur 's middags: dat is ${part.name}.`
      : `${time(h * 60 + m)} is na 12 uur 's middags: dat is ${part.name}.` });
    if (m === 0) {
      wrong.push({ text: `${words(h + 1, m)} ${part.name}`, why: h > 12 ? `${h} − 12 = ${h - 12}: het is ${now} uur.` : `Kijk naar het getal vóór het dubbelpunt: het is ${now} uur.` });
    }

    return choice({
      prompt: 'Hoe zeg je dit uur in woorden?',
      show: { node: digital(h * 60 + m) },
      long: true,
      answer,
      wrong,
    });
  }

  /* Cijferklok (24 uur) en woorden, voor verbinden: alle combinaties. */
  function sayPairs() {
    return dayparts.flatMap((part) => part.hours.flatMap((h) => spoken.map(({ m }) => ({
      text: time(h * 60 + m),
      target: `${words(h, m)} ${part.name}`,
    }))));
  }

  /* ---------- rekenen met tijd ---------- */

  /*
   * Een begin binnen [from, until] en een duur zodat je over een vol uur heen moet
   * tellen (`crosses`); dat is wat het 5de leerjaar moet kunnen.
   */
  function draw(sit, crosses) {
    const step = sit.step === 1 ? 1 : 5;
    for (let i = 0; ; i++) {
      const t = rand(parse(sit.from), parse(sit.until), step);
      const d = rand(sit.min, sit.max, sit.step);
      if (i > 50 || (t % 60 && crosses(t, d))) return [t, d];
    }
  }

  /* Rekenen alsof een uur 100 minuten heeft: 16:10 − 14:35 = 1610 − 1435 = 175. */
  const decimal = (t) => Math.floor(t / 60) * 100 + (t % 60);

  /*
   * Foute duren van `from` tot `to`: rekenen alsof een uur 100 minuten heeft,
   * de minuten zonder lenen aftrekken (16:10 − 14:35 → 2 u 25 min), een uur of
   * een paar minuten ernaast.
   */
  function durationWrong(from, to) {
    const d = to - from;
    const tip = Math.floor(from / 60) === Math.floor(to / 60) ? `Tel door van ${time(from)} tot ${time(to)}.` : 'Tel eerst door tot het volle uur.';
    const near = (x) => x > 0 && { text: duration(x), why: `Oei, ${duration(x)} is te ${x > d ? 'lang' : 'kort'}. ${tip}` };
    const fake = decimal(to) - decimal(from);
    const loose = (Math.floor(to / 60) - Math.floor(from / 60)) * 60 + Math.abs((to % 60) - (from % 60));
    return [
      fake % 100 >= 60
        ? { text: `${fake >= 100 ? `${Math.floor(fake / 100)} u ` : ''}${fake % 100} min`, why: 'Een uur heeft 60 minuten, geen 100. Tel eerst door tot het volle uur.' }
        : near(Math.floor(fake / 100) * 60 + (fake % 100)),
      loose !== d && near(loose),
      near(d + 60),
      near(d - 60),
      ...shuffle([5, -5, 10, -10, 15]).map((x) => near(d + x)),
    ];
  }

  function howLong(sit = pick(durations)) {
    const [from, d] = draw(sit, (t, x) => (t + x) % 60 < t % 60);
    const to = from + d;
    const line = timeline({ from, to, ask: 'duration', emoji: sit.emoji });
    return choice({
      prompt: fill(sit.text, { a: time(from), b: time(to) }),
      show: { node: line.element, reveal: line.reveal },
      explain: 'Tel door: eerst tot het volle uur, dan de hele uren, dan de rest.',
      answer: duration(d),
      wrong: durationWrong(from, to),
    });
  }

  function shift(ask = pick(['end', 'start']), sit = pick(shifts.filter((s) => s.ask === ask))) {
    const end = ask === 'end';
    // Vooruit: de minuten samen zijn meer dan een uur. Terug: je moet lenen.
    const [given, d] = draw(sit, (t, x) => (end ? (t % 60) + (x % 60) >= 60 : t % 60 < x % 60));
    const from = end ? given : given - d;
    const to = end ? given + d : given;
    const answer = end ? to : from;
    const line = timeline({ from, to, ask, emoji: sit.emoji });
    const near = (x) => ({ text: time(x), why: `Oei, ${time(x)} is te ${x > answer ? 'laat' : 'vroeg'}. Tel ${end ? 'door' : 'terug'}: eerst tot het volle uur.` });

    const fake = end ? decimal(given) + decimal(d) : decimal(given) - decimal(d);
    const wrong = [];
    if (fake % 100 >= 60) {
      wrong.push({ text: `${Math.floor(fake / 100)}:${pad(fake % 100)}`, why: `**${Math.floor(fake / 100)}:${pad(fake % 100)}** bestaat niet: een uur heeft maar 60 minuten.` });
    }
    wrong.push(end
      ? { text: time(answer - 60), why: `Bijna! ${given % 60} + ${d % 60} = ${(given % 60) + (d % 60)} minuten: dat is meer dan een uur. Tel dat uur er nog bij.` }
      : { text: time(Math.floor(given / 60) * 60 - Math.floor(d / 60) * 60 + Math.abs((given % 60) - (d % 60))), why: `Oei, dat is te laat. Je kunt ${d % 60} min niet van ${given % 60} min aftrekken: tel eerst terug tot ${time(Math.floor(given / 60) * 60)}.` });
    wrong.push(near(answer + 60), near(answer - 60), ...shuffle([5, -5, 10, -10]).map((x) => near(answer + x)));

    return choice({
      prompt: fill(sit.text, { a: time(from), b: time(to), d: duration(d) }),
      show: { node: line.element, reveal: line.reveal },
      explain: end ? 'Tel door: eerst tot het volle uur, dan verder.' : 'Tel terug: eerst tot het volle uur, dan verder.',
      answer: time(answer),
      wrong,
    });
  }

  /* ---------- omzetten ---------- */

  const NAMED = [
    { show: 'een kwartier', answer: '15 min', wrong: ['25 min', '45 min', '10 min'], why: 'Een kwartier is een vierde van een uur: 60 : 4 = 15 minuten.' },
    { show: 'een halfuur', answer: '30 min', wrong: ['50 min', '15 min', '20 min'], why: 'Een halfuur is de helft van 60 minuten.' },
    { show: 'drie kwartier', answer: '45 min', wrong: ['75 min', '30 min', '35 min'], why: 'Eén kwartier is 15 minuten, drie kwartier is 3 × 15.' },
    { show: 'anderhalf uur', answer: '1 u 30 min', wrong: ['1 u 50 min', '1 u 15 min', '150 min'], why: 'Anderhalf uur is 1 uur en een half uur, en een half uur is 30 minuten.' },
    { show: 'tweeënhalf uur', answer: '2 u 30 min', wrong: ['2 u 50 min', '2 u 15 min', '250 min'], why: 'Tweeënhalf uur is 2 uur en een half uur, en een half uur is 30 minuten.' },
    { show: 'een dag', answer: '24 u', wrong: ['12 u', '60 u', '100 u'], why: 'Een dag en een nacht samen duren 24 uur.' },
    { show: 'een halve minuut', answer: '30 s', wrong: ['50 s', '15 s', '60 s'], why: 'Een minuut heeft 60 seconden: de helft is 30.' },
  ];

  const CONVERSIONS = {
    hoursToMinutes() {
      const h = rand(1, 3);
      const m = rand(5, 55, 5);
      const v = h * 60 + m;
      const hint = h === 1 ? '1 u = 60 min. Tel de minuten erbij.' : `1 u = 60 min, dus ${h} u = ${h * 60} min.`;
      return { emoji: '⏰', show: `${h} u ${m} min`, prompt: 'Hoeveel **minuten** is dat?', answer: `${v} min`,
        wrong: [{ text: `${h * 100 + m} min`, why: 'Een uur heeft 60 minuten, geen 100.' }, ...[10, -10, 60, -5].map((x) => ({ text: `${v + x} min`, why: `Reken nog eens: ${hint}` }))] };
    },
    minutesToHours() {
      let v;
      do v = rand(70, 220, 5); while (v % 60 === 0);
      const fake = `${Math.floor(v / 100)} u ${v % 100} min`;
      return { emoji: '⏰', show: `${v} min`, prompt: 'Hoeveel **uren en minuten** is dat?', answer: duration(v),
        wrong: [v >= 100 && v % 100 < 60 && { text: fake, why: 'Een uur heeft 60 minuten, geen 100.' },
          ...[60, -60, 10, -10].map((x) => v + x > 0 && { text: duration(v + x), why: `Tel per 60 minuten: hoe vaak past 60 in ${v}?` })] };
    },
    minutesToSeconds() {
      const m = rand(2, 5);
      return { emoji: '⏱️', show: `${m} min`, prompt: 'Hoeveel **seconden** is dat?', answer: `${m * 60} s`,
        wrong: [{ text: `${m * 100} s`, why: 'Een minuut heeft 60 seconden, geen 100.' }, ...[m * 30, m * 60 + 30, m * 60 - 20].map((x) => ({ text: `${x} s`, why: `Reken nog eens: 1 min = 60 s, dus ${m} min = ${m} × 60 s.` }))] };
    },
    mixedToSeconds() {
      const m = rand(1, 3);
      const s = rand(5, 55, 5);
      const v = m * 60 + s;
      return { emoji: '⏱️', show: `${m} min ${s} s`, prompt: 'Hoeveel **seconden** is dat?', answer: `${v} s`,
        wrong: [{ text: `${m * 100 + s} s`, why: 'Een minuut heeft 60 seconden, geen 100.' }, ...[10, -10, 60].map((x) => ({ text: `${v + x} s`, why: `Reken nog eens: 1 min = 60 s, dus ${m} min = ${m * 60} s.` }))] };
    },
    secondsToMinutes() {
      let v;
      do v = rand(65, 230, 5); while (v % 60 === 0);
      const as = (x) => `${Math.floor(x / 60)} min ${x % 60} s`;
      return { emoji: '⏱️', show: `${v} s`, prompt: 'Hoeveel **minuten en seconden** is dat?', answer: as(v),
        wrong: [v % 100 < 60 && v >= 100 && { text: `${Math.floor(v / 100)} min ${v % 100} s`, why: 'Een minuut heeft 60 seconden, geen 100.' },
          ...[60, -60, 10, -10].map((x) => v + x >= 60 && { text: as(v + x), why: `Tel per 60 seconden: hoe vaak past 60 in ${v}?` })] };
    },
    named() {
      const n = pick(NAMED);
      return { emoji: '🕰️', show: n.show, prompt: 'Hoe lang is dat?', answer: n.answer, wrong: n.wrong.map((text) => ({ text, why: n.why })) };
    },
    longest() {
      const values = sample([80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130], 4);
      // Elke duur in een andere schrijfwijze, zodat je echt moet omzetten.
      const texts = new Map(values.map((v, i) => [v, i % 2 ? `${v} min` : duration(v)]));
      const max = Math.max(...values);
      return { emoji: '⏳', show: 'Wat duurt het langst?', prompt: 'Welke tijd is het **langst**?', answer: texts.get(max),
        wrong: values.filter((v) => v !== max).map((v) => ({ text: texts.get(v), why: `${duration(v)} = ${v} min. Er is iets dat langer duurt.` })) };
    },
    race() {
      const names = sample(['Lotte', 'Tom', 'Mira', 'Wout', 'Yara', 'Lars'], 3);
      const secs = sample([78, 82, 85, 88, 91, 94, 97], 3);
      const as = (s, i) => (i % 2 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`);
      const best = secs.indexOf(Math.min(...secs));
      return { emoji: '🏊', show: names.map((n, i) => `${n}: ${as(secs[i], i)}`).join(' • '), prompt: 'Wie zwom de baan het **snelst**?', answer: names[best],
        wrong: names.map((n, i) => i !== best && { text: n, why: `${n} deed er ${secs[i]} s over. Iemand anders was sneller!` }) };
    },
  };

  function convert(kind = pick(Object.keys(CONVERSIONS))) {
    const c = CONVERSIONS[kind]();
    return choice({ prompt: c.prompt, show: { emoji: c.emoji, text: c.show }, answer: c.answer, wrong: c.wrong });
  }
  convert.kinds = Object.keys(CONVERSIONS);

  /* ---------- dienstregeling ---------- */

  const TIMETABLE = {
    ride(tt, runs) {
      const r = rand(0, runs.length - 1);
      const i = rand(0, tt.stops.length - 2);
      const j = rand(i + 1, tt.stops.length - 1);
      const [from, to] = [runs[r][i], runs[r][j]];
      return { mark: i, cells: [[i, r], [j, r]],
        prompt: `Je neemt de ${tt.vehicle} van **${time(from)}** ${tt.at} **${tt.stops[i]}**. Hoe lang duurt de rit tot **${tt.stops[j]}**?`,
        answer: duration(to - from), wrong: durationWrong(from, to) };
    },
    next(tt, runs) {
      const i = rand(0, tt.stops.length - 2);
      const k = rand(1, runs.length - 1);
      const now = runs[k][i] - rand(3, Math.min(25, runs[k][i] - runs[k - 1][i] - 1));
      return { mark: i, cells: [[i, k]],
        prompt: `Je staat om **${time(now)}** ${tt.at} **${tt.stops[i]}**. Hoe laat komt de volgende ${tt.vehicle}?`,
        answer: time(runs[k][i]),
        wrong: runs.map((run, r) => r !== k && { text: time(run[i]), why: r < k
          ? `Die ${tt.vehicle} is al weg: ${time(run[i])} is vóór ${time(now)}.`
          : `Die komt ook, maar er komt er eentje vroeger.` }) };
    },
    wait(tt, runs) {
      const i = rand(0, tt.stops.length - 2);
      const k = rand(1, runs.length - 2);
      const now = runs[k][i] - rand(3, Math.min(25, runs[k][i] - runs[k - 1][i] - 1));
      const d = runs[k][i] - now;
      return { mark: i, cells: [[i, k]],
        prompt: `Je staat om **${time(now)}** ${tt.at} **${tt.stops[i]}**. Hoe lang moet je wachten op de volgende ${tt.vehicle}?`,
        answer: duration(d),
        wrong: [{ text: duration(runs[k + 1][i] - now), why: `Zo lang wacht je op de ${tt.vehicle} daarna. Er komt er eentje vroeger!` },
          ...[5, -5, 10, -2].map((x) => d + x > 0 && { text: duration(d + x), why: `Oei, ${duration(d + x)} is te ${x > 0 ? 'lang' : 'kort'}. Tel door van ${time(now)} tot ${time(runs[k][i])}.` })] };
    },
    deadline(tt, runs) {
      const last = tt.stops.length - 1;
      const k = rand(0, runs.length - 2);
      const due = runs[k][last] + rand(2, Math.min(15, runs[k + 1][last] - runs[k][last] - 1));
      return { mark: 0, cells: [[0, k], [last, k]],
        prompt: `Je moet om **${time(due)}** ${tt.at} **${tt.stops[last]}** zijn. Welke ${tt.vehicle} neem je ten laatste ${tt.at} **${tt.stops[0]}**?`,
        answer: time(runs[k][0]),
        wrong: runs.map((run, r) => r !== k && { text: time(run[0]), why: r > k
          ? `Met die ${tt.vehicle} kom je pas om ${time(run[last])} aan: te laat!`
          : 'Daarmee ben je op tijd, maar je kunt nog een latere nemen.' }) };
    },
  };

  function timetable(kind = pick(Object.keys(TIMETABLE)), tt = pick(timetables)) {
    const runs = tt.runs.map((run) => run.map(parse));
    const q = TIMETABLE[kind](tt, runs);
    const table = App.clock.timetable({ ...tt, runs, mark: q.mark });
    return choice({ prompt: q.prompt, show: { node: table.element, reveal: () => table.reveal(q.cells) }, answer: q.answer, wrong: q.wrong });
  }
  timetable.kinds = Object.keys(TIMETABLE);

  return { read, say, sayPairs, howLong, shift, convert, timetable };
})();
