import { capitalize as cap } from '@/lib/text';
import type { LocaleContent } from '../types';

/**
 * French — France.
 *
 * Connector "en" ("pouces en cm", "livres en kg"), "degrés fahrenheit en
 * celsius". TV sizes carry the demand (55 and 65 pouces en cm are each above
 * 10,000 searches a month); weight and temperature are thin, so only their ten
 * most-searched values get pages. The "livre" false friend (500 g in everyday
 * French) is explained on the pound pages. Decimal comma.
 */
export const fr: LocaleContent = {
  locale: 'fr',

  text: {
    skipLink: 'Aller au contenu principal',
    home: 'Accueil',
    menuOpen: 'Ouvrir le menu des catégories',
    menuClose: 'Fermer le menu',
    menuTitle: 'Catégories',
    languageMenu: 'Langue',
    otherLanguages: "Cette page dans d'autres langues",
    englishSite: 'Plus de 700 conversions (en anglais)',
    footerTagline:
      'Facteurs de conversion exacts, formules claires et tableaux de référence. Gratuit et sans inscription.',
    footerCategories: 'Catégories',
    footerLanguages: 'Langues',
    footerAbout: 'À propos',
    footerPrivacy: 'Confidentialité',
    footerTerms: 'Conditions',
    footerContact: 'Contact',

    homeTitle: "Convertisseur d'unités gratuit : pouces en cm, livres en kg et plus",
    homeDescription:
      "Convertisseur d'unités en français : pouces en cm, taille des TV, livres en kg, degrés Fahrenheit en Celsius et cup en ml, avec formules exactes et tableaux.",
    homeH1: "Convertisseur d'unités",
    homeIntro:
      "Convertissez des pouces en cm, des livres en kg, des pieds en mètres et des degrés Fahrenheit en Celsius instantanément. Saisissez une valeur : le résultat s'affiche sans cliquer sur aucun bouton.",
    homeBullets: [
      'Facteurs de conversion exacts',
      'Formules et tableaux',
      'Gratuit, sans inscription',
    ],
    popularHeading: 'Les conversions les plus recherchées',
    popularDescription: 'Les conversions les plus recherchées en France.',
    categoriesHeading: 'Catégories',
    localUnitsHeading: 'Cuisine et pâtisserie',
    localUnitsDescription: 'Les cups des recettes américaines converties en millilitres.',
    languagesHeading: "UnitFlip dans d'autres langues",
    languagesDescription: 'Le même convertisseur, avec les mesures recherchées dans chaque pays.',

    converter: {
      value: 'Valeur',
      placeholder: 'Saisissez un nombre',
      from: 'De',
      to: 'En',
      swap: 'Inverser les unités',
      result: 'Résultat',
      copy: 'Copier',
      copied: 'Copié',
      copyFailed: 'Copie impossible. Sélectionnez le nombre et copiez-le manuellement.',
      invalid: "Ce n'est pas un nombre. Essayez 10, 2,5 ou 1/2.",
      belowAbsoluteZero:
        "Aucune température n'existe sous le zéro absolu (−273,15 °C, −459,67 °F).",
      equals: '{value} {from} équivalent à {result} {to}',
      feet: 'Pieds',
      inches: 'Pouces',
    },

    pairH1: ({ phrase }) => `Convertisseur ${phrase}`,
    pairTitle: ({ phrase, relation }) => `${cap(phrase)} : convertisseur et tableau (${relation})`,
    pairDescription: ({ from, to, relation }) =>
      `Convertissez des ${from.other} en ${to.other} instantanément : ${relation}. Avec la formule, des exemples et un tableau de conversion.`,
    pairLead: ({ from, to, factor, formula }) =>
      factor
        ? `1 ${from.one} équivaut à ${factor} ${to.other}. Saisissez une valeur et le résultat s'affiche aussitôt.`
        : `Pour convertir des ${from.other} en ${to.other}, on utilise la formule ${formula}. Saisissez une valeur et le résultat s'affiche aussitôt.`,
    howToHeading: ({ phrase }) => `Comment convertir des ${phrase} ?`,
    multiplyExplanation: ({ from, to, factor }) =>
      `Pour convertir des ${from.other} en ${to.other}, multipliez la valeur par ${factor}, car 1 ${from.one} équivaut à ${factor} ${to.other}.`,
    divideExplanation: ({ from, to, divisor }) =>
      `Pour convertir des ${from.other} en ${to.other}, divisez la valeur par ${divisor}, car 1 ${to.one} équivaut exactement à ${divisor} ${from.other}.`,
    affineExplanation: ({ formula }) =>
      `Ces deux échelles de température n'ont pas le même zéro : il ne suffit pas de multiplier, on utilise la formule ${formula}.`,
    formulaLabel: 'Formule',
    exampleLabel: 'Exemple',
    tableHeading: ({ phrase }) => `Tableau de conversion ${phrase}`,
    tableDescription: ({ from, to }) =>
      `Les valeurs les plus courantes, des ${from.other} en ${to.other}.`,
    valuesHeading: () => 'Les valeurs les plus recherchées',
    valuesDescription: () => 'Chaque valeur a sa propre page avec le calcul détaillé.',
    faqHeading: 'Questions fréquentes',
    relatedHeading: 'Autres conversions',
    allInCategory: (category) => `Toutes les conversions de ${category.toLowerCase()}`,
    categoryPairsHeading: (category) => `Conversions de ${category.toLowerCase()}`,
    pairFaqs: ({ phrase, from, to, factor, formula, example }) => [
      {
        question: `Comment convertir des ${phrase} ?`,
        answer: `Utilisez la formule ${formula}. Par exemple, ${example.value} ${example.fromName} font ${example.result} ${example.toName}.`,
      },
      ...(factor
        ? [
            {
              question: `Combien de ${to.other} dans 1 ${from.one} ?`,
              answer: `1 ${from.one} équivaut à ${factor} ${to.other}.`,
            },
          ]
        : []),
      {
        question: `Combien font ${example.value} ${example.fromName} en ${to.other} ?`,
        answer: `${example.value} ${example.fromName} font ${example.result} ${example.toName}. Le calcul : ${example.working}.`,
      },
    ],

    valueH1: ({ phrase }) => cap(phrase),
    valueTitle: ({ phrase, value, fromSymbol, result, toSymbol }) =>
      `${cap(phrase)} : ${value} ${fromSymbol} = ${result} ${toSymbol}`,
    valueDescription: ({ value, fromName, result, toName, from }) =>
      `${value} ${fromName} ${value === '1' ? 'équivaut' : 'équivalent'} à ${result} ${toName}. Voyez le calcul et convertissez d'autres valeurs en ${from.other}.`,
    valueAnswer: ({ value, fromName, result, toName }) =>
      `${value} ${fromName} ${value === '1' ? 'équivaut' : 'équivalent'} à ${result} ${toName}.`,
    workingLabel: 'Calcul',
    nearbyHeading: ({ from, to }) => `Autres valeurs, des ${from.other} en ${to.other}`,
    backToPair: ({ phrase }) => `Convertisseur ${phrase} avec le tableau complet`,
    valueFaqs: ({ value, fromName, result, toName, to, working }) => [
      {
        question: `Combien font ${value} ${fromName} en ${to.other} ?`,
        answer: `${value} ${fromName} font ${result} ${toName}. Le calcul : ${working}.`,
      },
    ],

    screenHeading: ({ size }) => `Dimensions d'un écran de ${size} pouces`,
    screenIntro: ({ size, diagonal, width, height }) =>
      `Les pouces d'un téléviseur ou d'un moniteur mesurent la diagonale de l'écran. Un écran de ${size} pouces fait ${diagonal} cm de diagonale ; au format 16:9, il mesure environ ${width} cm de largeur et ${height} cm de hauteur.`,
    screenDiagonal: 'Diagonale',
    screenWidth: 'Largeur',
    screenHeight: 'Hauteur',
    screenSize: 'Pouces',
    screenTableHeading: 'Taille des TV en cm',
    screenNote:
      "Dimensions de la surface d'affichage d'un écran 16:9. Le cadre et le pied ajoutent quelques centimètres.",
    tvH1: ({ size }) => `TV ${size} pouces en cm`,
    tvTitle: ({ size }) => `${size} pouces en cm : diagonale, largeur et hauteur d'une TV`,
    tvDescription: ({ size, diagonal, width, height }) =>
      `${size} pouces = ${diagonal} cm de diagonale. Une TV 16:9 de ${size} pouces mesure environ ${width} × ${height} cm d'écran.`,
    tvFaqs: ({ size, diagonal, width, height }) => [
      {
        question: `Quelle est la taille d'une TV de ${size} pouces en cm ?`,
        answer: `Elle fait ${diagonal} cm de diagonale, soit un écran d'environ ${width} cm de largeur et ${height} cm de hauteur (16:9).`,
      },
    ],

    heightTableHeading: 'Taille en pieds et en centimètres',
    heightColumn: 'Taille',
  },

  categories: {
    length: {
      slug: 'longueur',
      name: 'Longueur',
      title: 'Convertisseur de longueur',
      description:
        'Convertissez des pouces en cm, des pieds en mètres, des miles en km et la taille des TV en centimètres, avec formules et tableaux.',
    },
    mass: {
      slug: 'poids',
      name: 'Poids',
      title: 'Convertisseur de poids',
      description:
        'Convertissez des livres en kg, des kg en livres et des onces en grammes, sans confondre la livre anglaise et la livre de 500 g.',
    },
    temperature: {
      slug: 'temperature',
      name: 'Température',
      title: 'Convertisseur de température',
      description:
        'Convertissez des degrés Fahrenheit en Celsius et inversement, avec le tableau des températures du four.',
    },
    volume: {
      slug: 'volume',
      name: 'Volume',
      title: 'Convertisseur de volume',
      description: 'Convertissez des gallons US et impériaux en litres, avec formule et tableau.',
    },
    speed: {
      slug: 'vitesse',
      name: 'Vitesse',
      title: 'Convertisseur de vitesse',
      description: 'Convertissez des miles par heure en km/h avec la formule exacte.',
    },
    cooking: {
      slug: 'cuisine',
      name: 'Cuisine',
      title: 'Convertisseur de mesures de cuisine',
      description:
        'Convertissez les cups des recettes américaines en ml : cup US de 236,6 ml et cup métrique de 250 ml.',
    },
  },

  units: {
    inch: { one: 'pouce', other: 'pouces', symbol: 'po' },
    centimeter: { one: 'centimètre', other: 'centimètres' },
    millimeter: { one: 'millimètre', other: 'millimètres' },
    foot: { one: 'pied', other: 'pieds' },
    meter: { one: 'mètre', other: 'mètres' },
    kilometer: { one: 'kilomètre', other: 'kilomètres' },
    mile: { one: 'mile', other: 'miles' },
    pound: { one: 'livre', other: 'livres' },
    kilogram: { one: 'kilogramme', other: 'kilogrammes' },
    ounce: { one: 'once', other: 'onces' },
    gram: { one: 'gramme', other: 'grammes' },
    fahrenheit: { one: 'degré Fahrenheit', other: 'degrés Fahrenheit' },
    celsius: { one: 'degré Celsius', other: 'degrés Celsius' },
    'us-gallon': { one: 'gallon US', other: 'gallons US' },
    'imperial-gallon': { one: 'gallon impérial', other: 'gallons impériaux' },
    liter: { one: 'litre', other: 'litres' },
    milliliter: { one: 'millilitre', other: 'millilitres', symbol: 'ml' },
    'us-cup': { one: 'cup américaine', other: 'cups américaines', symbol: 'cup' },
    'metric-cup': { one: 'cup métrique', other: 'cups métriques', symbol: 'cup métrique' },
    'us-tablespoon': { one: 'cuillère à soupe', other: 'cuillères à soupe', symbol: 'c. à s.' },
    'mile-per-hour': { one: 'mile par heure', other: 'miles par heure' },
    'kilometer-per-hour': { one: 'kilomètre par heure', other: 'kilomètres par heure' },
  },

  pairs: [
    /* Longueur ------------------------------------------------------------- */
    {
      category: 'length',
      slug: 'pouces-en-cm',
      from: 'inch',
      to: 'centimeter',
      phrase: 'pouces en cm',
      title: 'Pouces en cm : convertisseur et tableau (1 po = 2,54 cm)',
      description:
        'Convertissez des pouces en centimètres instantanément. 1 pouce = 2,54 cm. Tableau de 1 à 100 pouces et tailles d’écran TV.',
      extraUnits: ['millimeter', 'foot', 'meter'],
      popular: true,
      values: {
        list: [6, 10, 12, 14, 15, 16, 20, 24, 27, 32, 40, 43, 50, 55, 65, 75],
        slug: '{n}-pouces-en-cm',
        phrase: '{n} pouces en cm',
        titles: {
          55: "55 pouces en cm : diagonale, largeur et hauteur d'une TV",
          65: '65 pouces en cm : 165,1 cm de diagonale',
        },
        descriptions: {
          55: "55 pouces = 139,7 cm de diagonale. Une TV 16:9 de 55 pouces mesure environ 121,8 × 68,5 cm d'écran. Tableau de 32 à 85 pouces.",
          65: "Une TV de 65 pouces fait 165,1 cm de diagonale, soit un écran d'environ 143,9 × 80,9 cm (16:9).",
        },
      },
      faqs: [
        {
          question: 'Où trouver un tableau de conversion pouce en cm ?',
          answer:
            'Le tableau de cette page va de 1 à 100 pouces, et le tableau des tailles de TV donne la diagonale, la largeur et la hauteur de 24 à 85 pouces.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'cm-en-pouces',
      from: 'centimeter',
      to: 'inch',
      phrase: 'cm en pouces',
      extraUnits: ['millimeter', 'foot', 'meter'],
    },
    {
      category: 'length',
      slug: 'pieds-en-metres',
      from: 'foot',
      to: 'meter',
      phrase: 'pieds en mètres',
      title: 'Pieds en mètres : convertisseur ft en m',
      description:
        '1 pied = 0,3048 m. Convertissez pieds et pouces en mètres et centimètres, avec tableau.',
      extraUnits: ['inch', 'centimeter'],
      popular: true,
    },
    {
      category: 'length',
      slug: 'metres-en-pieds',
      from: 'meter',
      to: 'foot',
      phrase: 'mètres en pieds',
      extraUnits: ['inch', 'centimeter'],
    },
    {
      category: 'length',
      slug: 'pieds-en-cm',
      from: 'foot',
      to: 'centimeter',
      phrase: 'pieds en cm',
      extraUnits: ['inch', 'meter'],
    },
    {
      category: 'length',
      slug: 'miles-en-km',
      from: 'mile',
      to: 'kilometer',
      phrase: 'miles en km',
      extraUnits: ['meter'],
    },
    {
      category: 'length',
      slug: 'km-en-miles',
      from: 'kilometer',
      to: 'mile',
      phrase: 'km en miles',
      extraUnits: ['meter'],
    },

    /* Poids ---------------------------------------------------------------- */
    {
      category: 'mass',
      slug: 'livres-en-kg',
      from: 'pound',
      to: 'kilogram',
      phrase: 'livres en kg',
      title: 'Livres en kg : convertisseur lb en kilogrammes',
      description:
        '1 livre (lb) = 0,4536 kg, à ne pas confondre avec la livre de 500 g. Tableau de 1 à 600 lb.',
      extraUnits: ['ounce', 'gram'],
      popular: true,
      table: [1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 60, 100, 150, 200, 220, 300, 400, 500, 600],
      values: {
        list: [1, 2, 5, 10, 15, 20, 50, 100, 200, 300],
        slug: '{n}-livres-en-kg',
        phrase: '{n} livres en kg',
        one: { slug: '1-livre-en-kg', phrase: '1 livre en kg' },
      },
      notes: [
        "La livre anglo-saxonne (lb, « pound ») pèse 453,59 g. En France, « une livre » désigne couramment 500 g : ce n'est pas la même unité. Les abréviations lb et lbs désignent toutes deux la livre anglo-saxonne.",
      ],
      faqs: [
        {
          question: 'Pourquoi dit-on une livre pour 500 g ?',
          answer:
            "C'est un héritage de l'ancienne livre française (environ 489 g), arrondie à 500 g lors du passage au système métrique. La livre anglo-saxonne (lb) pèse 453,59 g.",
        },
        {
          question: 'Comment convertir des lbs ou des pounds en kg ?',
          answer:
            'lbs et pounds désignent la même livre anglo-saxonne : multipliez par 0,45359237. Par exemple, 150 lbs font 68,04 kg.',
        },
      ],
    },
    {
      category: 'mass',
      slug: 'kg-en-livres',
      from: 'kilogram',
      to: 'pound',
      phrase: 'kg en livres',
      extraUnits: ['ounce', 'gram'],
    },
    {
      category: 'mass',
      slug: 'onces-en-grammes',
      from: 'ounce',
      to: 'gram',
      phrase: 'onces en grammes',
      extraUnits: ['pound', 'kilogram'],
    },
    {
      category: 'mass',
      slug: 'grammes-en-onces',
      from: 'gram',
      to: 'ounce',
      phrase: 'grammes en onces',
      extraUnits: ['pound', 'kilogram'],
      table: [1, 5, 10, 25, 50, 100, 125, 200, 250, 500, 1000],
      faqs: [
        {
          question: "Combien d'onces font 100 grammes ?",
          answer: '100 grammes font 3,527 onces.',
        },
      ],
    },

    /* Température ---------------------------------------------------------- */
    {
      category: 'temperature',
      slug: 'fahrenheit-en-celsius',
      from: 'fahrenheit',
      to: 'celsius',
      phrase: 'degrés Fahrenheit en Celsius',
      title: 'Degrés Fahrenheit en Celsius : convertisseur °F en °C',
      description:
        'Formule (°F − 32) × 5/9. Tableau four : 350 °F = 177 °C, 375 °F = 191 °C, 400 °F = 204 °C.',
      popular: true,
      table: [0, 32, 50, 60, 70, 75, 80, 90, 98.6, 100, 212, 300, 325, 350, 375, 400, 425, 450],
      values: {
        list: [0, 50, 70, 75, 80, 90, 100, 350, 375, 400],
        slug: '{n}-degres-fahrenheit-en-celsius',
        phrase: '{n} degrés Fahrenheit en Celsius',
      },
    },
    {
      category: 'temperature',
      slug: 'celsius-en-fahrenheit',
      from: 'celsius',
      to: 'fahrenheit',
      phrase: 'degrés Celsius en Fahrenheit',
      table: [-40, -10, 0, 10, 20, 25, 30, 37, 40, 100, 150, 180, 200, 220],
    },

    /* Volume --------------------------------------------------------------- */
    {
      category: 'volume',
      slug: 'gallons-en-litres',
      from: 'us-gallon',
      to: 'liter',
      phrase: 'gallons en litres',
      extraUnits: ['imperial-gallon', 'milliliter'],
      faqs: [
        {
          question: 'Quelle est la différence entre le gallon impérial et le gallon US ?',
          answer:
            'Le gallon US, utilisé aux États-Unis, fait 3,785 litres. Le gallon impérial, utilisé au Royaume-Uni, est plus grand : 4,546 litres.',
        },
      ],
    },
    {
      category: 'volume',
      slug: 'gallons-imperiaux-en-litres',
      from: 'imperial-gallon',
      to: 'liter',
      phrase: 'gallons impériaux en litres',
      extraUnits: ['us-gallon', 'milliliter'],
    },

    /* Cuisine -------------------------------------------------------------- */
    {
      category: 'cooking',
      slug: 'cup-en-ml',
      from: 'us-cup',
      to: 'milliliter',
      phrase: 'cup en ml',
      h1: 'Convertir des cups en ml',
      title: 'Cup en ml : conversions pour la pâtisserie (1 cup = 236,6 ml)',
      description:
        '1 cup américaine = 236,6 ml. Convertissez 1, 1/2 et 1/4 cup en ml, avec la cup métrique de 250 ml.',
      extraUnits: ['metric-cup', 'us-tablespoon', 'liter'],
      table: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2, 3, 4],
      notes: [
        'Les recettes américaines utilisent la cup de 236,6 ml ; les recettes australiennes et canadiennes, la cup métrique de 250 ml. Choisissez la vôtre dans le convertisseur.',
      ],
      faqs: [
        {
          question: 'Combien de ml dans 1/2 cup ?',
          answer: '1/2 cup américaine fait 118,3 ml ; 1/4 cup fait 59,1 ml.',
        },
      ],
    },

    /* Vitesse -------------------------------------------------------------- */
    {
      category: 'speed',
      slug: 'miles-par-heure-en-km-h',
      from: 'mile-per-hour',
      to: 'kilometer-per-hour',
      phrase: 'miles en km/h',
      table: [10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150],
      faqs: [
        {
          question: 'Combien font 100 miles en km/h ?',
          answer: '100 miles par heure font 160,93 km/h.',
        },
      ],
    },
  ],
};
