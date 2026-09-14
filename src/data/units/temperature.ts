import { defineUnits } from '../define';

/**
 * Temperature. Base unit: kelvin (SI).
 *
 * These are affine, not linear: each unit has both a scale factor and a zero
 * offset, so a plain ratio conversion would be wrong. The engine converts
 * through kelvin as `base = value * factor + offset`, and rejects any input
 * that lands below absolute zero (see domain-rules).
 */
export const temperatureUnits = defineUnits('temperature', 'kelvin', [
  {
    id: 'celsius',
    name: 'degree Celsius',
    plural: 'degrees Celsius',
    titleName: 'Celsius',
    symbol: '°C',
    aliases: ['celsius', 'centigrade', 'c', '°c', 'deg c', 'degrees c'],
    system: 'si',
    factor: 1,
    offset: 273.15,
    slug: 'celsius',
    seo: 'primary',
    description:
      'Water freezes at 0 °C and boils at 100 °C at standard atmospheric pressure. The everyday scale in most of the world.',
  },
  {
    id: 'fahrenheit',
    name: 'degree Fahrenheit',
    plural: 'degrees Fahrenheit',
    titleName: 'Fahrenheit',
    symbol: '°F',
    aliases: ['fahrenheit', 'f', '°f', 'deg f', 'degrees f', 'farenheit'],
    system: 'us',
    factor: 5 / 9,
    offset: (459.67 * 5) / 9,
    slug: 'fahrenheit',
    seo: 'primary',
    description:
      'Water freezes at 32 °F and boils at 212 °F at standard atmospheric pressure. The everyday scale in the United States.',
  },
  {
    id: 'kelvin',
    name: 'kelvin',
    titleName: 'Kelvin',
    symbol: 'K',
    aliases: ['kelvins', 'k', 'degrees kelvin'],
    system: 'si',
    factor: 1,
    offset: 0,
    slug: 'kelvin',
    seo: 'primary',
    description:
      'The SI base unit of thermodynamic temperature. Its zero is absolute zero, so kelvin values are never negative.',
    note: 'Written without a degree sign: 300 K, not 300 °K.',
    source: 'BIPM SI Brochure (9th ed.)',
  },
  {
    id: 'rankine',
    name: 'degree Rankine',
    plural: 'degrees Rankine',
    titleName: 'Rankine',
    symbol: '°R',
    aliases: ['rankine', 'r', '°r', 'deg r'],
    system: 'us',
    factor: 5 / 9,
    offset: 0,
    slug: 'rankine',
    description:
      'An absolute scale that uses Fahrenheit-sized degrees. Zero Rankine is absolute zero.',
  },
  {
    id: 'reaumur',
    name: 'degree Réaumur',
    plural: 'degrees Réaumur',
    titleName: 'Réaumur',
    symbol: '°Ré',
    aliases: ['reaumur', 'réaumur', 're', '°re', 'degrees reaumur'],
    system: 'other',
    factor: 1.25,
    offset: 273.15,
    slug: 'reaumur',
    description:
      'A historical scale where water freezes at 0 °Ré and boils at 80 °Ré. Still occasionally seen in cheese and syrup making.',
  },
]);
