import { capitalize as cap } from '@/lib/text';
import type { LocaleContent } from '../types';

/**
 * Portuguese — Brazilian spelling, one build that also serves Portugal.
 *
 * Connector "em" for length and weight but "para" for temperature ("fahrenheit
 * para celsius"), the verbs "converter" and "transformar", question forms
 * ("quanto é", "quantos hectares tem um alqueire") and "tamanho tv" for screen
 * sizes, all as Brazilians search. Decimal comma. Local units: alqueire by
 * state, arroba, xícara de chá.
 */
export const pt: LocaleContent = {
  locale: 'pt',

  text: {
    skipLink: 'Ir para o conteúdo principal',
    home: 'Início',
    menuOpen: 'Abrir o menu de categorias',
    menuClose: 'Fechar o menu',
    menuTitle: 'Categorias',
    languageMenu: 'Idioma',
    otherLanguages: 'Esta página em outros idiomas',
    englishSite: 'Mais de 700 conversões (em inglês)',
    footerTagline:
      'Fatores de conversão exatos, fórmulas claras e tabelas de referência. Grátis e sem cadastro.',
    footerCategories: 'Categorias',
    footerLanguages: 'Idiomas',
    footerAbout: 'Sobre',
    footerPrivacy: 'Privacidade',
    footerTerms: 'Termos',
    footerContact: 'Contato',

    homeTitle: 'Conversor de medidas grátis: polegadas em cm, libras em kg e mais',
    homeDescription:
      'Conversor de medidas em português: polegadas em cm, libras em kg, Fahrenheit para Celsius, pés em metros, tamanho de TV e alqueire em hectare, com fórmulas e tabelas.',
    homeH1: 'Conversor de medidas',
    homeIntro:
      'Converta polegadas em cm, libras em kg, Fahrenheit para Celsius e alqueire em hectare na hora. Digite um valor e o resultado aparece sem apertar nenhum botão.',
    homeBullets: ['Fatores de conversão exatos', 'Fórmulas e tabelas', 'Grátis e sem cadastro'],
    popularHeading: 'Conversões mais buscadas',
    popularDescription: 'As conversões mais procuradas no Brasil.',
    categoriesHeading: 'Categorias',
    localUnitsHeading: 'Medidas do campo e da cozinha',
    localUnitsDescription:
      'Alqueire paulista, mineiro e baiano, arroba do boi e xícara de chá em ml.',
    languagesHeading: 'O UnitFlip em outros idiomas',
    languagesDescription: 'O mesmo conversor, com as medidas que cada país procura.',

    converter: {
      value: 'Valor',
      placeholder: 'Digite um número',
      from: 'De',
      to: 'Para',
      swap: 'Inverter unidades',
      result: 'Resultado',
      copy: 'Copiar',
      copied: 'Copiado',
      copyFailed: 'Não foi possível copiar. Selecione o número e copie manualmente.',
      invalid: 'Isso não é um número. Tente 10, 2,5 ou 1/2.',
      belowAbsoluteZero:
        'Não existem temperaturas abaixo do zero absoluto (−273,15 °C, −459,67 °F).',
      equals: '{value} {from} equivalem a {result} {to}',
      feet: 'Pés',
      inches: 'Polegadas',
    },

    pairH1: ({ phrase }) => `Conversor de ${phrase}`,
    pairTitle: ({ phrase, relation }) => `${cap(phrase)}: conversor e tabela (${relation})`,
    pairDescription: ({ from, to, relation }) =>
      `Converta ${from.other} em ${to.other} na hora: ${relation}. Com fórmula, exemplos e tabela de conversão.`,
    pairLead: ({ from, to, factor, formula }) =>
      factor
        ? `1 ${from.one} equivale a ${factor} ${to.other}. Digite qualquer valor e o resultado aparece na hora.`
        : `Para converter ${from.other} em ${to.other}, use a fórmula ${formula}. Digite qualquer valor e o resultado aparece na hora.`,
    howToHeading: ({ phrase }) => `Como converter ${phrase}?`,
    multiplyExplanation: ({ from, to, factor }) =>
      `Para converter ${from.other} em ${to.other}, multiplique o valor por ${factor}, porque 1 ${from.one} equivale a ${factor} ${to.other}.`,
    divideExplanation: ({ from, to, divisor }) =>
      `Para converter ${from.other} em ${to.other}, divida o valor por ${divisor}, porque 1 ${to.one} equivale exatamente a ${divisor} ${from.other}.`,
    affineExplanation: ({ from, to, formula }) =>
      `As escalas de ${from.other} e de ${to.other} não começam no mesmo zero, então não basta multiplicar: use a fórmula ${formula}.`,
    formulaLabel: 'Fórmula',
    exampleLabel: 'Exemplo',
    tableHeading: ({ phrase }) => `Tabela de ${phrase}`,
    tableDescription: ({ from, to }) => `Os valores de ${from.other} em ${to.other} mais usados.`,
    valuesHeading: () => 'Medidas mais buscadas',
    valuesDescription: () => 'Cada medida tem sua própria página com o cálculo passo a passo.',
    faqHeading: 'Perguntas frequentes',
    relatedHeading: 'Outras conversões',
    allInCategory: (category) => `Ver todas as conversões de ${category.toLowerCase()}`,
    categoryPairsHeading: (category) => `Conversões de ${category.toLowerCase()}`,
    pairFaqs: ({ phrase, from, to, factor, formula, example }) => [
      {
        question: `Como transformar ${phrase}?`,
        answer: `Use a fórmula ${formula}. Por exemplo, ${example.value} ${example.fromName} equivalem a ${example.result} ${example.toName}.`,
      },
      ...(factor
        ? [
            {
              question: `Quanto é 1 ${from.one} em ${to.other}?`,
              answer: `1 ${from.one} equivale a ${factor} ${to.other}.`,
            },
          ]
        : []),
      {
        question: `Quanto é ${example.value} ${example.fromName} em ${to.other}?`,
        answer: `${example.value} ${example.fromName} são ${example.result} ${example.toName}. O cálculo é ${example.working}.`,
      },
    ],

    valueH1: ({ phrase }) => cap(phrase),
    valueTitle: ({ phrase, value, fromSymbol, result, toSymbol }) =>
      `${cap(phrase)}: ${value} ${fromSymbol} = ${result} ${toSymbol}`,
    valueDescription: ({ value, fromName, result, toName, from }) =>
      `${value} ${fromName} ${value === '1' ? 'equivale' : 'equivalem'} a ${result} ${toName}. Veja o cálculo e converta outras medidas em ${from.other}.`,
    valueAnswer: ({ value, fromName, result, toName }) =>
      `${value} ${fromName} ${value === '1' ? 'equivale' : 'equivalem'} a ${result} ${toName}.`,
    workingLabel: 'Cálculo',
    nearbyHeading: ({ from, to }) => `Outras medidas de ${from.other} em ${to.other}`,
    backToPair: ({ phrase }) => `Conversor de ${phrase} com a tabela completa`,
    valueFaqs: ({ value, fromName, result, toName, to, working }) => [
      {
        question: `Quanto é ${value} ${fromName} em ${to.other}?`,
        answer: `${value} ${fromName} são ${result} ${toName}. O cálculo é ${working}.`,
      },
    ],

    screenHeading: ({ size }) => `Medidas de uma tela de ${size} polegadas`,
    screenIntro: ({ size, diagonal, width, height }) =>
      `As polegadas de uma TV ou monitor medem a diagonal da tela. Uma tela de ${size} polegadas tem ${diagonal} cm de diagonal; no formato 16:9, mede cerca de ${width} cm de largura e ${height} cm de altura.`,
    screenDiagonal: 'Diagonal',
    screenWidth: 'Largura',
    screenHeight: 'Altura',
    screenSize: 'Polegadas',
    screenTableHeading: 'Tamanho de TV em cm',
    screenNote:
      'Medidas da área visível de uma tela 16:9. A moldura e o suporte acrescentam alguns centímetros.',
    tvH1: ({ size }) => `Tamanho TV ${size} polegadas em cm`,
    tvTitle: ({ size }) => `TV ${size} polegadas em cm: largura, altura e diagonal`,
    tvDescription: ({ size, diagonal, width, height }) =>
      `Uma TV de ${size} polegadas tem ${diagonal} cm de diagonal e tela de cerca de ${width} × ${height} cm (16:9). Tabela de 24 a 85 polegadas.`,
    tvFaqs: ({ size, diagonal, width, height }) => [
      {
        question: `Qual o tamanho de uma TV de ${size} polegadas em cm?`,
        answer: `Tem ${diagonal} cm de diagonal, com tela de cerca de ${width} cm de largura e ${height} cm de altura (formato 16:9).`,
      },
      {
        question: `Quantos cm de largura tem uma TV de ${size} polegadas?`,
        answer: `A tela tem cerca de ${width} cm de largura. Some alguns centímetros de moldura para saber o espaço que a TV ocupa no rack ou na parede.`,
      },
    ],

    heightTableHeading: 'Tabela de altura em pés e centímetros',
    heightColumn: 'Altura',
  },

  categories: {
    length: {
      slug: 'comprimento',
      name: 'Comprimento',
      title: 'Conversor de comprimento',
      description:
        'Converta polegadas em cm, pés em metros, milhas em km e outras medidas de comprimento, com fórmulas exatas e tabelas.',
    },
    mass: {
      slug: 'peso',
      name: 'Peso',
      title: 'Conversor de peso',
      description:
        'Converta libras em kg, kg em libras e arroba em kg na hora, com fórmulas e tabelas de peso.',
    },
    temperature: {
      slug: 'temperatura',
      name: 'Temperatura',
      title: 'Conversor de temperatura',
      description:
        'Converta Fahrenheit para Celsius, Celsius para Fahrenheit e Celsius para Kelvin, com a fórmula e uma tabela.',
    },
    volume: {
      slug: 'volume',
      name: 'Volume',
      title: 'Conversor de volume',
      description: 'Converta galões em litros, com o galão americano e o imperial.',
    },
    tv: {
      slug: 'tv',
      name: 'Tamanho de TV',
      title: 'Tamanho de TV em cm',
      description:
        'Largura, altura e diagonal em centímetros de TVs de 24 a 85 polegadas, no formato 16:9.',
    },
    area: {
      slug: 'area',
      name: 'Área',
      title: 'Conversor de área',
      description:
        'Converta alqueire em hectare e metros quadrados (paulista, mineiro e baiano) e hectares em m².',
    },
    speed: {
      slug: 'velocidade',
      name: 'Velocidade',
      title: 'Conversor de velocidade',
      description: 'Converta milhas por hora em km/h com a fórmula exata e uma tabela.',
    },
    cooking: {
      slug: 'cozinha',
      name: 'Cozinha',
      title: 'Conversor de medidas de cozinha',
      description:
        'Converta xícara de chá em ml para suas receitas, com a xícara americana e a métrica.',
    },
  },

  units: {
    inch: { one: 'polegada', other: 'polegadas', symbol: 'pol' },
    centimeter: { one: 'centímetro', other: 'centímetros' },
    millimeter: { one: 'milímetro', other: 'milímetros' },
    foot: { one: 'pé', other: 'pés' },
    meter: { one: 'metro', other: 'metros' },
    kilometer: { one: 'quilômetro', other: 'quilômetros' },
    mile: { one: 'milha', other: 'milhas' },
    pound: { one: 'libra', other: 'libras' },
    kilogram: { one: 'quilo', other: 'quilos' },
    gram: { one: 'grama', other: 'gramas' },
    ounce: { one: 'onça', other: 'onças' },
    'arroba-br': { one: 'arroba', other: 'arrobas' },
    fahrenheit: { one: 'grau Fahrenheit', other: 'graus Fahrenheit' },
    celsius: { one: 'grau Celsius', other: 'graus Celsius' },
    kelvin: { one: 'kelvin', other: 'kelvins' },
    'us-gallon': { one: 'galão americano', other: 'galões americanos' },
    'imperial-gallon': { one: 'galão imperial', other: 'galões imperiais' },
    liter: { one: 'litro', other: 'litros' },
    milliliter: { one: 'mililitro', other: 'mililitros', symbol: 'ml' },
    'us-legal-cup': { one: 'xícara de chá', other: 'xícaras de chá', symbol: 'xíc.' },
    'us-cup': { one: 'xícara americana', other: 'xícaras americanas', symbol: 'cup' },
    'metric-cup': { one: 'xícara métrica', other: 'xícaras métricas', symbol: 'xíc. métrica' },
    'us-tablespoon': { one: 'colher de sopa', other: 'colheres de sopa', symbol: 'c. sopa' },
    hectare: { one: 'hectare', other: 'hectares' },
    'square-meter': { one: 'metro quadrado', other: 'metros quadrados' },
    'alqueire-paulista': { one: 'alqueire paulista', other: 'alqueires paulistas' },
    'alqueire-mineiro': { one: 'alqueire mineiro', other: 'alqueires mineiros' },
    'alqueire-baiano': { one: 'alqueire baiano', other: 'alqueires baianos' },
    'mile-per-hour': { one: 'milha por hora', other: 'milhas por hora' },
    'kilometer-per-hour': { one: 'quilômetro por hora', other: 'quilômetros por hora' },
  },

  pairs: [
    /* Comprimento ---------------------------------------------------------- */
    {
      category: 'length',
      slug: 'polegadas-em-cm',
      from: 'inch',
      to: 'centimeter',
      phrase: 'polegadas em cm',
      title: 'Polegadas em cm: conversor e tabela (1 pol = 2,54 cm)',
      description:
        'Converta polegadas em centímetros na hora. 1 polegada = 2,54 cm. Tabela de 1 a 100 polegadas, fórmula e tamanhos de TV.',
      extraUnits: ['millimeter', 'foot', 'meter'],
      popular: true,
      values: {
        list: [2, 3, 4, 5, 6, 7, 8, 9, 10, 24, 32, 55],
        slug: '{n}-polegadas-em-cm',
        phrase: '{n} polegadas em cm',
      },
      faqs: [
        {
          question: 'Quanto é 3/4 de polegada em cm?',
          answer:
            '3/4 de polegada são 1,905 cm (19,05 mm), a medida de canos e conexões de 3/4". Meia polegada (1/2") são 1,27 cm.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'cm-em-polegadas',
      from: 'centimeter',
      to: 'inch',
      phrase: 'cm em polegadas',
      extraUnits: ['millimeter', 'foot', 'meter'],
    },
    {
      category: 'length',
      slug: 'pes-em-metros',
      from: 'foot',
      to: 'meter',
      phrase: 'pés em metros',
      title: 'Pés em metros: conversor ft para m',
      description:
        '1 pé = 0,3048 m. Converta pés em metros, incluindo altitudes de avião como 10 mil pés (3.048 m).',
      extraUnits: ['inch', 'centimeter'],
      popular: true,
      table: [1, 2, 3, 5, 6, 8, 10, 20, 30, 50, 100, 500, 1000, 5000, 10000, 30000, 35000, 40000],
      values: {
        list: [3, 5, 6, 8, 10, 12, 18, 20, 30, 40, 50, 60, 100, 10000],
        slug: '{n}-pes-em-metros',
        phrase: '{n} pés em metros',
      },
      faqs: [
        {
          question: 'Quanto é 10 mil pés em metros?',
          answer:
            '10 mil pés são 3.048 metros. Aviões comerciais voam entre 30 mil e 40 mil pés, ou seja, entre 9.144 e 12.192 metros.',
        },
      ],
    },
    {
      category: 'length',
      slug: 'metros-em-pes',
      from: 'meter',
      to: 'foot',
      phrase: 'metros em pés',
      extraUnits: ['inch', 'centimeter'],
    },
    {
      category: 'length',
      slug: 'polegadas-em-mm',
      from: 'inch',
      to: 'millimeter',
      phrase: 'polegadas em mm',
      extraUnits: ['centimeter'],
      table: [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4],
      notes: [
        'Canos, conexões e parafusos são medidos em frações de polegada: 1/2" = 12,7 mm, 3/4" = 19,05 mm e 1" = 25,4 mm.',
      ],
    },
    {
      category: 'length',
      slug: 'milhas-em-km',
      from: 'mile',
      to: 'kilometer',
      phrase: 'milhas em km',
      extraUnits: ['meter'],
    },
    {
      category: 'length',
      slug: 'km-em-milhas',
      from: 'kilometer',
      to: 'mile',
      phrase: 'km em milhas',
      extraUnits: ['meter'],
    },

    /* Peso ----------------------------------------------------------------- */
    {
      category: 'mass',
      slug: 'libras-em-kg',
      from: 'pound',
      to: 'kilogram',
      phrase: 'libras em kg',
      title: 'Libras em kg: conversor lb para kg com tabela',
      description:
        '1 libra = 0,4536 kg. Converta libras em quilos na hora, com tabela de 1 a 500 libras e fórmula.',
      extraUnits: ['gram', 'ounce'],
      popular: true,
      table: [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 150, 200, 250, 300, 400, 500],
      values: {
        list: [10, 15, 20, 25, 30, 35, 40, 45, 50, 70, 85, 95, 100, 110, 150, 200, 500],
        slug: '{n}-libras-em-kg',
        phrase: '{n} libras em kg',
      },
    },
    {
      category: 'mass',
      slug: 'kg-em-libras',
      from: 'kilogram',
      to: 'pound',
      phrase: 'kg em libras',
      extraUnits: ['gram', 'ounce'],
    },
    {
      category: 'mass',
      slug: 'arroba-em-kg',
      from: 'arroba-br',
      to: 'kilogram',
      phrase: 'arroba em kg',
      title: 'Arroba em kg: quanto pesa 1 arroba de boi',
      description:
        'Quantos quilos tem 1 arroba? Converta arrobas em kg para boi, carne e cacau, com tabela.',
      table: [1, 2, 5, 10, 15, 16, 18, 20, 21, 22, 25, 30, 50, 100],
      notes: [
        'No Brasil, 1 arroba equivale a 15 kg. No mercado do boi gordo, a arroba é calculada sobre o peso da carcaça (o animal abatido), não sobre o peso vivo. A arroba portuguesa antiga tinha cerca de 14,7 kg.',
      ],
      faqs: [
        {
          question: '1 arroba é quantos kg?',
          answer: '1 arroba equivale a 15 quilos.',
        },
        {
          question: '1 arroba de boi é quantos quilos?',
          answer:
            '15 quilos de carcaça. Um boi com 20 arrobas de carcaça tem 300 kg de carcaça; o peso vivo é maior.',
        },
      ],
    },

    /* Temperatura ---------------------------------------------------------- */
    {
      category: 'temperature',
      slug: 'fahrenheit-para-celsius',
      from: 'fahrenheit',
      to: 'celsius',
      phrase: 'Fahrenheit para Celsius',
      title: 'Fahrenheit para Celsius: conversor °F em °C',
      description:
        'Converta Fahrenheit para Celsius com a fórmula (°F − 32) × 5/9. Tabela de 0 a 500 °F.',
      popular: true,
      table: [
        0, 32, 50, 60, 61, 70, 72, 75, 80, 90, 98.6, 100, 150, 200, 212, 300, 350, 400, 450, 500,
      ],
      values: {
        list: [61, 72, 75, 80],
        slug: '{n}-fahrenheit-para-celsius',
        phrase: '{n} Fahrenheit para Celsius',
      },
      faqs: [
        {
          question: 'Qual é a fórmula de Fahrenheit para Celsius?',
          answer:
            'Subtraia 32 e multiplique por 5/9: °C = (°F − 32) × 5/9. Por exemplo, 72 °F são 22,2 °C.',
        },
      ],
    },
    {
      category: 'temperature',
      slug: 'celsius-para-fahrenheit',
      from: 'celsius',
      to: 'fahrenheit',
      phrase: 'Celsius para Fahrenheit',
      table: [-40, -10, 0, 10, 16, 18, 20, 22, 24, 25, 30, 35, 37, 40, 100, 180, 200],
    },
    {
      category: 'temperature',
      slug: 'celsius-para-kelvin',
      from: 'celsius',
      to: 'kelvin',
      phrase: 'Celsius para Kelvin',
      table: [-273.15, -100, -40, 0, 10, 20, 25, 30, 37, 50, 100, 500, 1000],
    },

    /* Volume --------------------------------------------------------------- */
    {
      category: 'volume',
      slug: 'galoes-em-litros',
      from: 'us-gallon',
      to: 'liter',
      phrase: 'galões em litros',
      extraUnits: ['imperial-gallon', 'milliliter'],
      faqs: [
        {
          question: '1 galão americano tem quantos litros?',
          answer:
            '1 galão americano tem 3,785 litros. O galão imperial, usado no Reino Unido, tem 4,546 litros.',
        },
      ],
    },

    /* Cozinha -------------------------------------------------------------- */
    {
      category: 'cooking',
      slug: 'xicara-em-ml',
      from: 'us-legal-cup',
      to: 'milliliter',
      phrase: 'xícara em ml',
      title: 'Xícara em ml: quanto é 1 xícara de chá',
      description:
        '1 xícara de chá = 240 ml. Converta xícaras em ml, incluindo 1/2 e 3/4 de xícara, com a xícara americana e a métrica.',
      extraUnits: ['us-cup', 'metric-cup', 'us-tablespoon', 'liter'],
      table: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2, 3, 4],
      notes: [
        'Nas receitas brasileiras, 1 xícara de chá equivale a 240 ml. Receitas americanas usam a xícara de 236,6 ml, e as australianas a xícara métrica de 250 ml. Escolha a sua no conversor.',
      ],
      faqs: [
        {
          question: '1 xícara de chá é quantos ml?',
          answer: '1 xícara de chá tem 240 ml.',
        },
        {
          question: 'Quanto é 3/4 de xícara em ml?',
          answer: '3/4 de xícara de chá são 180 ml; meia xícara (1/2) são 120 ml.',
        },
      ],
    },

    /* Área ----------------------------------------------------------------- */
    {
      category: 'area',
      slug: 'alqueire-em-hectare',
      from: 'alqueire-paulista',
      to: 'hectare',
      phrase: 'alqueire em hectare',
      title: 'Alqueire em hectare e m²: paulista, mineiro e baiano',
      description:
        'Alqueire paulista = 2,42 ha, mineiro = 4,84 ha, baiano = 9,68 ha. Converta por estado para hectares e metros quadrados.',
      extraUnits: ['alqueire-mineiro', 'alqueire-baiano', 'square-meter'],
      popular: true,
      table: [0.5, 1, 2, 3, 4, 5, 10, 15, 20, 50, 100],
      notes: [
        'O alqueire muda de tamanho conforme a região. Alqueire paulista (São Paulo, Paraná e Sul): 24.200 m² = 2,42 ha. Alqueire mineiro (Minas Gerais, Rio de Janeiro e Goiás): 48.400 m² = 4,84 ha. Alqueire baiano: 96.800 m² = 9,68 ha. Escolha o seu no conversor e confirme a medida usada na escritura do imóvel.',
      ],
      faqs: [
        {
          question: 'Quantos hectares tem um alqueire?',
          answer:
            'Depende da região: o alqueire paulista tem 2,42 hectares, o mineiro 4,84 hectares e o baiano 9,68 hectares.',
        },
        {
          question: 'Quantos metros quadrados tem um alqueire?',
          answer:
            'Um alqueire paulista tem 24.200 m², um alqueire mineiro 48.400 m² e um alqueire baiano 96.800 m².',
        },
        {
          question: 'Quanto mede um alqueire de terra?',
          answer:
            'O alqueire paulista equivale a um quadrado de cerca de 155,6 m de lado (24.200 m²); o mineiro, a um quadrado de 220 m de lado (48.400 m²).',
        },
        {
          question: 'Como converter hectare para alqueire?',
          answer:
            'Divida os hectares por 2,42 para o alqueire paulista ou por 4,84 para o mineiro. Por exemplo, 10 hectares são 4,13 alqueires paulistas.',
        },
      ],
    },
    {
      category: 'area',
      slug: 'hectares-em-metros-quadrados',
      from: 'hectare',
      to: 'square-meter',
      phrase: 'hectares em metros quadrados',
      extraUnits: ['alqueire-paulista', 'alqueire-mineiro'],
      table: [0.1, 0.25, 0.5, 1, 2, 2.42, 4.84, 5, 10, 20, 50, 100],
    },

    /* Velocidade ----------------------------------------------------------- */
    {
      category: 'speed',
      slug: 'milhas-por-hora-em-km-h',
      from: 'mile-per-hour',
      to: 'kilometer-per-hour',
      phrase: 'milhas por hora em km/h',
      table: [10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 200],
      faqs: [
        {
          question: 'Quanto é 120 milhas em km/h?',
          answer: '120 milhas por hora são 193,1 km/h.',
        },
      ],
    },
  ],

  tv: {
    sizes: [32, 43, 50, 55, 65, 75],
    slug: 'tamanho-tv-{n}-polegadas-em-cm',
    phrase: 'tamanho TV {n} polegadas em cm',
  },
};
