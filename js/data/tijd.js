/*
 * Leerstof: "Werkkatern 1: Het leven van het kind, vroeger en nu" (5de leerjaar),
 * Bronnen: references/werkkaart_term1_referentie.jpg en de herhaling WO focusthema 1.
 * De volledige broninventaris en oefenkoppeling staan in references/tijdreizigers-dekking.md.
 * Alle 28 woorden van het blad, in dezelfde volgorde en met de uitleg zoals op het blad. Verbeterd: "ee kasteel"
 * werd "een kasteel", en Grieken en Romeinen hebben allebei "volk uit de Oudheid".
 *
 * `era` is het tijdvak voor de oefening "Tijdmachine". Woorden die in meer dan
 * één tijdvak passen (hongersnood, standenmaatschappij, zondagsschool), hebben
 * er geen en doen daar niet mee. `emoji` mag nooit gelijk zijn aan dat van een
 * tijdvak, anders verklapt het plaatje het antwoord.
 * `life` koppelt kenmerken aan het tijdvak uit het nieuwe overzicht (vragen 2 en 4).
 * Dit is een koppeling binnen het schoolverhaal, geen claim dat iets alleen toen bestond.
 * `reasons` bevat de antwoorden op vragen 5 en 6, met geloofwaardige denkfouten.
 */
App.data.tijd = {
  eras: [
    { id: 'prehistorie', name: 'Prehistorie', hint: 'jagers en eerste landbouwers', emoji: '🪨', color: '#72983d', period: '… tot 3800 v.C.', people: 'Lenige hinde en Sterke beer' },
    { id: 'oudheid', name: 'Oudheid', hint: 'Grieken en Romeinen', emoji: '🏛️', color: '#d9822b', period: '3800 v.C. tot 500', people: 'Cornelius en Aurelia' },
    { id: 'middeleeuwen', name: 'Middeleeuwen', hint: 'ridders en kastelen', emoji: '⚔️', color: '#7c5cff', period: '500 tot 1500', people: 'Arnaud en Margaretha' },
    { id: 'ontdekkingen', name: 'Nieuwe tijden deel 1', hint: 'ontdekkingsreizen', emoji: '🔭', color: '#1e9bd7', period: '1500 tot 1800', people: 'Willem en Grietje' },
    { id: 'fabrieken', name: 'Nieuwe tijden deel 2', hint: 'fabrieken', emoji: '🏭', color: '#6f6a86', period: '1800 tot 1945', people: 'Celina en Clement' },
    { id: 'nu', name: 'Onze tijd', hint: 'computers en internet', emoji: '📱', color: '#e94f9b', period: '1945 tot …', people: 'Lotte en Sander' }
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

  life: [
    { text: 'Grotten of tenten', era: 'prehistorie' },
    { text: 'Vuur', era: 'prehistorie' },
    { text: 'Jagen', era: 'prehistorie' },
    { text: 'Voedsel verzamelen', era: 'prehistorie' },
    { text: 'Eerste landbouwers', era: 'prehistorie' },
    { text: 'Villa', era: 'oudheid' },
    { text: 'Slaven', era: 'oudheid' },
    { text: 'Wasbordje', era: 'oudheid' },
    { text: 'Huurkazerne', era: 'oudheid' },
    { text: 'Tunica', era: 'oudheid' },
    { text: 'Toga', era: 'oudheid' },
    { text: 'Heerbaan', era: 'oudheid' },
    { text: 'Griekse leraar', era: 'oudheid' },
    { text: 'Romeinen', era: 'oudheid' },
    { text: 'Een groot stuk van Europa veroveren', era: 'oudheid' },
    { text: 'Gymnasium', era: 'oudheid' },
    { text: 'Kasteelheer', era: 'middeleeuwen' },
    { text: 'Burcht', era: 'middeleeuwen' },
    { text: 'Page, schildknaap, ridder', era: 'middeleeuwen' },
    { text: 'Werken op het land van de kasteelheer', era: 'middeleeuwen' },
    { text: 'Een deel van hun oogst afgeven', era: 'middeleeuwen' },
    { text: 'Bescherming in de burcht', era: 'middeleeuwen' },
    { text: 'Koud', era: 'middeleeuwen' },
    { text: 'Besmettelijke ziektes', era: 'middeleeuwen' },
    { text: 'Hongersnood', era: 'middeleeuwen' },
    { text: 'Weverij', era: 'ontdekkingen' },
    { text: 'Zondagsschool', era: 'ontdekkingen' },
    { text: 'Knielessenaar', era: 'ontdekkingen' },
    { text: 'Specerij, laken, cacao, tabak', era: 'ontdekkingen' },
    { text: 'Ontdekkingsreizigers', era: 'ontdekkingen' },
    { text: 'Haven', era: 'ontdekkingen' },
    { text: 'Karveel', era: 'ontdekkingen' },
    { text: 'Kompas', era: 'ontdekkingen' },
    { text: 'Nieuwe Wereld', era: 'ontdekkingen' },
    { text: 'Spinnerij', era: 'fabrieken' },
    { text: 'Kleine arbeidershuisjes', era: 'fabrieken' },
    { text: '6 toiletten en 2 waterpompen voor 100 gezinnen', era: 'fabrieken' },
    { text: 'Beluik', era: 'fabrieken' },
    { text: 'Kinderarbeid', era: 'fabrieken' },
    { text: 'Gevaarlijk werk', era: 'fabrieken' },
    { text: 'Laag loon', era: 'fabrieken' },
    { text: 'Strenge patroon', era: 'fabrieken' },
    { text: 'School voor de rijken', era: 'fabrieken' },
    { text: 'Internet', era: 'nu' },
    { text: 'SMS', era: 'nu' },
    { text: 'Technologie', era: 'nu' },
    { text: 'Hobby’s', era: 'nu' },
    { text: 'School voor iedereen', era: 'nu' },
    { text: 'Gamen', era: 'nu' },
    { text: 'Hygiëne', era: 'nu' },
    { text: 'Jeugdbeweging', era: 'nu' },
    { text: 'Kinderrechten', era: 'nu' },
    { text: 'Euro', era: 'nu' }
  ],

  reasons: [
    {
      prompt: 'Wat veranderde toen zwervende mensen langer op één plaats bleven wonen?',
      answer: 'Ze kweekten hun eigen voedsel en bouwden hutten met simpele materialen',
      wrong: ['Ze bleven rondzwerven en bouwden geen hutten', 'Ze werkten in fabrieken en kochten hun voedsel', 'Ze gingen in Romeinse huurkazernes wonen'],
      explain: 'Ze bleven op dezelfde plaats wonen, kweekten voedsel en bouwden eigen hutten.'
    },
    {
      prompt: 'Wat gebeurde er met de dieren bij de eerste landbouwers?',
      answer: 'Ze werden tam gemaakt, bleven binnen een omheining en hielpen de mens',
      wrong: ['Ze bleven allemaal wild en werden alleen bejaagd', 'Ze woonden in de fabriek en kregen een loon', 'Ze moesten weg, want landbouwers hielden geen dieren'],
      explain: 'De dieren werden tam gemaakt en bleven bijeen door een omheining. Ze hielpen de mens.'
    },
    {
      prompt: 'Waarom durfde men in het begin van de 16de eeuw verre ontdekkingsreizen te ondernemen?',
      answer: 'Door het kompas en het karveel',
      wrong: ['Door de laptop en het internet', 'Door het wasbordje en de tunica', 'Door de burcht en de knielessenaar'],
      explain: 'Het kompas hielp de richting vinden; met het karveel kon men ver varen.'
    },
    {
      prompt: 'Hoe zag het leven van een arbeiderskind in de 19de eeuw eruit?',
      answer: 'Lange dagen gevaarlijk werk in de fabriek, zonder school',
      wrong: ['Korte werkdagen, hoog loon en elke dag school', 'Les van een Griekse leraar in een Romeinse villa', 'Veel vrije tijd om te gamen na school'],
      explain: 'Een arbeiderskind werkte lange dagen. Het werk was gevaarlijk en het kind ging niet naar school.'
    },
    {
      prompt: 'Welke plek kozen de eerste mensen voor hun nederzetting?',
      answer: 'Dichtbij water en vruchtbare grond',
      wrong: ['Ver van water, op onvruchtbare grond', 'Naast een spinnerij met arbeidershuisjes', 'Op een plek zonder water en zonder voedsel'],
      explain: 'Water en vruchtbare grond hielpen om op één plaats te wonen en voedsel te kweken.'
    },
    {
      prompt: 'Waarom heeft Cornelius een Griekse leraar?',
      answer: 'De Romeinen leerden veel van de Grieken; Cornelius was rijk en kreeg zo les',
      wrong: ['De Grieken leerden alles van Cornelius', 'Elk Romeins kind had dezelfde Griekse leraar', 'Cornelius werkte als arbeiderskind in een spinnerij'],
      explain: 'De Romeinen hadden veel geleerd van de Grieken. De rijke Cornelius kreeg les van een Griekse leraar.'
    },
    {
      prompt: 'Waarom legden de Romeinen heerbanen aan?',
      answer: 'Zodat het leger zich vlugger kon verplaatsen',
      wrong: ['Om het leger trager te laten reizen', 'Om met een karveel over het land te varen', 'Om arbeiderskinderen naar de fabriek te sturen'],
      explain: 'Een heerbaan is een Romeinse weg. Het leger kon zich daarop vlugger verplaatsen.'
    },
    {
      prompt: 'Waarom woonden mensen in de middeleeuwen graag dicht bij een burcht?',
      answer: 'Ze konden er schuilen bij gevaar en bewerkten het land van de kasteelheer',
      wrong: ['Daar konden alle kinderen gratis naar school', 'Daar stonden de spinnerijen met hoge lonen', 'Daar konden ze met het internet communiceren'],
      explain: 'Bij gevaar konden ze in de burcht vluchten. Ze bewerkten het land van de kasteelheer en gaven een deel van hun oogst af.'
    },
    {
      prompt: 'Bij welke stand horen de gewone burgers in de middeleeuwen?',
      answer: 'De derde stand',
      wrong: ['De stand van de geestelijken', 'De stand van de adel'],
      explain: 'De derde stand bestond uit de gewone burgers.'
    },
    {
      prompt: 'Waarom leven wij nu in een communicatiemaatschappij?',
      answer: 'We kunnen op veel manieren met elkaar communiceren: chatten, mailen, telefoneren en praten',
      wrong: ['Omdat we alleen via een boodschapper kunnen praten', 'Omdat niemand met mensen op afstand kan praten', 'Omdat alleen rijke mensen met elkaar mogen praten'],
      explain: 'Er zijn veel manieren om contact te houden, zoals chatten, mailen, telefoneren, praten en tv.'
    }
  ],

  era(id) {
    return this.eras.find((e) => e.id === id);
  },
};
