/*
 * Leerstof: "Werkkatern 1: Het leven van het kind, vroeger en nu" (5de leerjaar),
 * uit references/werkkaart_term1_referentie.jpg (in de projectmap, buiten site/).
 * Alle 28 woorden van het blad, in dezelfde volgorde en met de uitleg zoals op het blad. Verbeterd: "ee kasteel"
 * werd "een kasteel", en Grieken en Romeinen hebben allebei "volk uit de Oudheid".
 *
 * `era` is het tijdvak voor de oefening "Tijdmachine". Woorden die in meer dan
 * één tijdvak passen (hongersnood, standenmaatschappij, zondagsschool), hebben
 * er geen en doen daar niet mee. `emoji` mag nooit gelijk zijn aan dat van een
 * tijdvak, anders verklapt het plaatje het antwoord.
 */
App.data.tijd = {
  eras: [
    { id: 'oudheid', name: 'Oudheid', hint: 'Grieken en Romeinen', emoji: '🏛️', color: '#d9822b' },
    { id: 'middeleeuwen', name: 'Middeleeuwen', hint: 'ridders en kastelen', emoji: '⚔️', color: '#7c5cff' },
    { id: 'ontdekkingen', name: 'Nieuwe Tijd', hint: 'ontdekkingsreizen', emoji: '🔭', color: '#1e9bd7' },
    { id: 'fabrieken', name: 'Nieuwste Tijd', hint: 'fabrieken', emoji: '🏭', color: '#6f6a86' },
    { id: 'nu', name: 'Nu', hint: 'computers en internet', emoji: '📱', color: '#e94f9b' },
  ],

  words: [
    { word: 'villa', meaning: 'groot Romeins huis', emoji: '🏡', era: 'oudheid' },
    { word: 'slaaf', meaning: 'iemand in dienst van een ander persoon en deze moeten gehoorzamen', emoji: '⛓️', era: 'oudheid' },
    { word: 'tunica', meaning: 'eenvoudig kleed bij de Romeinen', emoji: '👕', era: 'oudheid' },
    { word: 'toga', meaning: 'grote lap stof over de schouder gedragen bij de Romeinen', emoji: '🥻', era: 'oudheid' },
    { word: 'huurkazerne', meaning: 'groot gebouw met verschillende verdiepingen', emoji: '🏢', era: 'oudheid' },
    { word: 'Grieken', meaning: 'volk uit de Oudheid', emoji: '🏺', era: 'oudheid' },
    { word: 'Romeinen', meaning: 'volk uit de Oudheid', emoji: '🦅', era: 'oudheid' },
    { word: 'heerbaan', meaning: 'Romeinse weg', emoji: '🛣️', era: 'oudheid' },
    { word: 'kasteelheer', meaning: 'eigenaar van een kasteel', emoji: '🤴', era: 'middeleeuwen' },
    { word: 'burcht', meaning: 'soort kasteel', emoji: '🏰', era: 'middeleeuwen' },
    { word: 'hongersnood', meaning: 'tekort aan voedsel', emoji: '🍽️' },
    { word: 'page', meaning: 'opleiding tot schildknaap', emoji: '👦', era: 'middeleeuwen' },
    { word: 'schildknaap', meaning: 'helpen van de ridder', emoji: '🛡️', era: 'middeleeuwen' },
    { word: 'standenmaatschappij', meaning: 'de geestelijken, de adel en de gewone burgers', emoji: '👑' },
    { word: 'Nieuwe Wereld', meaning: 'Amerika', emoji: '🌎', era: 'ontdekkingen' },
    { word: 'zondagsschool', meaning: 'school op zondag voor de armen', emoji: '📖' },
    { word: 'kompas', meaning: 'instrument om het noorden te vinden', emoji: '🧭', era: 'ontdekkingen' },
    { word: 'karveel', meaning: 'groot zeilschip', emoji: '⛵', era: 'ontdekkingen' },
    { word: 'specerij', meaning: 'vb: peper; wat men aan eten toevoegt om een goeie smaak te geven', emoji: '🌶️', era: 'ontdekkingen' },
    { word: 'ontdekkingsreiziger', meaning: 'reiziger op zoek naar nieuwe gebieden', emoji: '🗺️', era: 'ontdekkingen' },
    { word: 'dagloner', meaning: 'persoon die betaald wordt per dag', emoji: '🪙', era: 'fabrieken' },
    { word: 'beluik', meaning: 'straat met fabriekshuisjes', emoji: '🏘️', era: 'fabrieken' },
    { word: 'patroon', meaning: 'baas van de fabriek', emoji: '🎩', era: 'fabrieken' },
    { word: 'chatten', meaning: 'online spreken via de computer', emoji: '💬', era: 'nu' },
    { word: 'spelconsole', meaning: 'om computerspelletjes mee te spelen', emoji: '🎮', era: 'nu' },
    { word: 'laptop', meaning: 'draagbare computer', emoji: '💻', era: 'nu' },
    { word: 'communicatie', meaning: 'met elkaar in verbinding staan', emoji: '📡', era: 'nu' },
    { word: 'gadget', meaning: 'handig dingetje', emoji: '⌚', era: 'nu' },
  ],

  era(id) {
    return this.eras.find((e) => e.id === id);
  },
};
