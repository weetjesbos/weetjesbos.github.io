/*
 * Leerstof: kloklezen en rekenen met tijd (wiskunde, 5de leerjaar).
 *
 * Bron: de minimumdoelen wiskunde van 2025, "Tijdstip en tijdsduur" (een analoge en
 * digitale klok tot op 1 minuut aflezen; 1 uur = 60 minuten, 1 minuut = 60
 * seconden; het uur, halfuur, kwartier; een tijdsduur berekenen in uren en
 * minuten, en in het 6de ook in seconden) en de leerlijn kloklezen van het GO!
 * (vanaf het 5de leerjaar ligt de nadruk op rekenen met tijd: hoe lang duurt het,
 * hoe laat is het binnen ..., hoe laat was het ... geleden, uurroosters).
 *
 * Uitspraak zoals in die leerlijn: "tien over vier", "kwart voor vijf", "half
 * vijf". Tijden die je ook als "tien voor half vijf" kunt zeggen (minuten 20 tot
 * 40, behalve half) worden niet in woorden gevraagd, zodat elke school klopt.
 *
 * Tijden zijn minuten na middernacht (zie js/core/clock.js).
 */
App.data.klok = {
  hours: ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'],

  // Minuten die we in woorden vragen, met hoe je ze zegt. `next`: je noemt het volgende uur.
  spoken: [
    { m: 0, say: (h) => `${h} uur` },
    { m: 5, say: (h) => `vijf over ${h}` },
    { m: 10, say: (h) => `tien over ${h}` },
    { m: 15, say: (h) => `kwart over ${h}` },
    { m: 30, say: (h) => `half ${h}`, next: true },
    { m: 45, say: (h) => `kwart voor ${h}`, next: true },
    { m: 50, say: (h) => `tien voor ${h}`, next: true },
    { m: 55, say: (h) => `vijf voor ${h}`, next: true },
  ],

  // Uren voor vragen met een dagdeel: weg van de grenzen, zodat er maar één dagdeel past.
  // Een harde spatie in de naam, zodat "'s" nooit los van "avonds" op een regel staat.
  dayparts: [
    { name: "'s\u00a0morgens", emoji: '🌅', hours: [7, 8, 9, 10] },
    { name: "'s\u00a0namiddags", emoji: '☀️', hours: [13, 14, 15, 16] },
    { name: "'s\u00a0avonds", emoji: '🌙', hours: [19, 20, 21, 22] },
  ],

  /*
   * "Hoe lang duurt het?": begin tussen `from` en `until`, duur tussen `min` en
   * `max` minuten, in stappen van `step`. {a} en {b} zijn het begin en het einde.
   */
  durations: [
    { emoji: '🎬', text: 'De film begint om {a} en is gedaan om {b}. Hoe lang duurt de film?', from: '13:00', until: '20:30', min: 85, max: 150, step: 5 },
    { emoji: '🚂', text: 'De trein naar zee vertrekt om {a} en komt aan om {b}. Hoe lang duurt de rit?', from: '7:00', until: '11:00', min: 45, max: 110, step: 1 },
    { emoji: '🏊', text: 'De zwemles begint om {a} en eindigt om {b}. Hoe lang duurt de zwemles?', from: '13:30', until: '17:30', min: 40, max: 75, step: 5 },
    { emoji: '⚽', text: 'De voetbalmatch begint om {a}. Om {b} fluit de scheidsrechter af. Hoe lang duurde de match, met de rust erbij?', from: '14:00', until: '20:30', min: 105, max: 115, step: 1 },
    { emoji: '🎂', text: 'Het verjaardagsfeestje begint om {a} en eindigt om {b}. Hoe lang duurt het feestje?', from: '13:30', until: '15:30', min: 150, max: 240, step: 5 },
    { emoji: '🛏️', text: 'Lien gaat om {a} slapen en staat om {b} op. Hoe lang slaapt ze?', from: '20:00', until: '21:45', min: 570, max: 660, step: 5 },
    { emoji: '🚌', text: 'Op schoolreis vertrekt de bus om {a}. Om {b} is hij terug aan school. Hoe lang waren jullie weg?', from: '8:15', until: '9:00', min: 420, max: 560, step: 5 },
    { emoji: '🧁', text: 'De cake gaat om {a} in de oven en komt er om {b} uit. Hoe lang bakt hij?', from: '14:00', until: '17:00', min: 35, max: 70, step: 5 },
    { emoji: '✈️', text: 'Het vliegtuig vertrekt om {a} en landt om {b}. Hoe lang duurt de vlucht?', from: '6:30', until: '18:00', min: 95, max: 200, step: 5 },
    { emoji: '🎹', text: 'De muziekschool begint om {a} en is gedaan om {b}. Hoe lang duurt de les?', from: '13:30', until: '18:00', min: 50, max: 100, step: 5 },
  ],

  /*
   * "Hoe laat is het dan?": {a} is het begin, {d} de duur, {b} het einde.
   * ask 'end': het einde is gevraagd; ask 'start': het begin.
   */
  shifts: [
    { ask: 'end', emoji: '🚲', text: 'Je vertrekt om {a} met de fiets. De tocht duurt {d}. Hoe laat kom je aan?', from: '9:00', until: '15:00', min: 40, max: 150, step: 5 },
    { ask: 'end', emoji: '🍲', text: 'De lasagne gaat om {a} in de oven. Ze moet {d} bakken. Hoe laat is ze klaar?', from: '17:05', until: '18:30', min: 35, max: 75, step: 5 },
    { ask: 'end', emoji: '🎬', text: 'De film begint om {a} en duurt {d}. Hoe laat is hij gedaan?', from: '13:00', until: '20:30', min: 85, max: 150, step: 5 },
    { ask: 'end', emoji: '🥾', text: 'De wandeling start om {a} en duurt {d}. Hoe laat ben je terug?', from: '9:30', until: '14:30', min: 75, max: 200, step: 5 },
    { ask: 'end', emoji: '🎮', text: 'Om {a} mag Daan gamen. Hij mag {d} spelen. Hoe laat moet hij stoppen?', from: '15:30', until: '17:30', min: 35, max: 55, step: 5 },
    { ask: 'start', emoji: '🚂', text: 'De trein komt om {b} aan. De rit duurde {d}. Hoe laat vertrok de trein?', from: '8:00', until: '12:00', min: 35, max: 110, step: 1 },
    { ask: 'start', emoji: '🍝', text: 'Om {b} moet het eten klaar zijn. Koken duurt {d}. Hoe laat moet papa beginnen?', from: '18:00', until: '19:00', min: 35, max: 80, step: 5 },
    { ask: 'start', emoji: '🏫', text: 'De school begint om {b}. Fietsen naar school duurt {d}. Hoe laat moet Noor ten laatste vertrekken?', from: '8:25', until: '8:45', min: 25, max: 40, step: 1 },
    { ask: 'start', emoji: '🎂', text: 'Het feest bij oma begint om {b}. De rit duurt {d}. Hoe laat moeten jullie ten laatste vertrekken?', from: '12:00', until: '15:00', min: 50, max: 130, step: 5 },
  ],

  // Dienstregelingen (verzonnen, maar zoals echte): een rij per halte, een kolom per rit.
  // `at` staat voor de naam van een halte: "aan halte Markt", "in Brugge".
  timetables: [
    {
      emoji: '🚌',
      title: 'Bus 12 naar het zwembad',
      vehicle: 'bus',
      at: 'aan halte',
      stops: ['Station', 'Markt', 'Kerk', 'Zwembad'],
      runs: [
        ['7:48', '7:56', '8:09', '8:21'],
        ['8:18', '8:26', '8:39', '8:51'],
        ['8:48', '8:56', '9:09', '9:21'],
        ['9:33', '9:41', '9:54', '10:06'],
      ],
    },
    {
      emoji: '🚂',
      title: 'Trein naar zee',
      vehicle: 'trein',
      at: 'in',
      stops: ['Kortrijk', 'Roeselare', 'Brugge', 'Oostende'],
      runs: [
        ['9:05', '9:19', '9:47', '10:03'],
        ['9:35', '9:49', '10:17', '10:33'],
        ['10:05', '10:19', '10:47', '11:03'],
        ['10:52', '11:06', '11:34', '11:50'],
      ],
    },
  ],
};
