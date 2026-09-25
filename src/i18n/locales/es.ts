import { capitalize as cap } from '@/lib/text';
import type { LocaleContent } from '../types';

/**
 * Spanish — one build for Mexico (primary), Spain and Colombia.
 *
 * Written in neutral Spanish with Latin American vocabulary: "kilos" rather than
 * "kilogramos", the connector "a" ("pies a metros"), "convertidor" as in Mexico
 * with "conversor" and "pasar de" (Spain) in the copy. Numbers use a decimal
 * point, as Mexico writes them. Keywords, titles and descriptions come from the
 * market research in docs/multilingual-seo.md.
 */
export const es: LocaleContent = {
  locale: 'es',

  text: {
    skipLink: 'Saltar al contenido principal',
    home: 'Inicio',
    menuOpen: 'Abrir el menú de categorías',
    menuClose: 'Cerrar el menú',
    menuTitle: 'Categorías',
    languageMenu: 'Idioma',
    otherLanguages: 'Esta página en otros idiomas',
    englishSite: 'Más de 700 conversiones (en inglés)',
    footerTagline:
      'Factores de conversión exactos, fórmulas claras y tablas de referencia. Gratis y sin registro.',
    footerCategories: 'Categorías',
    footerLanguages: 'Idiomas',
    footerAbout: 'Acerca de',
    footerPrivacy: 'Privacidad',
    footerTerms: 'Términos',
    footerContact: 'Contacto',

    homeTitle: 'Convertidor de unidades gratis: pulgadas a cm, libras a kilos y más',
    homeDescription:
      'Convertidor de unidades en español: pulgadas a cm, libras a kilos, pies a metros, galones a litros y grados Fahrenheit a Celsius, con fórmulas exactas y tablas.',
    homeH1: 'Convertidor de unidades',
    homeIntro:
      'Convierte pulgadas a cm, libras a kilos, pies a metros y galones a litros al instante. Escribe un valor y el resultado aparece sin pulsar ningún botón.',
    homeBullets: [
      'Factores de conversión exactos',
      'Fórmulas y tablas de conversión',
      'Gratis y sin registro',
    ],
    popularHeading: 'Conversiones más buscadas',
    popularDescription: 'Las conversiones que más se buscan en México, España y Colombia.',
    categoriesHeading: 'Categorías',
    localUnitsHeading: 'Cocina y estatura',
    localUnitsDescription:
      'Tazas a mililitros para recetas y una calculadora de estatura en pies y pulgadas.',
    languagesHeading: 'UnitFlip en otros idiomas',
    languagesDescription: 'El mismo convertidor, con las medidas que se buscan en cada país.',

    converter: {
      value: 'Valor',
      placeholder: 'Escribe un número',
      from: 'De',
      to: 'A',
      swap: 'Intercambiar unidades',
      result: 'Resultado',
      copy: 'Copiar',
      copied: 'Copiado',
      copyFailed: 'No se pudo copiar. Selecciona el número y cópialo manualmente.',
      invalid: 'Eso no es un número. Prueba con 10, 2.5 o 1/2.',
      belowAbsoluteZero:
        'No existen temperaturas por debajo del cero absoluto (−273.15 °C, −459.67 °F).',
      equals: '{value} {from} equivale a {result} {to}',
      feet: 'Pies',
      inches: 'Pulgadas',
    },

    pairH1: ({ phrase }) => `Convertidor de ${phrase}`,
    pairTitle: ({ phrase, relation }) => `${cap(phrase)}: convertidor y tabla (${relation})`,
    pairDescription: ({ from, to, relation }) =>
      `Convierte ${from.other} a ${to.other} al instante: ${relation}. Incluye la fórmula, ejemplos y una tabla de conversión.`,
    pairLead: ({ from, to, factor, formula }) =>
      factor
        ? `1 ${from.one} equivale a ${factor} ${to.other}. Escribe cualquier valor y el resultado aparece al instante.`
        : `Para convertir ${from.other} a ${to.other} se usa la fórmula ${formula}. Escribe cualquier valor y el resultado aparece al instante.`,
    howToHeading: ({ phrase }) => `¿Cómo pasar de ${phrase}?`,
    multiplyExplanation: ({ from, to, factor }) =>
      `Para convertir ${from.other} a ${to.other}, multiplica el valor por ${factor}, porque 1 ${from.one} equivale a ${factor} ${to.other}.`,
    divideExplanation: ({ from, to, divisor }) =>
      `Para convertir ${from.other} a ${to.other}, divide el valor entre ${divisor}, porque 1 ${to.one} equivale exactamente a ${divisor} ${from.other}.`,
    affineExplanation: ({ from, to, formula }) =>
      `Las escalas de ${from.other} y ${to.other} no comparten el mismo cero, así que no basta con multiplicar: se usa la fórmula ${formula}.`,
    formulaLabel: 'Fórmula',
    exampleLabel: 'Ejemplo',
    tableHeading: ({ phrase }) => `Tabla de ${phrase}`,
    tableDescription: ({ from, to }) =>
      `Equivalencias de ${from.other} a ${to.other} de uso más frecuente.`,
    valuesHeading: () => 'Medidas más buscadas',
    valuesDescription: () => 'Cada medida tiene su propia página con el cálculo paso a paso.',
    faqHeading: 'Preguntas frecuentes',
    relatedHeading: 'Otras conversiones',
    allInCategory: (category) => `Ver todas las conversiones de ${category.toLowerCase()}`,
    categoryPairsHeading: (category) => `Conversiones de ${category.toLowerCase()}`,
    pairFaqs: ({ phrase, from, to, factor, formula, example }) => [
      {
        question: `¿Cómo convertir ${phrase}?`,
        answer: `Usa la fórmula ${formula}. Por ejemplo, ${example.value} ${example.fromName} equivalen a ${example.result} ${example.toName}.`,
      },
      ...(factor
        ? [
            {
              question: `¿A cuánto equivale 1 ${from.one} en ${to.other}?`,
              answer: `1 ${from.one} equivale a ${factor} ${to.other}.`,
            },
          ]
        : []),
      {
        question: `¿Cuánto son ${example.value} ${example.fromName} en ${to.other}?`,
        answer: `${example.value} ${example.fromName} son ${example.result} ${example.toName}. El cálculo es ${example.working}.`,
      },
    ],

    valueH1: ({ phrase }) => cap(phrase),
    valueTitle: ({ phrase, value, fromSymbol, result, toSymbol }) =>
      `${cap(phrase)}: ${value} ${fromSymbol} = ${result} ${toSymbol}`,
    valueDescription: ({ value, fromName, result, toName, from }) =>
      `${value} ${fromName} ${value === '1' ? 'equivale' : 'equivalen'} a ${result} ${toName}. Ve el cálculo paso a paso y convierte otras medidas en ${from.other}.`,
    valueAnswer: ({ value, fromName, result, toName }) =>
      `${value} ${fromName} ${value === '1' ? 'equivale' : 'equivalen'} a ${result} ${toName}.`,
    workingLabel: 'Cálculo',
    nearbyHeading: ({ from, to }) => `Otras medidas de ${from.other} a ${to.other}`,
    backToPair: ({ phrase }) => `Convertidor de ${phrase} con la tabla completa`,
    valueFaqs: ({ value, fromName, result, toName, to, working }) => [
      {
        question: `¿Cuánto son ${value} ${fromName} en ${to.other}?`,
        answer: `${value} ${fromName} son ${result} ${toName}. El cálculo es ${working}.`,
      },
    ],

    screenHeading: ({ size }) => `Medidas de una pantalla de ${size} pulgadas`,
    screenIntro: ({ size, diagonal, width, height }) =>
      `Las pulgadas de un televisor o monitor miden la diagonal de la pantalla. Una pantalla de ${size} pulgadas mide ${diagonal} cm en diagonal; en formato 16:9 tiene unos ${width} cm de ancho y ${height} cm de alto.`,
    screenDiagonal: 'Diagonal',
    screenWidth: 'Ancho',
    screenHeight: 'Alto',
    screenSize: 'Pulgadas',
    screenTableHeading: 'Medidas de pantallas de TV en cm',
    screenNote:
      'Medidas del área visible de una pantalla 16:9. El marco y la base añaden algunos centímetros.',
    tvH1: ({ size }) => `Pantalla de ${size} pulgadas en cm`,
    tvTitle: ({ size, diagonal }) => `TV de ${size} pulgadas en cm: ${diagonal} cm de diagonal`,
    tvDescription: ({ size, diagonal, width, height }) =>
      `Una TV de ${size} pulgadas mide ${diagonal} cm de diagonal y unos ${width} × ${height} cm de pantalla (16:9).`,
    tvFaqs: ({ size, diagonal, width, height }) => [
      {
        question: `¿Cuánto mide una TV de ${size} pulgadas en cm?`,
        answer: `Mide ${diagonal} cm en diagonal, con una pantalla de unos ${width} cm de ancho y ${height} cm de alto.`,
      },
    ],

    heightTableHeading: 'Tabla de estaturas en pies y centímetros',
    heightColumn: 'Estatura',
  },

  categories: {
    length: {
      slug: 'longitud',
      name: 'Longitud',
      title: 'Convertidor de longitud',
      description:
        'Convierte pulgadas a cm, pies a metros, millas a km y más medidas de longitud, con fórmulas exactas y tablas de conversión.',
    },
    mass: {
      slug: 'peso',
      name: 'Peso',
      title: 'Convertidor de peso',
      description:
        'Convierte libras a kilos, kilos a libras y onzas a gramos al instante, con fórmulas y tablas de peso.',
    },
    temperature: {
      slug: 'temperatura',
      name: 'Temperatura',
      title: 'Convertidor de temperatura',
      description:
        'Convierte grados Fahrenheit a Celsius (centígrados) y Celsius a Fahrenheit, con tablas de temperaturas de horno, fiebre y clima.',
    },
    volume: {
      slug: 'volumen',
      name: 'Volumen',
      title: 'Convertidor de volumen',
      description:
        'Convierte galones a litros, litros a galones y onzas a ml, con el galón estadounidense y el imperial.',
    },
    area: {
      slug: 'area',
      name: 'Área',
      title: 'Convertidor de área',
      description:
        'Convierte hectáreas, metros cuadrados y pies cuadrados, con fórmulas exactas y tablas.',
    },
    speed: {
      slug: 'velocidad',
      name: 'Velocidad',
      title: 'Convertidor de velocidad',
      description: 'Convierte millas por hora a km/h con la fórmula exacta y una tabla.',
    },
    cooking: {
      slug: 'cocina',
      name: 'Cocina',
      title: 'Convertidor de medidas de cocina',
      description:
        'Convierte tazas a ml para tus recetas: taza de EE. UU., taza métrica y taza de etiquetas nutricionales.',
    },
  },

  units: {
    inch: { one: 'pulgada', other: 'pulgadas' },
    centimeter: { one: 'centímetro', other: 'centímetros' },
    millimeter: { one: 'milímetro', other: 'milímetros' },
    foot: { one: 'pie', other: 'pies' },
    meter: { one: 'metro', other: 'metros' },
    kilometer: { one: 'kilómetro', other: 'kilómetros' },
    mile: { one: 'milla', other: 'millas' },
    'nautical-mile': { one: 'milla náutica', other: 'millas náuticas' },
    pound: { one: 'libra', other: 'libras' },
    kilogram: { one: 'kilo', other: 'kilos' },
    ounce: { one: 'onza', other: 'onzas' },
    'troy-ounce': { one: 'onza troy', other: 'onzas troy' },
    gram: { one: 'gramo', other: 'gramos' },
    fahrenheit: { one: 'grado Fahrenheit', other: 'grados Fahrenheit' },
    celsius: { one: 'grado Celsius', other: 'grados Celsius' },
    'us-gallon': { one: 'galón', other: 'galones' },
    'imperial-gallon': { one: 'galón imperial', other: 'galones imperiales' },
    liter: { one: 'litro', other: 'litros' },
    'us-fluid-ounce': { one: 'onza líquida', other: 'onzas líquidas' },
    milliliter: { one: 'mililitro', other: 'mililitros', symbol: 'ml' },
    'us-cup': { one: 'taza (EE. UU.)', other: 'tazas (EE. UU.)', symbol: 'taza' },
    'metric-cup': { one: 'taza métrica', other: 'tazas métricas', symbol: 'taza métrica' },
    'us-legal-cup': {
      one: 'taza de etiqueta',
      other: 'tazas de etiqueta',
      symbol: 'taza de etiqueta',
    },
    'us-tablespoon': { one: 'cucharada', other: 'cucharadas', symbol: 'cda' },
    hectare: { one: 'hectárea', other: 'hectáreas' },
    'square-meter': { one: 'metro cuadrado', other: 'metros cuadrados' },
    'square-foot': { one: 'pie cuadrado', other: 'pies cuadrados' },
    'mile-per-hour': { one: 'milla por hora', other: 'millas por hora' },
    'kilometer-per-hour': { one: 'kilómetro por hora', other: 'kilómetros por hora' },
  },

  pairs: [
    /* Longitud ------------------------------------------------------------ */
    {
      category: 'length',
      slug: 'pulgadas-a-cm',
      from: 'inch',
      to: 'centimeter',
      phrase: 'pulgadas a cm',
      title: 'Pulgadas a cm: convertidor y tabla (1 in = 2.54 cm)',
      description:
        'Convierte pulgadas a centímetros al instante. 1 pulgada = 2.54 cm. Incluye tabla de 1 a 100 pulgadas, fórmula y medidas de pantallas de TV.',
      extraUnits: ['millimeter', 'foot', 'meter'],
      popular: true,
      values: {
        list: [1.5, 2.5, 3.5, 5, 5.5, 6, 7, 8, 8.5, 10, 11, 20, 24, 42],
        slug: '{n}-pulgadas-a-cm',
        phrase: '{n} pulgadas a cm',
      },
      faqs: [
        {
          question: '¿Cuál es la diferencia entre conversor y convertidor de pulgadas a cm?',
          answer:
            'Ninguna: en México se dice convertidor y en España conversor. Los dos pasan de pulgadas a centímetros multiplicando por 2.54.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'cm-a-pulgadas',
      from: 'centimeter',
      to: 'inch',
      phrase: 'cm a pulgadas',
      extraUnits: ['millimeter', 'foot', 'meter'],
    },
    {
      category: 'length',
      slug: 'pies-a-metros',
      from: 'foot',
      to: 'meter',
      phrase: 'pies a metros',
      title: 'Pies a metros: convertidor ft a m y tabla',
      description:
        'Convierte pies a metros: 1 pie = 0.3048 m. Incluye pies y pulgadas a metros para estatura y tabla de 1 a 1000 pies.',
      extraUnits: ['inch', 'centimeter'],
      table: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 100, 200, 500, 1000],
      popular: true,
      values: {
        list: [3, 5, 6, 7, 8, 10, 12, 20, 25, 30, 40, 50, 100],
        slug: '{n}-pies-a-metros',
        phrase: '{n} pies a metros',
      },
      faqs: [
        {
          question: '¿Cuánto son 5\'11" pies en metros?',
          answer:
            '5 pies y 11 pulgadas son 71 pulgadas, es decir 180.34 cm o 1.80 metros. Para estaturas, usa la calculadora de pies y pulgadas a cm.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'metros-a-pies',
      from: 'meter',
      to: 'foot',
      phrase: 'metros a pies',
      extraUnits: ['inch', 'centimeter'],
    },
    {
      category: 'length',
      slug: 'pies-a-cm',
      from: 'foot',
      to: 'centimeter',
      phrase: 'pies a cm',
      extraUnits: ['inch', 'meter'],
    },
    {
      category: 'length',
      slug: 'millas-a-km',
      from: 'mile',
      to: 'kilometer',
      phrase: 'millas a km',
      extraUnits: ['nautical-mile', 'meter'],
    },
    {
      category: 'length',
      slug: 'km-a-millas',
      from: 'kilometer',
      to: 'mile',
      phrase: 'km a millas',
      extraUnits: ['nautical-mile', 'meter'],
    },
    {
      category: 'length',
      slug: 'millas-nauticas-a-km',
      from: 'nautical-mile',
      to: 'kilometer',
      phrase: 'millas náuticas a km',
      extraUnits: ['mile'],
      notes: [
        'La milla náutica mide exactamente 1852 metros y se usa en navegación marítima y aérea. No es lo mismo que la milla terrestre, que mide 1609.344 metros.',
      ],
    },

    /* Peso ---------------------------------------------------------------- */
    {
      category: 'mass',
      slug: 'libras-a-kilos',
      from: 'pound',
      to: 'kilogram',
      phrase: 'libras a kilos',
      title: 'Libras a kilos: convertidor lb a kg con tabla',
      description:
        'Convierte libras a kilos al instante: 1 lb = 0.4536 kg. Tabla de 1 a 300 libras, fórmula y ejemplos de peso corporal.',
      extraUnits: ['ounce', 'gram'],
      table: [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 120, 150, 180, 200, 250, 300],
      popular: true,
      values: {
        list: [1, 5, 10, 15, 20, 25, 30, 35, 45, 50, 70, 100, 130],
        slug: '{n}-libras-a-kilos',
        phrase: '{n} libras a kilos',
        one: { slug: '1-libra-a-kilos', phrase: '1 libra a kilos' },
      },
      faqs: [
        {
          question: '¿Cómo convertir libras a kilos rápido?',
          answer:
            'Divide las libras entre 2.2 para un cálculo mental aproximado. Para el valor exacto, multiplica por 0.45359237: 150 libras son 68.04 kilos.',
        },
      ],
    },
    {
      category: 'mass',
      slug: 'kilos-a-libras',
      from: 'kilogram',
      to: 'pound',
      phrase: 'kilos a libras',
      extraUnits: ['ounce', 'gram'],
      faqs: [
        {
          question: '¿Cuánto es 1 kg convertido en libras?',
          answer: '1 kilo equivale a 2.20462 libras.',
        },
      ],
    },
    {
      category: 'mass',
      slug: 'onzas-a-gramos',
      from: 'ounce',
      to: 'gram',
      phrase: 'onzas a gramos',
      extraUnits: ['troy-ounce', 'pound', 'kilogram'],
      notes: [
        'Para el oro y la plata se usa la onza troy, que pesa 31.1035 gramos, no la onza común de 28.35 gramos. Elige «onza troy» en el convertidor para pasar onzas de oro a gramos.',
      ],
    },

    /* Temperatura ---------------------------------------------------------- */
    {
      category: 'temperature',
      slug: 'fahrenheit-a-celsius',
      from: 'fahrenheit',
      to: 'celsius',
      phrase: 'grados Fahrenheit a Celsius',
      title: 'Grados Fahrenheit a Celsius (centígrados)',
      description:
        'Convierte °F a °C con la fórmula (°F − 32) × 5/9. Tabla de temperaturas de horno, fiebre y clima.',
      popular: true,
      table: [
        -40, 0, 32, 50, 60, 70, 80, 90, 98.6, 100, 100.4, 102, 104, 212, 300, 350, 375, 400, 450,
      ],
      values: {
        list: [70, 100, 350],
        slug: '{n}-grados-fahrenheit-a-celsius',
        phrase: '{n} grados Fahrenheit a Celsius',
      },
      faqs: [
        {
          question: '¿Cuánto es la fiebre en Fahrenheit a Celsius?',
          answer:
            'Se considera fiebre a partir de 100.4 °F, que son 38 °C. La temperatura normal del cuerpo, 98.6 °F, equivale a 37 °C.',
        },
        {
          question: '¿Qué son los grados centígrados?',
          answer:
            'Es otro nombre de los grados Celsius. «Grados centígrados» y «grados Celsius» son la misma escala.',
        },
        {
          question: '¿A cuántos grados Celsius equivalen 350 °F en el horno?',
          answer: '350 °F son 176.7 °C; en la mayoría de las recetas se redondea a 180 °C.',
        },
      ],
    },
    {
      category: 'temperature',
      slug: 'celsius-a-fahrenheit',
      from: 'celsius',
      to: 'fahrenheit',
      phrase: 'Celsius a Fahrenheit',
      table: [-40, -20, -10, 0, 5, 10, 15, 20, 25, 30, 35, 37, 38, 40, 100, 150, 180, 200, 220],
    },

    /* Volumen ------------------------------------------------------------- */
    {
      category: 'volume',
      slug: 'galones-a-litros',
      from: 'us-gallon',
      to: 'liter',
      phrase: 'galones a litros',
      title: 'Galones a litros: convertidor gal a L',
      description:
        '1 galón estadounidense = 3.785 litros. Convierte galones a litros para gasolina, agua y pintura, con tabla y galón imperial.',
      extraUnits: ['imperial-gallon', 'milliliter'],
      popular: true,
      table: [1, 2, 3, 4, 5, 6, 10, 15, 16, 18, 19, 20, 25, 40, 50, 55, 60, 100],
      values: {
        list: [5, 6, 10, 15, 16, 18, 20, 21, 25, 40, 50, 55, 60],
        slug: '{n}-galones-a-litros',
        phrase: '{n} galones a litros',
      },
      notes: [
        'El galón de gasolina en México y Estados Unidos es el galón estadounidense (3.785 litros). El galón imperial británico es más grande: 4.546 litros.',
      ],
      faqs: [
        {
          question: '¿Cuántos litros tiene un galón de gasolina?',
          answer: 'Un galón estadounidense de gasolina tiene 3.785 litros.',
        },
      ],
    },
    {
      category: 'volume',
      slug: 'litros-a-galones',
      from: 'liter',
      to: 'us-gallon',
      phrase: 'litros a galones',
      extraUnits: ['imperial-gallon', 'milliliter'],
      faqs: [
        {
          question: '¿Cuánto es 1 litro en galones?',
          answer: '1 litro equivale a 0.264172 galones estadounidenses.',
        },
      ],
    },
    {
      category: 'volume',
      slug: 'onzas-a-ml',
      from: 'us-fluid-ounce',
      to: 'milliliter',
      phrase: 'onzas a ml',
      extraUnits: ['liter', 'us-cup'],
      table: [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 64],
    },

    /* Cocina --------------------------------------------------------------- */
    {
      category: 'cooking',
      slug: 'tazas-a-ml',
      from: 'us-cup',
      to: 'milliliter',
      phrase: 'tazas a ml',
      title: 'Tazas a ml: ¿1 taza son 240 o 250 ml?',
      description:
        'Taza de EE. UU. = 236.6 ml, taza métrica = 250 ml, taza de etiquetas = 240 ml. Incluye 1/4, 1/2 y 3/4 de taza.',
      extraUnits: ['metric-cup', 'us-legal-cup', 'us-tablespoon', 'liter'],
      table: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2, 3, 4],
      notes: [
        'Hay tres tazas distintas. La taza de las recetas de Estados Unidos mide 236.6 ml; la taza de las etiquetas nutricionales, 240 ml; y la taza métrica, 250 ml. Elige la tuya en el convertidor.',
      ],
      faqs: [
        {
          question: '¿Es 1 taza 240 o 250 ml?',
          answer:
            'Depende de la taza. La taza de recetas de EE. UU. son 236.6 ml, la de etiquetas nutricionales 240 ml y la taza métrica 250 ml.',
        },
        {
          question: '¿Cuántos ml son 1/2 taza?',
          answer: 'Media taza de EE. UU. son 118.3 ml; media taza métrica, 125 ml.',
        },
        {
          question: '¿Cuántos ml son 1/4 y 3/4 de taza?',
          answer: '1/4 de taza son 59.1 ml y 3/4 de taza son 177.4 ml (taza de EE. UU.).',
        },
      ],
    },

    /* Área ----------------------------------------------------------------- */
    {
      category: 'area',
      slug: 'hectareas-a-metros-cuadrados',
      from: 'hectare',
      to: 'square-meter',
      phrase: 'hectáreas a metros cuadrados',
      extraUnits: ['square-foot'],
      table: [0.1, 0.25, 0.5, 1, 2, 3, 5, 10, 20, 50, 100],
    },
    {
      category: 'area',
      slug: 'pies-cuadrados-a-metros-cuadrados',
      from: 'square-foot',
      to: 'square-meter',
      phrase: 'pies cuadrados a metros cuadrados',
      extraUnits: ['hectare'],
      table: [1, 10, 50, 100, 200, 500, 800, 1000, 1500, 2000, 5000],
      faqs: [
        {
          question: '¿Cómo pasar de pies a metros cuadrados?',
          answer:
            'Multiplica los pies cuadrados por 0.09290304. Por ejemplo, 1000 pies cuadrados son 92.9 metros cuadrados.',
        },
      ],
    },
    {
      category: 'area',
      slug: 'metros-cuadrados-a-pies-cuadrados',
      from: 'square-meter',
      to: 'square-foot',
      phrase: 'metros cuadrados a pies cuadrados',
      extraUnits: ['hectare'],
      table: [1, 5, 10, 20, 50, 75, 100, 150, 200, 500, 1000],
    },

    /* Velocidad ------------------------------------------------------------ */
    {
      category: 'speed',
      slug: 'millas-por-hora-a-km-por-hora',
      from: 'mile-per-hour',
      to: 'kilometer-per-hour',
      phrase: 'millas por hora a km/h',
      table: [10, 20, 25, 30, 40, 50, 55, 60, 65, 70, 75, 80, 100, 120],
      faqs: [
        {
          question: '¿Cuánto son 60 millas a km/h?',
          answer: '60 millas por hora son 96.56 km/h.',
        },
      ],
    },
  ],

  height: {
    slug: 'pies-y-pulgadas-a-cm',
    phrase: 'pies y pulgadas a cm',
    title: 'Pies y pulgadas a cm: calculadora de estatura',
    description:
      'Convierte tu estatura de pies y pulgadas a centímetros. Por ejemplo, 5\'11" = 180.3 cm.',
    h1: 'Pies y pulgadas a cm: calculadora de estatura',
    faqs: [
      {
        question: '¿Cuánto son 5\'11" en centímetros?',
        answer: '5 pies y 11 pulgadas son 180.34 cm, es decir 1.80 metros.',
      },
      {
        question: '¿Cómo pasar la estatura de pies y pulgadas a cm?',
        answer:
          'Multiplica los pies por 12 y súmales las pulgadas; luego multiplica el total por 2.54. Por ejemplo, 5\'7" son 67 pulgadas × 2.54 = 170.18 cm.',
      },
    ],
  },
};
