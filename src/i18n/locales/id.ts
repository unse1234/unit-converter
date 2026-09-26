import { capitalize as cap } from '@/lib/text';
import type { LocaleContent } from '../types';

/**
 * Indonesian — Indonesia.
 *
 * "Berapa" questions dominate ("1 inch berapa cm" has more than 10,000
 * searches a month against about 100 for "kaki ke meter"), so single-value
 * pages use the question form and never "X ke Y". People type the English
 * "inch", "feet" and "lbs", and "pon" for pounds; they spell "celcius". The
 * everyday ons is 100 g, not the 28.35 g ounce, which every weight page makes
 * clear. Decimal comma.
 */
export const id: LocaleContent = {
  locale: 'id',

  text: {
    skipLink: 'Langsung ke konten utama',
    home: 'Beranda',
    menuOpen: 'Buka menu kategori',
    menuClose: 'Tutup menu',
    menuTitle: 'Kategori',
    languageMenu: 'Bahasa',
    otherLanguages: 'Halaman ini dalam bahasa lain',
    englishSite: 'Lebih dari 700 konversi (bahasa Inggris)',
    footerTagline:
      'Faktor konversi yang tepat, rumus yang jelas, dan tabel referensi. Gratis, tanpa daftar.',
    footerCategories: 'Kategori',
    footerLanguages: 'Bahasa',
    footerAbout: 'Tentang',
    footerPrivacy: 'Privasi',
    footerTerms: 'Ketentuan',
    footerContact: 'Kontak',

    homeTitle: 'Kalkulator konversi satuan: inch ke cm, ons ke gram, dan lainnya',
    homeDescription:
      'Konversi satuan dalam bahasa Indonesia: 1 inch berapa cm, 1 ons berapa gram, ukuran TV, kg ke lbs, feet ke meter, dan Fahrenheit ke Celsius, lengkap dengan rumus dan tabel.',
    homeH1: 'Kalkulator konversi satuan',
    homeIntro:
      'Hitung 1 inch berapa cm, 1 ons berapa gram, atau kg ke lbs dalam sekejap. Ketik angka dan hasilnya langsung muncul tanpa menekan tombol.',
    homeBullets: ['Faktor konversi yang tepat', 'Rumus dan tabel', 'Gratis, tanpa daftar'],
    popularHeading: 'Konversi paling banyak dicari',
    popularDescription: 'Konversi yang paling sering dicari di Indonesia.',
    categoriesHeading: 'Kategori',
    localUnitsHeading: 'Satuan khas Indonesia',
    localUnitsDescription:
      'Ons (100 gram) dan kuintal (100 kg), beserta bedanya dengan ounce internasional.',
    languagesHeading: 'UnitFlip dalam bahasa lain',
    languagesDescription: 'Kalkulator yang sama, dengan satuan yang dicari di setiap negara.',

    converter: {
      value: 'Nilai',
      placeholder: 'Ketik angka',
      from: 'Dari',
      to: 'Ke',
      swap: 'Tukar satuan',
      result: 'Hasil',
      copy: 'Salin',
      copied: 'Tersalin',
      copyFailed: 'Tidak bisa menyalin. Pilih angkanya lalu salin secara manual.',
      invalid: 'Itu bukan angka. Coba 10, 2,5, atau 1/2.',
      belowAbsoluteZero: 'Tidak ada suhu di bawah nol mutlak (−273,15 °C, −459,67 °F).',
      equals: '{value} {from} sama dengan {result} {to}',
      feet: 'Feet',
      inches: 'Inch',
    },

    pairH1: ({ phrase }) => `Konversi ${phrase}`,
    pairTitle: ({ phrase, relation }) => `Konversi ${phrase}: kalkulator dan tabel (${relation})`,
    pairDescription: ({ from, to, relation }) =>
      `Ubah ${from.other} ke ${to.other} dengan cepat: ${relation}. Lengkap dengan rumus, contoh, dan tabel konversi.`,
    pairLead: ({ from, to, factor, formula }) =>
      factor
        ? `1 ${from.one} sama dengan ${factor} ${to.other}. Ketik angka apa saja dan hasilnya langsung muncul.`
        : `Untuk mengubah ${from.other} ke ${to.other}, gunakan rumus ${formula}. Ketik angka apa saja dan hasilnya langsung muncul.`,
    howToHeading: ({ phrase }) => `Cara menghitung ${phrase}`,
    multiplyExplanation: ({ from, to, factor }) =>
      `Untuk mengubah ${from.other} ke ${to.other}, kalikan nilainya dengan ${factor}, karena 1 ${from.one} sama dengan ${factor} ${to.other}.`,
    divideExplanation: ({ from, to, divisor }) =>
      `Untuk mengubah ${from.other} ke ${to.other}, bagi nilainya dengan ${divisor}, karena 1 ${to.one} sama dengan tepat ${divisor} ${from.other}.`,
    affineExplanation: ({ formula }) =>
      `Kedua skala suhu ini tidak memiliki titik nol yang sama, jadi tidak cukup dikalikan: gunakan rumus ${formula}.`,
    formulaLabel: 'Rumus',
    exampleLabel: 'Contoh',
    tableHeading: ({ phrase }) => `Tabel ${phrase}`,
    tableDescription: ({ from, to }) =>
      `Nilai ${from.other} ke ${to.other} yang paling sering dicari.`,
    valuesHeading: () => 'Ukuran yang paling banyak dicari',
    valuesDescription: () => 'Setiap ukuran punya halaman sendiri dengan cara menghitungnya.',
    faqHeading: 'Pertanyaan yang sering diajukan',
    relatedHeading: 'Konversi lainnya',
    allInCategory: (category) => `Semua konversi ${category.toLowerCase()}`,
    categoryPairsHeading: (category) => `Konversi ${category.toLowerCase()}`,
    pairFaqs: ({ phrase, from, to, factor, formula, example }) => [
      {
        question: `Bagaimana cara mengubah ${phrase}?`,
        answer: `Gunakan rumus ${formula}. Contohnya, ${example.value} ${example.fromName} sama dengan ${example.result} ${example.toName}.`,
      },
      ...(factor
        ? [
            {
              question: `1 ${from.one} berapa ${to.symbol}?`,
              answer: `1 ${from.one} sama dengan ${factor} ${to.other}.`,
            },
          ]
        : []),
      {
        question: `${example.value} ${example.fromName} berapa ${to.symbol}?`,
        answer: `${example.value} ${example.fromName} sama dengan ${example.result} ${example.toName}. Cara menghitungnya: ${example.working}.`,
      },
    ],

    valueH1: ({ phrase }) => `${cap(phrase)}?`,
    valueTitle: ({ phrase, value, fromSymbol, result, toSymbol }) =>
      `${cap(phrase)}? ${value} ${fromSymbol} = ${result} ${toSymbol}`,
    valueDescription: ({ value, fromName, result, toName, from }) =>
      `${value} ${fromName} sama dengan ${result} ${toName}. Lihat cara menghitungnya dan konversi ukuran ${from.other} lainnya.`,
    valueAnswer: ({ value, fromName, result, toName }) =>
      `${value} ${fromName} sama dengan ${result} ${toName}.`,
    workingLabel: 'Cara menghitung',
    nearbyHeading: ({ from, to }) => `Konversi ${from.other} ke ${to.other} lainnya`,
    backToPair: ({ phrase }) => `Kalkulator ${phrase} dengan tabel lengkap`,
    valueFaqs: ({ value, fromName, result, toName, toSymbol, working }) => [
      {
        question: `${value} ${fromName} berapa ${toSymbol}?`,
        answer: `${value} ${fromName} sama dengan ${result} ${toName}. Cara menghitungnya: ${working}.`,
      },
    ],

    screenHeading: ({ size }) => `Ukuran layar ${size} inch`,
    screenIntro: ({ size, diagonal, width, height }) =>
      `Ukuran inch pada TV, monitor, atau laptop adalah panjang diagonal layar. Layar ${size} inch memiliki diagonal ${diagonal} cm; dengan rasio 16:9, panjangnya sekitar ${width} cm dan lebarnya ${height} cm.`,
    screenDiagonal: 'Diagonal',
    screenWidth: 'Panjang',
    screenHeight: 'Lebar',
    screenSize: 'Inch',
    screenTableHeading: 'Tabel ukuran TV dalam cm',
    screenNote:
      'Ukuran area layar 16:9 yang terlihat. Bingkai dan kaki TV menambah beberapa sentimeter.',
    tvH1: ({ size }) => `Ukuran TV ${size} inch berapa cm?`,
    tvTitle: ({ size }) => `Ukuran TV ${size} Inch Berapa Cm? Diagonal, Panjang, Lebar`,
    tvDescription: ({ size, diagonal, width, height }) =>
      `TV ${size} inch memiliki diagonal ${diagonal} cm dan layar sekitar ${width} × ${height} cm (16:9). Lihat tabel ukuran TV 24–85 inch.`,
    tvFaqs: ({ size, diagonal, width, height }) => [
      {
        question: `TV ${size} inch berapa cm?`,
        answer: `Diagonalnya ${diagonal} cm, dengan layar sekitar ${width} cm (panjang) × ${height} cm (lebar) untuk rasio 16:9.`,
      },
    ],

    heightTableHeading: 'Tabel tinggi badan dalam feet dan cm',
    heightColumn: 'Tinggi',
  },

  categories: {
    length: {
      slug: 'panjang',
      name: 'Panjang',
      title: 'Konversi satuan panjang',
      description:
        'Hitung inch ke cm, cm ke inci, feet ke meter, dan ukuran layar TV atau laptop, lengkap dengan rumus dan tabel.',
    },
    mass: {
      slug: 'berat',
      name: 'Berat',
      title: 'Konversi satuan berat',
      description:
        'Hitung ons ke gram (1 ons = 100 g), kg ke lbs, pon ke kg, dan kuintal ke kg, lengkap dengan tabel.',
    },
    temperature: {
      slug: 'suhu',
      name: 'Suhu',
      title: 'Konversi suhu',
      description:
        'Ubah Fahrenheit ke Celsius, Celsius ke Fahrenheit, dan Celsius ke Kelvin dengan rumus dan tabel.',
    },
    volume: {
      slug: 'volume',
      name: 'Volume',
      title: 'Konversi volume',
      description: 'Ubah galon ke liter dan liter ke galon, lengkap dengan rumus dan tabel.',
    },
    tv: {
      slug: 'tv',
      name: 'Ukuran TV',
      title: 'Ukuran TV dalam cm',
      description:
        'Diagonal, panjang, dan lebar layar TV 24 sampai 85 inch dalam sentimeter, untuk rasio 16:9.',
    },
    area: {
      slug: 'luas',
      name: 'Luas',
      title: 'Konversi satuan luas',
      description: 'Ubah hektar ke meter persegi dengan rumus dan tabel.',
    },
    speed: {
      slug: 'kecepatan',
      name: 'Kecepatan',
      title: 'Konversi kecepatan',
      description: 'Ubah mph ke km/jam dan km/jam ke mph dengan rumus yang tepat.',
    },
  },

  units: {
    inch: { one: 'inch', other: 'inch' },
    centimeter: { one: 'sentimeter', other: 'sentimeter' },
    millimeter: { one: 'milimeter', other: 'milimeter' },
    foot: { one: 'feet', other: 'feet' },
    meter: { one: 'meter', other: 'meter' },
    kilogram: { one: 'kilogram', other: 'kilogram' },
    gram: { one: 'gram', other: 'gram' },
    pound: { one: 'pon', other: 'pon', symbol: 'lbs' },
    'ons-id': { one: 'ons', other: 'ons' },
    ounce: { one: 'ounce internasional', other: 'ounce internasional' },
    'troy-ounce': { one: 'troy ons', other: 'troy ons' },
    kuintal: { one: 'kuintal', other: 'kuintal' },
    tonne: { one: 'ton', other: 'ton' },
    fahrenheit: { one: 'derajat Fahrenheit', other: 'derajat Fahrenheit' },
    celsius: { one: 'derajat Celsius', other: 'derajat Celsius' },
    kelvin: { one: 'kelvin', other: 'kelvin' },
    'us-gallon': { one: 'galon', other: 'galon' },
    liter: { one: 'liter', other: 'liter' },
    milliliter: { one: 'mililiter', other: 'mililiter', symbol: 'ml' },
    hectare: { one: 'hektar', other: 'hektar' },
    'square-meter': { one: 'meter persegi', other: 'meter persegi' },
    'mile-per-hour': { one: 'mil per jam', other: 'mil per jam' },
    'kilometer-per-hour': {
      one: 'kilometer per jam',
      other: 'kilometer per jam',
      symbol: 'km/jam',
    },
  },

  pairs: [
    /* Panjang -------------------------------------------------------------- */
    {
      category: 'length',
      slug: 'inch-ke-cm',
      from: 'inch',
      to: 'centimeter',
      phrase: 'inch ke cm',
      h1: '1 inch berapa cm? Konversi inch ke cm',
      title: '1 Inch Berapa Cm? Konversi Inch ke Cm (2,54 cm)',
      description:
        '1 inch sama dengan 2,54 cm. Hitung inch ke cm dengan cepat, lengkap dengan tabel 1–100 inch serta ukuran TV dan laptop.',
      extraUnits: ['millimeter', 'foot', 'meter'],
      popular: true,
      values: {
        list: [2, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32],
        slug: '{n}-inch-berapa-cm',
        phrase: '{n} inch berapa cm',
      },
      faqs: [
        {
          question: 'Laptop 14 inch berapa cm?',
          answer:
            'Layar laptop 14 inch memiliki diagonal 35,56 cm; dengan rasio 16:9 panjangnya sekitar 31 cm dan lebarnya 17,4 cm.',
        },
        {
          question: '1 inch berapa senti?',
          answer: '1 inch sama dengan 2,54 senti (sentimeter).',
        },
      ],
    },
    {
      category: 'length',
      slug: 'cm-ke-inci',
      from: 'centimeter',
      to: 'inch',
      phrase: 'cm ke inci',
      title: 'Konversi Cm ke Inci (Inch): Kalkulator dan Tabel',
      description:
        '1 cm = 0,3937 inci. Ubah cm ke inci dengan cepat, lengkap dengan tabel ukuran dan rumus.',
      extraUnits: ['millimeter', 'foot', 'meter'],
    },
    {
      category: 'length',
      slug: 'feet-ke-meter',
      from: 'foot',
      to: 'meter',
      phrase: 'feet ke meter',
      h1: '1 feet berapa meter? Konversi feet ke meter',
      title: '1 Feet Berapa Meter? 1 ft = 0,3048 m',
      description:
        '1 feet (kaki) = 0,3048 meter = 30,48 cm. Konversi feet ke meter dan cm dengan tabel 1–100 feet.',
      extraUnits: ['inch', 'centimeter'],
      popular: true,
      faqs: [
        {
          question: '1 feet berapa cm?',
          answer: '1 feet sama dengan 30,48 cm, atau 12 inch.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'meter-ke-feet',
      from: 'meter',
      to: 'foot',
      phrase: 'meter ke feet',
      extraUnits: ['inch', 'centimeter'],
      faqs: [
        {
          question: 'Berapa 1 meter dalam kaki (feet)?',
          answer: '1 meter sama dengan 3,28084 feet (kaki).',
        },
      ],
    },
    {
      category: 'length',
      slug: 'feet-ke-cm',
      from: 'foot',
      to: 'centimeter',
      phrase: 'feet ke cm',
      extraUnits: ['inch', 'meter'],
    },

    /* Berat ---------------------------------------------------------------- */
    {
      category: 'mass',
      slug: 'ons-ke-gram',
      from: 'ons-id',
      to: 'gram',
      phrase: 'ons ke gram',
      h1: '1 ons berapa gram? Konversi ons ke gram',
      title: '1 Ons Berapa Gram? 100 g (Ons Indonesia) vs 28,35 g',
      description:
        'Di Indonesia 1 ons = 100 gram. Ounce internasional = 28,35 g dan troy ons emas = 31,1 g. Lengkap dengan tabel.',
      extraUnits: ['ounce', 'troy-ounce', 'kilogram'],
      popular: true,
      table: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10],
      values: {
        list: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        slug: '{n}-ons-berapa-gram',
        phrase: '{n} ons berapa gram',
      },
      notes: [
        'Ons yang dipakai sehari-hari di Indonesia beratnya 100 gram. Ounce internasional (oz) yang tertulis di kemasan impor beratnya 28,35 gram, dan troy ons untuk emas 31,1 gram. Pilih yang Anda maksud di kalkulator.',
      ],
      faqs: [
        {
          question: 'Apakah 1 ons 100 gram?',
          answer:
            'Ya, di Indonesia 1 ons = 100 gram. Ounce internasional (oz) berbeda: 28,35 gram.',
        },
        {
          question: 'Setengah ons berapa gram?',
          answer: 'Setengah ons sama dengan 50 gram.',
        },
        {
          question: '1 troy ons berapa gram emas?',
          answer: '1 troy ons emas sama dengan 31,1035 gram.',
        },
      ],
    },
    {
      category: 'mass',
      slug: 'kg-ke-lbs',
      from: 'kilogram',
      to: 'pound',
      phrase: 'kg ke lbs',
      title: 'Konversi Kg ke Lbs (Pon): 1 kg = 2,2046 lbs',
      description:
        'Ubah kilogram ke pon (lbs) dengan cepat. 1 kg = 2,2046 lbs. Tabel berat badan 40–120 kg.',
      extraUnits: ['gram', 'ons-id'],
      popular: true,
      table: [1, 5, 10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120],
    },
    {
      category: 'mass',
      slug: 'lbs-ke-kg',
      from: 'pound',
      to: 'kilogram',
      phrase: 'lbs ke kg',
      extraUnits: ['gram', 'ons-id'],
    },
    {
      category: 'mass',
      slug: 'kuintal-ke-kg',
      from: 'kuintal',
      to: 'kilogram',
      phrase: 'kuintal ke kg',
      h1: '1 kuintal berapa kg? Konversi kuintal ke kg',
      title: '1 Kuintal Berapa Kg? 1 Kuintal = 100 Kg',
      description:
        '1 kuintal sama dengan 100 kg. Konversi kuintal ke kg, ton dan ons dengan tabel.',
      extraUnits: ['tonne', 'ons-id'],
      table: [0.5, 1, 2, 3, 5, 10, 15, 20, 50, 100],
      faqs: [
        {
          question: '1 ton berapa kuintal?',
          answer: '1 ton sama dengan 10 kuintal, atau 1.000 kg.',
        },
      ],
    },

    /* Suhu ----------------------------------------------------------------- */
    {
      category: 'temperature',
      slug: 'fahrenheit-ke-celcius',
      from: 'fahrenheit',
      to: 'celsius',
      phrase: 'Fahrenheit ke Celsius',
      popular: true,
      faqs: [
        {
          question: 'Mana yang benar, Celcius atau Celsius?',
          answer:
            'Penulisan yang benar adalah Celsius, dari nama astronom Swedia Anders Celsius. «Celcius» adalah salah ketik yang sering dipakai, tetapi maksudnya sama.',
        },
      ],
    },
    {
      category: 'temperature',
      slug: 'celcius-ke-fahrenheit',
      from: 'celsius',
      to: 'fahrenheit',
      phrase: 'Celsius ke Fahrenheit',
      table: [-40, -10, 0, 10, 20, 25, 27, 30, 32, 35, 37, 40, 100],
    },
    {
      category: 'temperature',
      slug: 'celcius-ke-kelvin',
      from: 'celsius',
      to: 'kelvin',
      phrase: 'Celsius ke Kelvin',
      table: [-273.15, -100, -40, 0, 10, 20, 25, 27, 30, 37, 50, 100],
    },

    /* Volume --------------------------------------------------------------- */
    {
      category: 'volume',
      slug: 'galon-ke-liter',
      from: 'us-gallon',
      to: 'liter',
      phrase: 'galon ke liter',
      extraUnits: ['milliliter'],
      notes: [
        'Halaman ini memakai galon Amerika (US gallon), 3,785 liter. Galon air minum isi ulang di Indonesia adalah kemasan 19 liter, bukan satuan ukur.',
      ],
    },
    {
      category: 'volume',
      slug: 'liter-ke-galon',
      from: 'liter',
      to: 'us-gallon',
      phrase: 'liter ke galon',
      extraUnits: ['milliliter'],
      table: [1, 2, 5, 10, 15, 19, 20, 25, 50, 100],
      faqs: [
        {
          question: '19 liter berapa galon?',
          answer: '19 liter sama dengan 5,02 galon Amerika (US gallon).',
        },
      ],
    },

    /* Luas ----------------------------------------------------------------- */
    {
      category: 'area',
      slug: 'hektar-ke-meter-persegi',
      from: 'hectare',
      to: 'square-meter',
      phrase: 'hektar ke meter persegi',
      table: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100],
    },

    /* Kecepatan ------------------------------------------------------------ */
    {
      category: 'speed',
      slug: 'mph-ke-km-jam',
      from: 'mile-per-hour',
      to: 'kilometer-per-hour',
      phrase: 'mph ke km/jam',
      table: [10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 200],
      faqs: [
        {
          question: '100 mph berapa km/jam?',
          answer: '100 mph sama dengan 160,93 km/jam.',
        },
      ],
    },
    {
      category: 'speed',
      slug: 'km-jam-ke-mph',
      from: 'kilometer-per-hour',
      to: 'mile-per-hour',
      phrase: 'km/jam ke mph',
      table: [10, 20, 40, 60, 80, 100, 120, 150, 200, 300],
    },
  ],

  tv: {
    sizes: [32, 43, 50],
    slug: 'ukuran-tv-{n}-inch-berapa-cm',
    phrase: 'ukuran TV {n} inch berapa cm',
  },
};
