import type { UnitDefinition } from '@/types/units';
import { accelerationUnits } from './acceleration';
import { angleUnits } from './angle';
import { areaUnits } from './area';
import { dataTransferUnits } from './data-transfer';
import { densityUnits } from './density';
import { digitalStorageUnits } from './digital-storage';
import {
  capacitanceUnits,
  conductanceUnits,
  electricChargeUnits,
  electricCurrentUnits,
  inductanceUnits,
  resistanceUnits,
  voltageUnits,
} from './electrical';
import { energyUnits } from './energy';
import { flowRateUnits } from './flow-rate';
import { forceUnits } from './force';
import { frequencyUnits } from './frequency';
import { fuelEconomyUnits } from './fuel-economy';
import { lengthUnits } from './length';
import { massUnits } from './mass';
import {
  absorbedDoseUnits,
  equivalentDoseUnits,
  illuminanceUnits,
  luminousFluxUnits,
  luminousIntensityUnits,
  magneticFieldUnits,
  radioactivityUnits,
} from './physics';
import { powerUnits } from './power';
import { pressureUnits } from './pressure';
import { speedUnits } from './speed';
import { temperatureUnits } from './temperature';
import { timeUnits } from './time';
import { torqueUnits } from './torque';
import { volumeUnits } from './volume';

/** Every unit in the catalog, ordered by category prominence. */
export const allUnits: UnitDefinition[] = [
  ...lengthUnits,
  ...massUnits,
  ...temperatureUnits,
  ...volumeUnits,
  ...areaUnits,
  ...speedUnits,
  ...timeUnits,
  ...digitalStorageUnits,
  ...energyUnits,
  ...powerUnits,
  ...pressureUnits,
  ...dataTransferUnits,
  ...fuelEconomyUnits,
  ...angleUnits,
  ...frequencyUnits,
  ...forceUnits,
  ...torqueUnits,
  ...accelerationUnits,
  ...densityUnits,
  ...flowRateUnits,
  ...electricCurrentUnits,
  ...voltageUnits,
  ...resistanceUnits,
  ...capacitanceUnits,
  ...inductanceUnits,
  ...electricChargeUnits,
  ...conductanceUnits,
  ...magneticFieldUnits,
  ...illuminanceUnits,
  ...luminousIntensityUnits,
  ...luminousFluxUnits,
  ...radioactivityUnits,
  ...absorbedDoseUnits,
  ...equivalentDoseUnits,
];
