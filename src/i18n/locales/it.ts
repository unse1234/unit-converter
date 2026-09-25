import { capitalize as cap } from '@/lib/text';
import type { LocaleContent } from '../types';

/**
 * Italian — Italy.
 *
 * Connector "in" ("libbre in kg", "piedi in metri"); Italians add "gradi"
 * ("gradi fahrenheit in celsius" outranks the bare phrase) and say "gradi
 * centigradi"; questions take the form "quanti cm sono 6 pollici". Demand sits
 * in the numbers — TV sizes, oven temperatures, gym weights, pipe fittings — so
 * this language has the most single-value pages. Decimal comma.
 */
export const it: LocaleContent = {
  locale: 'it',

  text: {
    skipLink: 'Vai al contenuto principale',
    home: 'Home',
    menuOpen: 'Apri il menu delle categorie',
    menuClose: 'Chiudi il menu',
    menuTitle: 'Categorie',
    languageMenu: 'Lingua',
    otherLanguages: 'Questa pagina in altre lingue',
    englishSite: 'Oltre 700 conversioni (in inglese)',
    footerTagline:
      'Fattori di conversione esatti, formule chiare e tabelle di riferimento. Gratis e senza registrazione.',
    footerCategories: 'Categorie',
    footerLanguages: 'Lingue',
    footerAbout: 'Chi siamo',
    footerPrivacy: 'Privacy',
    footerTerms: 'Termini',
    footerContact: 'Contatti',

    homeTitle: 'Convertitore di unità di misura: pollici in cm, libbre in kg e altro',
    homeDescription:
      'Convertitore di unità di misura in italiano: pollici in cm, dimensioni dei TV, gradi Fahrenheit in Celsius, libbre in kg e piedi in metri, con formule esatte e tabelle.',
    homeH1: 'Convertitore di unità di misura',
    homeIntro:
      "Converti pollici in cm, libbre in kg, piedi in metri e gradi Fahrenheit in Celsius all'istante. Inserisci un valore e il risultato appare senza premere alcun pulsante.",
    homeBullets: [
      'Fattori di conversione esatti',
      'Formule e tabelle',
      'Gratis, senza registrazione',
    ],
    popularHeading: 'Le conversioni più cercate',
    popularDescription: 'Le conversioni più cercate in Italia.',
    categoriesHeading: 'Categorie',
    localUnitsHeading: 'Misure locali',
    localUnitsDescription: 'Unità di misura tradizionali e da cucina.',
    languagesHeading: 'UnitFlip in altre lingue',
    languagesDescription: 'Lo stesso convertitore, con le misure che si cercano in ogni paese.',

    converter: {
      value: 'Valore',
      placeholder: 'Scrivi un numero',
      from: 'Da',
      to: 'A',
      swap: 'Inverti le unità',
      result: 'Risultato',
      copy: 'Copia',
      copied: 'Copiato',
      copyFailed: 'Impossibile copiare. Seleziona il numero e copialo a mano.',
      invalid: 'Questo non è un numero. Prova con 10, 2,5 o 1/2.',
      belowAbsoluteZero:
        'Non esistono temperature sotto lo zero assoluto (−273,15 °C, −459,67 °F).',
      equals: '{value} {from} corrispondono a {result} {to}',
      feet: 'Piedi',
      inches: 'Pollici',
    },

    pairH1: ({ phrase }) => `Convertitore ${phrase}`,
    pairTitle: ({ phrase, relation }) => `${cap(phrase)}: convertitore e tabella (${relation})`,
    pairDescription: ({ from, to, relation }) =>
      `Converti ${from.other} in ${to.other} all'istante: ${relation}. Con formula, esempi e tabella di conversione.`,
    pairLead: ({ from, to, factor, formula }) =>
      factor
        ? `1 ${from.one} equivale a ${factor} ${to.other}. Inserisci un valore qualsiasi e il risultato appare subito.`
        : `Per convertire ${from.other} in ${to.other} si usa la formula ${formula}. Inserisci un valore qualsiasi e il risultato appare subito.`,
    howToHeading: ({ phrase }) => `Come convertire ${phrase}?`,
    multiplyExplanation: ({ from, to, factor }) =>
      `Per convertire ${from.other} in ${to.other}, moltiplica il valore per ${factor}, perché 1 ${from.one} equivale a ${factor} ${to.other}.`,
    divideExplanation: ({ from, to, divisor }) =>
      `Per convertire ${from.other} in ${to.other}, dividi il valore per ${divisor}, perché 1 ${to.one} equivale esattamente a ${divisor} ${from.other}.`,
    affineExplanation: ({ from, to, formula }) =>
      `Le scale in ${from.other} e in ${to.other} non partono dallo stesso zero, quindi non basta moltiplicare: si usa la formula ${formula}.`,
    formulaLabel: 'Formula',
    exampleLabel: 'Esempio',
    tableHeading: ({ phrase }) => `Tabella ${phrase}`,
    tableDescription: ({ from, to }) => `I valori da ${from.other} a ${to.other} più usati.`,
    valuesHeading: () => 'Le misure più cercate',
    valuesDescription: () => 'Ogni misura ha la sua pagina con il calcolo passo per passo.',
    faqHeading: 'Domande frequenti',
    relatedHeading: 'Altre conversioni',
    allInCategory: (category) => `Tutte le conversioni di ${category.toLowerCase()}`,
    categoryPairsHeading: (category) => `Conversioni di ${category.toLowerCase()}`,
    pairFaqs: ({ phrase, from, to, factor, formula, example }) => [
      {
        question: `Come si convertono ${phrase}?`,
        answer: `Si usa la formula ${formula}. Ad esempio, ${example.value} ${example.fromName} corrispondono a ${example.result} ${example.toName}.`,
      },
      ...(factor
        ? [
            {
              question: `Quanto vale 1 ${from.one} in ${to.other}?`,
              answer: `1 ${from.one} equivale a ${factor} ${to.other}.`,
            },
          ]
        : []),
      {
        question: `Quanti ${example.toSymbol} sono ${example.value} ${example.fromName}?`,
        answer: `${example.value} ${example.fromName} corrispondono a ${example.result} ${example.toName}. Il calcolo è ${example.working}.`,
      },
    ],

    valueH1: ({ phrase }) => cap(phrase),
    valueTitle: ({ phrase, value, fromSymbol, result, toSymbol }) =>
      `${cap(phrase)}: ${value} ${fromSymbol} = ${result} ${toSymbol}`,
    valueDescription: ({ value, fromName, result, toName, from }) =>
      `${value} ${fromName} ${value === '1' ? 'corrisponde' : 'corrispondono'} a ${result} ${toName}. Guarda il calcolo e converti altre misure in ${from.other}.`,
    valueAnswer: ({ value, fromName, result, toName }) =>
      `${value} ${fromName} ${value === '1' ? 'corrisponde' : 'corrispondono'} a ${result} ${toName}.`,
    workingLabel: 'Calcolo',
    nearbyHeading: ({ from, to }) => `Altre misure da ${from.other} a ${to.other}`,
    backToPair: ({ phrase }) => `Convertitore ${phrase} con la tabella completa`,
    valueFaqs: ({ value, fromName, result, toName, toSymbol, working }) => [
      {
        question: `Quanti ${toSymbol} sono ${value} ${fromName}?`,
        answer: `${value} ${fromName} corrispondono a ${result} ${toName}. Il calcolo è ${working}.`,
      },
    ],

    screenHeading: ({ size }) => `Dimensioni di uno schermo da ${size} pollici`,
    screenIntro: ({ size, diagonal, width, height }) =>
      `I pollici di un TV o di un monitor misurano la diagonale dello schermo. Uno schermo da ${size} pollici ha una diagonale di ${diagonal} cm; in formato 16:9 misura circa ${width} cm di larghezza e ${height} cm di altezza.`,
    screenDiagonal: 'Diagonale',
    screenWidth: 'Larghezza',
    screenHeight: 'Altezza',
    screenSize: 'Pollici',
    screenTableHeading: 'Dimensioni dei TV in cm',
    screenNote:
      "Misure dell'area visibile di uno schermo 16:9. Cornice e piedistallo aggiungono qualche centimetro.",
    tvH1: ({ size }) => `TV da ${size} pollici in cm`,
    tvTitle: ({ size }) => `${size} pollici in cm: diagonale, larghezza e altezza TV`,
    tvDescription: ({ size, diagonal, width, height }) =>
      `${size} pollici = ${diagonal} cm di diagonale. Un TV 16:9 da ${size}" misura circa ${width} × ${height} cm di schermo.`,
    tvFaqs: ({ size, diagonal, width, height }) => [
      {
        question: `Quanto è grande un TV da ${size} pollici in cm?`,
        answer: `Ha una diagonale di ${diagonal} cm e uno schermo di circa ${width} × ${height} cm (16:9).`,
      },
    ],

    heightTableHeading: 'Altezza in piedi e centimetri',
    heightColumn: 'Altezza',
  },

  categories: {
    length: {
      slug: 'lunghezza',
      name: 'Lunghezza',
      title: 'Convertitore di lunghezza',
      description:
        'Converti pollici in cm, piedi in metri e le dimensioni dei TV in centimetri, con formule esatte e tabelle.',
    },
    mass: {
      slug: 'peso',
      name: 'Peso',
      title: 'Convertitore di peso',
      description:
        'Converti libbre in kg e kg in libbre, con tabelle utili anche per i pesi in palestra.',
    },
    temperature: {
      slug: 'temperatura',
      name: 'Temperatura',
      title: 'Convertitore di temperatura',
      description:
        'Converti gradi Fahrenheit in gradi Celsius (centigradi) e viceversa, con la tabella per il forno.',
    },
    volume: {
      slug: 'volume',
      name: 'Volume',
      title: 'Convertitore di volume',
      description: 'Converti galloni americani e imperiali in litri, con formula e tabella.',
    },
  },

  units: {
    inch: { one: 'pollice', other: 'pollici' },
    centimeter: { one: 'centimetro', other: 'centimetri' },
    millimeter: { one: 'millimetro', other: 'millimetri' },
    foot: { one: 'piede', other: 'piedi' },
    meter: { one: 'metro', other: 'metri' },
    pound: { one: 'libbra', other: 'libbre' },
    kilogram: { one: 'chilogrammo', other: 'chilogrammi' },
    gram: { one: 'grammo', other: 'grammi' },
    fahrenheit: { one: 'grado Fahrenheit', other: 'gradi Fahrenheit' },
    celsius: { one: 'grado Celsius', other: 'gradi Celsius' },
    'us-gallon': { one: 'gallone americano', other: 'galloni americani' },
    'imperial-gallon': { one: 'gallone imperiale', other: 'galloni imperiali' },
    liter: { one: 'litro', other: 'litri' },
    milliliter: { one: 'millilitro', other: 'millilitri', symbol: 'ml' },
  },

  pairs: [
    /* Lunghezza ------------------------------------------------------------ */
    {
      category: 'length',
      slug: 'pollici-in-cm',
      from: 'inch',
      to: 'centimeter',
      phrase: 'pollici in cm',
      title: 'Pollici in cm: convertitore e tabella (1" = 2,54 cm)',
      description:
        "Converti pollici in centimetri all'istante. 1 pollice = 2,54 cm. Tabella da 1 a 100 pollici e dimensioni dei TV in cm.",
      extraUnits: ['millimeter', 'foot', 'meter'],
      popular: true,
      values: {
        list: [4, 5, 6, 7, 8, 10, 11, 12, 15, 22, 24, 27, 28, 32, 40, 43, 50, 55, 65],
        slug: '{n}-pollici-in-cm',
        phrase: '{n} pollici in cm',
        titles: {
          32: '32 pollici in cm: 81,28 cm di diagonale',
          55: '55 pollici in cm: diagonale, larghezza e altezza TV',
        },
        descriptions: {
          32: 'Un TV da 32 pollici ha 81,28 cm di diagonale e uno schermo di circa 70,8 × 39,8 cm (16:9).',
          55: '55 pollici = 139,7 cm di diagonale. Un TV 16:9 da 55" misura circa 121,8 × 68,5 cm di schermo. Tabella da 32 a 85 pollici.',
        },
      },
      faqs: [
        {
          question: 'Quanti cm sono 6 pollici?',
          answer: '6 pollici sono 15,24 cm.',
        },
        {
          question: 'Quanto sono 3/4 e 1/2 pollici in cm?',
          answer:
            '3/4 di pollice sono 1,905 cm (19,05 mm) e 1/2 pollice è 1,27 cm (12,7 mm): sono le misure di tubi e raccordi idraulici.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'cm-in-pollici',
      from: 'centimeter',
      to: 'inch',
      phrase: 'cm in pollici',
      extraUnits: ['millimeter', 'foot', 'meter'],
    },
    {
      category: 'length',
      slug: 'pollici-in-mm',
      from: 'inch',
      to: 'millimeter',
      phrase: 'pollici in mm',
      extraUnits: ['centimeter'],
      table: [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4],
      notes: [
        'Tubi, raccordi e viti si misurano in frazioni di pollice: 1/2" = 12,7 mm, 3/4" = 19,05 mm e 1" = 25,4 mm.',
      ],
    },
    {
      category: 'length',
      slug: 'piedi-in-metri',
      from: 'foot',
      to: 'meter',
      phrase: 'piedi in metri',
      title: 'Piedi in metri: convertitore ft in m',
      description:
        '1 piede = 0,3048 m. Converti piedi in metri e altitudini (1000 piedi = 304,8 m) con tabella.',
      extraUnits: ['inch', 'centimeter'],
      popular: true,
      table: [1, 2, 3, 5, 6, 7, 8, 10, 15, 20, 30, 50, 100, 500, 1000, 5000, 10000, 35000],
      values: {
        list: [5, 6, 7, 8, 10, 14, 15, 18, 20, 23, 30, 40, 50, 60, 70, 100, 500, 800, 1000],
        slug: '{n}-piedi-in-metri',
        phrase: '{n} piedi in metri',
      },
    },
    {
      category: 'length',
      slug: 'metri-in-piedi',
      from: 'meter',
      to: 'foot',
      phrase: 'metri in piedi',
      extraUnits: ['inch', 'centimeter'],
    },
    {
      category: 'length',
      slug: 'piedi-in-cm',
      from: 'foot',
      to: 'centimeter',
      phrase: 'piedi in cm',
      extraUnits: ['inch', 'meter'],
    },

    /* Peso ----------------------------------------------------------------- */
    {
      category: 'mass',
      slug: 'libbre-in-kg',
      from: 'pound',
      to: 'kilogram',
      phrase: 'libbre in kg',
      title: 'Libbre in kg: convertitore lb in chilogrammi',
      description:
        '1 libbra = 0,4536 kg. Converti libbre in kg con tabella da 1 a 600 lb, utile anche per i pesi in palestra.',
      extraUnits: ['gram'],
      popular: true,
      table: [1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 150, 200, 225, 300, 400, 500, 600],
      values: {
        list: [
          10, 15, 20, 25, 30, 35, 40, 50, 70, 100, 130, 150, 180, 200, 220, 240, 300, 400, 600,
        ],
        slug: '{n}-libbre-in-kg',
        phrase: '{n} libbre in kg',
      },
    },
    {
      category: 'mass',
      slug: 'kg-in-libbre',
      from: 'kilogram',
      to: 'pound',
      phrase: 'kg in libbre',
      extraUnits: ['gram'],
    },

    /* Temperatura ---------------------------------------------------------- */
    {
      category: 'temperature',
      slug: 'fahrenheit-in-celsius',
      from: 'fahrenheit',
      to: 'celsius',
      phrase: 'gradi Fahrenheit in Celsius',
      title: 'Gradi Fahrenheit in Celsius: convertitore °F in °C',
      description:
        'Converti gradi Fahrenheit in gradi centigradi con la formula (°F − 32) × 5/9. Tabella per il forno: 350 °F = 177 °C.',
      popular: true,
      table: [0, 32, 40, 50, 60, 70, 75, 80, 90, 98.6, 100, 212, 300, 350, 375, 400, 450, 500],
      values: {
        list: [40, 60, 70, 72, 75, 77, 80, 82, 95, 98, 99, 100, 350, 400],
        slug: '{n}-gradi-fahrenheit-in-celsius',
        phrase: '{n} gradi Fahrenheit in Celsius',
        titles: { 100: '100 gradi Fahrenheit in Celsius: 37,8 °C' },
        descriptions: {
          100: '100 °F corrispondono a 37,8 °C. Guarda il calcolo e le temperature vicine.',
        },
      },
      faqs: [
        {
          question: 'Come cambiare i gradi Fahrenheit in gradi centigradi?',
          answer:
            'Sottrai 32 e moltiplica per 5/9. I gradi centigradi sono i gradi Celsius: 350 °F nel forno sono 176,7 °C, di solito arrotondati a 180 °C.',
        },
      ],
    },
    {
      category: 'temperature',
      slug: 'celsius-in-fahrenheit',
      from: 'celsius',
      to: 'fahrenheit',
      phrase: 'gradi Celsius in Fahrenheit',
      table: [-40, -10, 0, 10, 20, 25, 30, 32, 35, 37, 40, 100, 160, 180, 200, 220],
      faqs: [
        {
          question: 'Quanti gradi Fahrenheit sono 32 gradi Celsius?',
          answer: '32 °C corrispondono a 89,6 °F.',
        },
      ],
    },

    /* Volume --------------------------------------------------------------- */
    {
      category: 'volume',
      slug: 'galloni-in-litri',
      from: 'us-gallon',
      to: 'liter',
      phrase: 'galloni in litri',
      extraUnits: ['imperial-gallon', 'milliliter'],
      notes: [
        'Il gallone americano misura 3,785 litri; il gallone imperiale britannico è più grande: 4,546 litri.',
      ],
    },
  ],
};
