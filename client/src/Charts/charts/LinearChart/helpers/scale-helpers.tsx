import React from 'react';
import {
  timeParse,
  scaleTime,
  extent,
  axisBottom,
  axisLeft,
  axisRight,
  scaleLinear,
  scaleBand,
  min,
  max,
  line,
  curveMonotoneX,
  select,
  area,
} from 'd3';
import moment from 'moment';

import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { AxisScale } from 'd3-axis';
import { Data, DataItem, Period, ChartType } from '../../../types/commonTypes';
import { ChartData } from '../types';
import { CHART_TYPES } from 'consts';

import {
  ADDITIONAL_COLORS,
  MAIN_COLORS,
  FILL_COLORS,
  ANTIFRAUD_MAIN_COLORS,
  ANTIFRAUD_ADDITIONAL_COLORS,
  TRENDS_FILL_COLORS,
  MONTHS,
  EVENT_COLORS,
} from '../../../helpers/consts';
import { formatXTick, setColor, setTime } from '../../../helpers/helpers';
import formatToThousands from 'helpers/formatHelpers/formatToThousands';
import { calcTicks } from './data-helpers';
import { SYSTEM_FORMAT } from 'helpers/date-helper';

const TICK_WIDTH = {
  hour: 24,
  day: 36,
  week: 85,
  month: 60,
};
const TICK_MIN_OFFSET = 16;

export function appendEvent(
  group: d3Selection.Selection<SVGGElement, any, any, any>,
  index: number,
  numOfEvents: number | string,
  onHoverEvent: Function,
  cn: Function,
  date: string,
  color: string,
  setEventParams: Function,
  tickId?: string,
  addTranslateY?: boolean,
  firstRenderHideOpacity?: boolean,
): void {
  const tick = tickId
    ? group.select(`#xTick_${tickId}`)
    : group.select(`.tick:nth-child(${index})`);
  const translateY = addTranslateY ? 10 : 0;

  tick
    .append('g')
    .attr('class', cn('Event'))
    .attr('transform', () => {
      return `translate(0, ${translateY})`;
    })
    .attr('opacity', () => {
      const opacity = firstRenderHideOpacity ? 0 : 1;
      return opacity;
    })
    .attr('id', date)
    .on('mouseenter', function() {
      onHoverEvent(true, tick.node(), date, true, setEventParams);
    })
    .on('mouseleave', function() {
      onHoverEvent(true, tick.node(), date, false, setEventParams);
    })
    .call(g => {
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 55)
        .attr('fill', color)
        .attr('r', '16px');
    })
    .call(g => {
      g.append('text')
        .style('color', '#ffffff')
        .style('font-size', '16px')
        .attr('fill', 'currentColor')
        .attr('y', 50)
        .text(numOfEvents);
    });
}

function appendArea(
  svg: d3Selection.Selection<SVGGElement, any, any, any>,
  data: Data,
  fillColor: string,
  className: string,
  id: string,
): void {
  svg
    .append('path')
    .datum(data)
    .attr('id', id)
    .attr('class', className)
    .attr('fill', fillColor)
    .attr('stroke', 'none')
    .attr('stroke-width', 0)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('clip-path', 'url(#clip)');
}

function calcTickNumber(width: number, numOfTicks: number, periodType: Period): number {
  const tickWidth = TICK_WIDTH[periodType] + TICK_MIN_OFFSET;
  const fitNumber = Math.round(width / tickWidth);
  if (numOfTicks < fitNumber) {
    return 0;
  }
  return Math.round(numOfTicks / fitNumber);
}

function setNextValueForPeriods(item: DataItem | undefined, periodType: Period): string {
  if (!item || !item.initialDate || (item.initialDate && !item.initialDate.length)) {
    return '';
  }

  switch (periodType) {
    default:
    case 'day':
      return moment(item.initialDate, SYSTEM_FORMAT).format('DD.MM');
    case 'week': {
      const date = moment(item.initialDate, SYSTEM_FORMAT).format('DD.MM');
      const nextDate = moment(date, 'DD.MM')
        .add(6, 'day')
        .format('DD.MM');
      return `${date} - ${nextDate}`;
    }
    case 'month': {
      const date = moment(item.initialDate, SYSTEM_FORMAT).format('M');
      return MONTHS[Number(date) - 1];
    }
  }
}

/**
 * Создание вертикальной шкалы
 */
export function createYScale(
  data: Data,
  height: number,
  countFromZero?: boolean,
  maxMetricValue?: number,
  minMetricValue?: number,
): { minY: number; maxY: number; y: d3Scale.ScaleLinear<number, number> } {
  // минимальная точка графика
  let minY = minMetricValue || min(data, d => (d as DataItem).value) || 0;
  // максимальная точка графика
  const maxY = maxMetricValue || max(data, d => (d as DataItem).value) || 0;

  if (minY === maxY || countFromZero) {
    minY = 0;
  }

  const y = scaleLinear()
    .domain([minY, maxY])
    .range([height, 0]);

  return { minY, maxY, y };
}

/**
 * Создание горизонтальной шкалы.
 * Все шкалы, кроме дневных, приводим к скалярным величинам, чтобы правильно
 * размещались тики на графике (от 0 до конца)
 */
export function createXScale(
  data: Data,
  width: number,
  periodType: Period,
  chartType: ChartType,
): AxisScale<number | Date | { valueOf(): number | string }> {
  if (chartType === CHART_TYPES.BAR_CHART || chartType === CHART_TYPES.STACKED_CHART) {
    return scaleBand()
      .domain(data.map((d: DataItem) => d.date!.toString()))
      .range([0, width]) as AxisScale<any>;
  }
  let x;
  switch (periodType) {
    default:
      x = scaleBand()
        .domain(data.map((d: DataItem) => d.date!.toString()))
        .range([0, width]);
      break;
    case 'hour':
      x = scaleLinear()
        .domain(extent(data, (d: DataItem) => Number(d.date)) as [number, number])
        .range([0, width]);
      break;
    case 'day':
      x = scaleTime()
        .domain(extent(data, (d: DataItem) => d.date as number) as [number, number])
        .range([0, width]);
      break;
    case 'month':
    case 'week':
      x = scaleLinear()
        .domain([0, data.length - 1])
        .range([0, width]);
      break;
    case 'dayOfWeek':
      x = scaleLinear()
        .domain([1, 7])
        .range([0, width]);
      break;
  }
  return x;
}

/**
 * Прикрепление вертикальной шкалы к svg
 */
export function appendYScale({
  data,
  svg,
  width,
  height,
  cn,
  styleTicks,
  index,
  divOnScale,
  ticksValues,
  chartType,
  columnType,
  unit,
  countFromZero,
  isDashboard,
  maxMetricValue,
  minMetricValue,
}: {
  data: Data;
  svg:
    | d3Selection.Selection<d3Selection.BaseType, unknown, HTMLElement, any>
    | d3Selection.Selection<SVGGElement, unknown, null, undefined>;
  width: number;
  height: number;
  cn: Function;
  divOnScale?: number;
  styleTicks: boolean;
  index: number;
  countFromZero?: boolean;
  ticksValues?: (string | number)[];
  chartType: ChartType;
  columnType?: string;
  unit?: string;
  isDashboard?: boolean;
  maxMetricValue?: number;
  minMetricValue?: number;
}): void {
  if (!svg) {
    return;
  }

  // шкала
  const { y, minY, maxY } = createYScale(
    data,
    height,
    countFromZero,
    maxMetricValue,
    minMetricValue,
  );

  // слева или справа располагать решается в завимости от индекса
  const axisFunc = index === 0 ? axisLeft : axisRight;
  // если это обновление, то надо сделать select, а не append
  const axis = styleTicks
    ? (svg as any).append('g').attr('class', `${cn('YAxisLabel')} YAxisLabel-${index}`)
    : (svg as any).select(`.YAxisLabel-${index}`);
  const transformWidth = isDashboard ? width + 8 : width;

  const ticks = calcTicks(minY, maxY, columnType === 'percent' ? 0.04 : divOnScale || 4);

  // прикрепляем шкалу к svg
  axis
    .call(
      axisFunc(y)
        // добавляем шаг (tick), всего точек на шкале должно быть 5, поэтому промежуточные между max и min надо рассчитать
        .tickValues(ticks)
        // преобразуем данные в красивый формат
        .tickFormat((d, tickIndex) => {
          if (!d && typeof d !== 'number') {
            return null;
          }
          if (columnType === 'time') {
            return setTime(d as number);
          }
          if (chartType === 'trend') {
            return `${((d as number) * 100).toFixed(2)}%`;
          }
          if (columnType === 'currency' || columnType === 'sum') {
            return `${formatToThousands(Math.round(d as number))} ${unit || 'р'}`;
          }
          if (ticksValues) {
            return ticksValues[tickIndex];
          }
          if (columnType === 'percent') {
            return `${formatToThousands((d as number) * 100, { fixed: 2 })}%`;
          }
          const number = Math.round(d as number);
          return formatToThousands(number) as any;
        })
        // рисуем линии от tick по всей ширине графика (получаются направляющие)
        .tickSize(data.length > 0 ? -width : 0),
    )
    // смещаем шкалу, если она должна быть справа
    .attr('transform', () => {
      if (maxY === 0) {
        return `translate(${index === 0 ? 0 : width},${height / 2})`;
      }
      return `translate(${index === 0 ? 0 : transformWidth},0)`;
    })
    // стилизуем направляющие
    .call(g => g.select('.domain').remove())
    .call(g =>
      g
        .selectAll('.tick:not(:first-of-type) line')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '4,2')
        .attr('stroke', '#D4D4D4'),
    )
    .call(g =>
      g.selectAll(`.YAxisLabel-${index} .tick:first-of-type line`).attr('stroke', '#D4D4D4'),
    );
  // Если это вторая шкала, модифицируем направляющие
  if (index === 1) {
    if (!isDashboard) {
      (svg as d3Selection.Selection<SVGGElement, unknown, null, undefined>)
        .selectAll(`.YAxisLabel-${index} .tick text`)
        .attr('class', cn('RightTick'));
    }
    (svg as d3Selection.Selection<SVGGElement, unknown, null, undefined>)
      .selectAll(`.YAxisLabel-${index} .tick line`)
      .attr('class', cn('RightTickLine'))
      .attr('x2', '7')
      .attr('visibility', isDashboard ? 'hidden' : 'visible')
      .attr('stroke-dasharray', '');
  }
}

/**
 * Обновление вертикальной шкалы
 */
export function updateYScale({
  data,
  svg,
  width,
  height,
  cn,
  index,
  ticksValues,
  chartType,
  columnType,
  isDashboard,
}: {
  data: Data;
  svg: d3Selection.Selection<d3Selection.BaseType, unknown, HTMLElement, any>;
  width: number;
  height: number;
  cn: Function;
  index: number;
  chartType: ChartType;
  ticksValues?: (string | number)[];
  columnType?: string;
  isDashboard?: boolean;
}): void {
  appendYScale({
    data,
    svg,
    width,
    height,
    cn,
    index,
    ticksValues,
    styleTicks: false,
    chartType,
    columnType,
    isDashboard,
  });
}

/**
 * Прикрепление горизонтальной шкалы к svg
 */
export function appendXScale({
  data,
  allData,
  svg,
  width,
  height,
  cn,
  periodType,
  chartType,
  events,
  isPeriodComparison,
  isDashboard,
  onHoverEvent,
  onHoverTooltip,
  setParams,
  setEventParams,
  onlyOneYear,
  isHiddenIntermediatePoints = true,
  firstRenderHideOpacity = false,
}: {
  data: Data;
  allData?: ChartData;
  svg: d3Selection.Selection<SVGGElement, any, any, any>;
  width: number;
  height: number;
  cn: Function;
  periodType: Period;
  chartType: ChartType;
  events: {
    date: string;
    eventList: {
      id: number;
      name: string;
      color: string;
    }[];
  }[];
  isPeriodComparison?: boolean;
  isDashboard?: boolean;
  onHoverEvent: Function;
  onHoverTooltip?: Function;
  setParams: Function;
  onlyOneYear?: boolean;
  setEventParams: Function;
  isHiddenIntermediatePoints?: boolean;
  firstRenderHideOpacity?: boolean;
}): void {
  if (!svg) {
    return;
  }

  const chartData =
    periodType === 'day'
      ? data.map(item => ({
          ...item,
          date: timeParse('%Y-%m-%d')(item.date as string),
        }))
      : data;

  const ticks =
    chartType !== CHART_TYPES.BAR_CHART &&
    (periodType === 'week' || periodType === 'month') &&
    chartType !== CHART_TYPES.STACKED_CHART
      ? chartData.map((item, index) => index)
      : chartData.map(d => d.date);

  // шкала Х
  const x = createXScale(chartData, width, periodType, chartType);

  // прикрепляем шкалу к svg
  svg
    .append('g')
    .attr('class', cn('XAxisLabel', `XAxisLabel--${periodType}`))
    .attr('transform', `translate(0,${height})`)
    .call(
      axisBottom(x as any)
        // добавляем шаг (tick), всего точек на шкале должно быть столько, сколько данных, но если не влазит, надо пересчитать
        .tickValues(ticks as any)
        // преобразуем данные в красивый формат
        .tickFormat(
          d =>
            formatXTick(
              d as any,
              periodType,
              chartData,
              chartType === CHART_TYPES.STACKED_CHART,
              ticks,
            ) as any,
        )
        .tickSize(-height),
    )
    // добавляем события
    .call(g => {
      if (!isDashboard && !isPeriodComparison) {
        events.forEach(event => {
          const { date, eventList } = event;
          const eventIndex = data.findIndex(item => item.date === date);

          if (eventIndex !== -1) {
            const eventText =
              eventList.length === 1 ? eventList[0].name.substr(0, 1) : eventList.length;
            const rand = Math.floor(Math.random() * EVENT_COLORS.length);
            const color =
              eventList.length === 1 ? `#${eventList[0].color}` : `#${EVENT_COLORS[rand]}`;
            const addTranslateY = chartType === CHART_TYPES.STACKED_CHART && !onlyOneYear;
            appendEvent(
              g,
              eventIndex + 2,
              eventText,
              onHoverEvent,
              cn,
              date,
              color,
              setEventParams,
              undefined,
              addTranslateY,
              firstRenderHideOpacity,
            );
          }
        });
      }
    })
    // добавляем id к ticks
    .call(function(g) {
      g.selectAll('.tick').call(function(tick) {
        tick.attr('id', function(d, i) {
          return `xTick_${data[i].date!.toString()}`;
        });
      });
    })
    // добавляем тултипы
    .call(function(g) {
      if (onHoverTooltip) {
        g.selectAll('.tick').call(function(tick) {
          tick
            .append('rect')
            .attr('class', cn('Rectangle'))
            .attr('width', '24px')
            .attr('height', height)
            .attr('transform', `translate(-12,${-height})`)
            .on('mouseenter', function(e) {
              onHoverTooltip(true, true, e, select((this as Element).parentNode as any), setParams);
            })
            .on('mouseleave', function(e) {
              onHoverTooltip(
                true,
                false,
                e,
                select((this as Element).parentNode as any),
                setParams,
              );
            });
        });
      }
    })
    // стилизуем направляющие
    .call(g => g.select('.domain').remove());

  // Если periodType === hour, нужно преобразовать ticks
  if (periodType === 'hour' || isPeriodComparison) {
    const ticksSelection: d3Selection.Selection<SVGGElement, any, any, any> = svg.selectAll(
      `.${cn('XAxisLabel')} .tick`,
    );
    const filteredData = allData
      ? allData[0].data.filter(({ date, initialDate }) => date !== initialDate)
      : null;

    ticksSelection.each(function(tickValue, index) {
      if (periodType === 'hour') {
        const value: any = (tickValue as string).length === 1 ? `0${tickValue}` : tickValue;
        select(this)
          .select('text')
          .text(value);
      }
      let nextValue = Number(tickValue) + 1 === 24 ? '00' : Number(tickValue) + 1;
      if (isPeriodComparison && periodType !== 'hour' && filteredData) {
        nextValue = setNextValueForPeriods(filteredData[index], periodType);
      }

      if (nextValue.toString().length) {
        select(this)
          .append('text')
          .text(nextValue.toString().length === 1 ? `0${nextValue}` : nextValue)
          .attr('y', 22)
          .attr('dy', '0.71em')
          .attr('fill', 'currentColor');
      }
    });
  }

  // Если какие-то ticks не влазят на шкалу, добавляем им класс
  if (isHiddenIntermediatePoints) {
    const everyTick = calcTickNumber(width, ticks.length, periodType);
    if (everyTick > 0) {
      const ticksSelection: d3Selection.Selection<SVGGElement, any, any, any> = svg.selectAll(
        `.${cn('XAxisLabel')} .tick`,
      );
      ticksSelection.each(function(tickValue, index) {
        if (index % everyTick !== 0) {
          select(this).attr('class', 'tick tick--hidden');
          select(this)
            .select('text')
            .style('transform', `translate(0px,${-height - 22}px)`);
        }
      });
    }
  }
}

/**
 * Создаем линию графика
 */
export function createLine({
  data,
  allData,
  trendData,
  svg,
  width,
  height,
  index,
  isFirstRender,
  isMain,
  cn,
  isHidden,
  periodType,
  chartType,
  setIndex,
  onHoverTooltip,
  setParams,
  isAntifraud,
  isForecast,
  isDashed,
}: {
  data: Data;
  allData: Data;
  trendData: { key: string; values: Data; isMain: boolean }[] | undefined;
  svg: d3Selection.Selection<SVGGElement, any, any, any>;
  width: number;
  height: number;
  index: number;
  isFirstRender: boolean;
  isMain: boolean;
  cn: Function;
  isHidden: boolean;
  periodType: Period;
  chartType: ChartType;
  setIndex: number;
  onHoverTooltip: Function;
  setParams: Function;
  isAntifraud: boolean;
  isForecast: boolean;
  isDashed?: boolean;
}): void {
  if (!svg) {
    return;
  }

  let clipRect;

  let colors = isMain ? MAIN_COLORS : ADDITIONAL_COLORS;
  if (isAntifraud) {
    colors = isMain ? ANTIFRAUD_MAIN_COLORS : ANTIFRAUD_ADDITIONAL_COLORS;
  }

  const { y, maxY } = createYScale(allData, height);
  const x = createXScale(data, width, periodType, chartType);
  const color = colors[index] || setColor(index);

  const chartLine = (svg as any)
    .append('path')
    .datum(data)
    .attr(
      'class',
      `${cn('ChartLine', { 'ChartLine--hidden': isHidden })} metric-${data[0].id} set-${setIndex}`,
    )
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', chartType === 'trend' && !isMain ? 0 : 3)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('clip-path', 'url(#clip)')
    .attr('stroke-dasharray', isDashed ? '4.5' : '')
    .attr(
      'd',
      line()
        .defined(function(d) {
          return (
            ((d as unknown) as DataItem).value !== null &&
            ((d as unknown) as DataItem).value !== undefined
          );
        })
        .x(d => {
          // @ts-ignore
          return x(d.date) as number;
        })
        .y(d => {
          if (maxY === 0) {
            return height;
          }
          const yValue = y(((d as unknown) as DataItem).value!);
          return yValue === undefined ? height : yValue;
        })
        .curve(curveMonotoneX),
    );

  if (chartType === 'area' || (chartType === 'trend' && trendData)) {
    if (chartType === 'area') {
      appendArea(
        svg,
        data,
        FILL_COLORS[index],
        `${cn('ChartLineArea')} metric-${data[0].id} set-${setIndex}`,
        `area-${index}`,
      );

      svg.select(`#area-${index}`).attr(
        'd',
        area()
          .x(d => {
            // @ts-ignore
            return x(d.date)! as number;
          })
          .y0(
            y((min(allData, item => ((item as unknown) as DataItem).value) as unknown) as number)!,
          )
          .y1(d => y(((d as unknown) as DataItem).value!)!)
          .curve(curveMonotoneX),
      );
    } else {
      const sumData = [...allData, ...trendData![0].values, ...trendData![1].values];
      const { y: yArea, minY: minYArea, maxY: maxYArea } = createYScale(sumData, height);

      trendData!.forEach((trend, trendIndex) => {
        appendArea(
          svg,
          trend.values,
          TRENDS_FILL_COLORS[trendIndex],
          `${cn('TrendArea')}`,
          `area-${trendIndex}`,
        );

        svg.select(`#area-${trendIndex}`).attr(
          'd',
          area()
            .x(d => {
              // @ts-ignore
              return x(d.date) as number;
            })
            .y0(yArea(minYArea)!)
            .y1(d => {
              if (trendIndex === 0) {
                return yArea(maxYArea)!;
              }
              return y(((d as unknown) as DataItem).value!)!;
            })
            .curve(curveMonotoneX),
        );
      });
      svg.select('#area-1').raise();
    }
    const clipPath = svg.append('clipPath').attr('id', 'clip');
    clipRect = clipPath
      .append('rect')
      .attr('height', height)
      .attr('width', isFirstRender ? 0 : width);
  }

  // Градиент для кружка тултипа в графике трендов
  if (chartType === 'trend' && trendData) {
    const linearGradient = (svg as any)
      .append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors[0]);

    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors[1]);
  }

  // кружок для тултипа
  (svg as any)
    .append('g')
    .attr(
      'class',
      `${cn('TooltipCircle', 'TooltipCircle--hidden')} metric-${data[0].id} set-${setIndex}`,
    )
    .call(g => {
      g.append('circle')
        .attr(
          'fill',
          chartType === 'trend' && !isMain && index === 1 ? 'url(#linear-gradient)' : colors[index],
        )
        // Для трендов один из кружков закрашен градиентом, а в тултипе кружок однородного цвета, поэтому добавлен этот атрибут
        .attr('circleColor', chartType === 'trend' && !isMain && index === 1 ? colors[index] : '')
        .attr('r', chartType === 'trend' && !isMain && index === 0 ? '0' : '8px')
        .on('mouseenter', function() {
          onHoverTooltip(false, true, '', null, setParams);
        })
        .on('mouseleave', function() {
          onHoverTooltip(false, false, '', null, setParams);
        });
    })
    .call(g => {
      g.append('circle')
        .attr('fill', '#ffffff')
        .attr('r', chartType === 'trend' && !isMain && index === 0 ? '0' : '4px')
        .on('mouseenter', function() {
          onHoverTooltip(false, true, '', null, setParams);
        })
        .on('mouseleave', function() {
          onHoverTooltip(false, false, '', null, setParams);
        });
    });

  // Если это первый рендер, графики должны быть анимированными
  if (isFirstRender && !isForecast) {
    if (chartType === 'linear') {
      const totalLength = chartLine.node().getTotalLength();

      chartLine
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0);
    } else if (clipRect) {
      clipRect
        .transition()
        .duration(2000)
        .attr('width', width);
    }
  }
}

/**
 * Обновление линии
 */
export function updateLine({
  lineNode,
  data,
  allData,
  width,
  height,
  periodType,
  chartType,
  wasHidden,
  isDashed,
}: {
  lineNode: d3Selection.Selection<d3Selection.BaseType, any, any, any>;
  data: any;
  allData: any;
  width: number;
  height: number;
  periodType: Period;
  chartType: ChartType;
  wasHidden: boolean;
  isDashed?: boolean;
}): void {
  if (!lineNode) {
    return;
  }
  const x = createXScale(data, width, periodType, chartType);
  const { y, maxY } = createYScale(allData, height);

  lineNode
    .attr('stroke-dasharray', isDashed ? '4.5' : '')
    .transition()
    .duration(wasHidden ? 0 : 750)
    .attr(
      'd',
      line()
        .defined(function(d) {
          return (
            ((d as unknown) as DataItem).value !== null &&
            ((d as unknown) as DataItem).value !== undefined
          );
        })
        .x(d => {
          // @ts-ignore
          return x(d.date) as number;
        })
        .y(d => {
          if (maxY === 0) {
            return height;
          }
          const yValue = y(((d as unknown) as DataItem).value!);
          return yValue === undefined ? height : yValue;
        })
        .curve(curveMonotoneX),
    );
}
