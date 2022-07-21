import { formatSeconds } from '../../../../../helpers/format-helper';

export function calcSum(
  data: {
    id: string;
    name: string;
    values: (number | string)[];
  }[],
  index = 0,
): number {
  return data.reduce<number>((result, item) => {
    return result + Number(item.values[index]);
  }, 0);
}

export function convertTime(metric: number): string {
  if (metric === 0) {
    return '0';
  }
  const time = formatSeconds(metric, 'withHours');
  const timeValues: Array<number | string> = Object.keys(time).reduce(
    (result: Array<string>, timeField) => {
      if (timeField !== 'days') {
        const timeValue = time[timeField] < 10 ? `0${time[timeField]}` : time[timeField];
        return [...result, timeValue];
      }
      return result;
    },
    [],
  );

  switch (true) {
    case timeValues.length === 1 && metric < 0:
      return `-00:${timeValues[0]}`;

    case timeValues.length === 1 && metric >= 0:
      return `00:${timeValues[0]}`;

    case timeValues.length > 1 && metric > 0:
      return timeValues.join(':');

    default:
      (timeValues[0] as number) *= -1;
      return timeValues.join(':');
  }
}
