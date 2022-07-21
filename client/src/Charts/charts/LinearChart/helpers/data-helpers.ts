import { min, max } from 'd3';

import { DataItem, Data } from '../../../types/commonTypes';
import formatToThousands from 'helpers/formatHelpers/formatToThousands';

const midMinDot = 9;
const midMaxDot = 15;
const minDot = 8;

function setStep(minValue: number, maxValue: number, step = 4): number {
  const diff = maxValue - minValue;

  if (diff <= midMaxDot && diff >= midMinDot) {
    return 3;
  }
  if (diff <= minDot) {
    return 2;
  }
  return step;
}

export function calcTicks(minValue: number, maxValue: number, step = 4): number[] {
  const floorStep = setStep(
    step < 1 ? minValue * 100 : minValue,
    step < 1 ? maxValue * 100 : maxValue,
    step < 1 ? step * 100 : step,
  );

  if (step > 1 && maxValue - minValue < floorStep) {
    return [minValue, maxValue];
  }
  const minTick = step < 1 ? minValue * 100 : minValue;
  const maxTick = step < 1 ? maxValue * 100 : maxValue;
  const part = (maxTick - minTick) / floorStep;
  const ticks: number[] = [];
  for (let i = 0; i < floorStep - 1; i += 1) {
    const prevNumber = ticks[i - 1] || minTick;
    ticks.push(step > 1 ? Math.round(prevNumber + part) : prevNumber + part);
  }
  const finalTicks = step < 1 ? ticks.map(tick => tick / 100) : ticks;
  return [minValue, ...finalTicks, maxValue];
}

export function setScaleTicks(data: Data, columnType: string | undefined): (number | string)[] {
  const minValue = min(data, function(d) {
    return (d as DataItem).value;
  });
  const maxValue = max(data, function(d) {
    return (d as DataItem).value;
  });
  const minRounded = minValue ? Math.round(minValue) : 0;
  const maxRounded = maxValue ? Math.round(maxValue) : 0;
  const ticks = calcTicks(
    columnType === 'percent' ? minValue || 0 : minRounded,
    columnType === 'percent' ? maxValue || 0 : maxRounded,
    columnType === 'percent' ? 0.04 : 4,
  );

  if (columnType === 'percent') {
    return ticks.map(tick => `${formatToThousands(tick * 100, { fixed: 2 })}%`);
  }
  return ticks.map(tick => formatToThousands(Math.round(tick)));
}
