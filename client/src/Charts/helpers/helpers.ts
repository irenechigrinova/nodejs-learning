import moment from 'moment';
import { timeParse } from 'd3';
import { uniqBy } from 'lodash';

import { SYSTEM_FORMAT } from 'helpers/date-helper';

import { ChartType, Data } from '../types/commonTypes';
import { ADDITIONAL_COLORS, MAIN_COLORS, DAYS, MONTHS } from './consts';
import { hexToRgb } from 'helpers/color-helper';
import { formatSeconds } from 'helpers/format-helper';

/**
 * Преобразование данных для горизонтальной шкалы
 */
export function setDate(
  date: string | number,
  chartType: string | null,
  data: Data,
): string | number | Date | null {
  switch (chartType) {
    default:
    case 'dayOfWeek':
      return date;
    case 'day':
      return timeParse('%Y-%m-%d')(String(date));
    case 'month':
    case 'week': {
      const dates = uniqBy(data, 'date');
      return dates.findIndex(item => item.date === date);
    }
  }
}

export function getWeeksAndYears(
  currentTick: string,
): {
  weekNumber: number;
  numberMonth: number;
  yearNumber: string;
} {
  return {
    weekNumber: moment(currentTick as string, SYSTEM_FORMAT).week(),
    numberMonth: moment(currentTick as string, SYSTEM_FORMAT).month(),
    yearNumber: moment(currentTick as string, SYSTEM_FORMAT)
      .add(7, 'day')
      .format('YYYY'),
  };
}

export function getMonth(
  currentTick: string,
  formatYear = 'YYYY',
): {
  monthWithYear: string;
  month: string;
} {
  const momentDates = moment(currentTick as string, SYSTEM_FORMAT)
    .format(`MMM ${formatYear}`)
    .split(' ');
  const month = momentDates[0].slice(0, 3);

  return {
    monthWithYear: `${month} ${momentDates[1]}`,
    month,
  };
}

/**
 * Форматирование тиков для горизонтальной шкалы.
 * В зависимости от типа графика - разный формат
 */
export function formatXTick(
  tick: string | number,
  chartType: string | null,
  data: Data,
  isCohort?: boolean,
  ticks?: Array<any>,
): string | number {
  switch (chartType) {
    default:
      return tick;
    case 'hour':
      return '';
    case 'day':
      return moment(tick).format('DD.MM');
    case 'week': {
      const currentTick = typeof tick === 'number' ? data[tick].date : tick;
      const date = moment(currentTick as string, SYSTEM_FORMAT).format('DD.MM');
      const nextDate = moment(date, 'DD.MM')
        .add(6, 'day')
        .format('DD.MM');

      if (isCohort) {
        const { weekNumber } = getWeeksAndYears(currentTick as string);
        return `${weekNumber}`;
      }
      return `${date} - ${nextDate}`;
    }
    case 'month': {
      const currentTick = typeof tick === 'number' ? data[tick].date : tick;
      const date = moment(currentTick as string, SYSTEM_FORMAT).format('M');
      if (isCohort) {
        const { month } = getMonth(currentTick as string);
        return month;
      }
      return MONTHS[Number(date) - 1];
    }
    case 'dayOfWeek': {
      return DAYS[Number(tick) - 1];
    }
  }
}

export function setInitialDate(
  data: Data,
  value: string | Date | number,
  chartType: string | null,
): string {
  switch (chartType) {
    default:
    case 'day':
      return moment(
        value,
        typeof value === 'string' && value.indexOf('.') !== -1 ? 'DD.MM' : SYSTEM_FORMAT,
      ).format(SYSTEM_FORMAT);
    case 'hour':
    case 'dayOfWeek':
      return value as string;
    case 'month':
    case 'week': {
      const dates = uniqBy(data, 'date');
      return dates.find((item, index) => index === value || item.date === value)!.date as string;
    }
  }
}

export function setColor(index): string {
  const currentIndex = Math.abs(MAIN_COLORS.length - index) - 1;
  if (currentIndex > 5 && currentIndex <= 10) {
    const newIndex = Math.abs(MAIN_COLORS.length - currentIndex) - 1;
    const rgb = MAIN_COLORS[newIndex] ? hexToRgb(MAIN_COLORS[newIndex]) : hexToRgb(MAIN_COLORS[0]);
    return `rgba(${(rgb || []).join(',')},.6)`;
  }
  if (currentIndex > 10 && currentIndex <= 15) {
    const newIndex = Number(currentIndex.toString()[1]);
    const rgb = ADDITIONAL_COLORS[newIndex]
      ? hexToRgb(ADDITIONAL_COLORS[newIndex])
      : hexToRgb(ADDITIONAL_COLORS[0]);
    return `rgba(${(rgb || []).join(',')},.${newIndex === 0 ? 4 : newIndex * 4})`;
  }
  if (currentIndex > 15) {
    const newIndex = Math.floor(Math.random() * 6);
    const rgb = ADDITIONAL_COLORS[newIndex]
      ? hexToRgb(ADDITIONAL_COLORS[newIndex])
      : hexToRgb(ADDITIONAL_COLORS[0]);
    return `rgba(${(rgb || []).join(',')},.${newIndex === 0 ? 4 : newIndex * 4})`;
  }
  return ADDITIONAL_COLORS[currentIndex];
}

export function setTime(value: number): string | number {
  if (value === 0) {
    return 0;
  }
  const time = formatSeconds(value, 'withHours');
  const timeValues: Array<number | string> = Object.keys(time).reduce(
    (result: Array<string>, timeField) => {
      if (time[timeField] !== 0 || timeField === 'seconds') {
        const timeValue = time[timeField] < 10 ? `0${time[timeField]}` : time[timeField];
        result.push(timeValue);
      }
      return result;
    },
    [],
  );

  switch (true) {
    case timeValues.length === 1 && value < 0:
      return `-00:${timeValues[0]}`;

    case timeValues.length === 1 && value >= 0:
      return `00:${timeValues[0]}`;

    case timeValues.length > 1 && value > 0:
      return timeValues.join(':');

    default:
      (timeValues[0] as number) *= -1;
      return timeValues.join(':');
  }
}

export function setDefaultDisabledMetrics(
  metrics: { name: string; id: string; secondId: string | null }[],
  chartType: ChartType,
): string[] {
  if (chartType === 'area' || chartType === 'trend') {
    return [];
  }
  if (metrics.length === 5) {
    if (metrics[metrics.length - 1].secondId) {
      return [
        metrics[metrics.length - 1].id,
        metrics[metrics.length - 2].id,
        metrics[metrics.length - 1].secondId!,
        metrics[metrics.length - 2].secondId!,
      ];
    }
    return [metrics[metrics.length - 1].id, metrics[metrics.length - 2].id];
  }
  if (metrics.length > 1 && metrics[metrics.length - 1].name === 'Итого') {
    if (metrics[metrics.length - 1].secondId) {
      return [metrics[metrics.length - 1].id, metrics[metrics.length - 1].secondId!];
    }
    return [metrics[metrics.length - 1].id];
  }
  return [];
}
