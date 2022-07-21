import React, { useRef, useEffect, useCallback, useState } from 'react';
import classnames from 'classnames/bind';
import { max, select, selectAll } from 'd3';
import { intersection, uniqBy, orderBy, isEqual } from 'lodash';
import moment from 'moment';

// ======================================================
// Helpers and utils
// ======================================================
import useResize from '../../hooks/useResize';
import usePrevious from 'hooks/usePrevious';

import {
  MARGINS,
  CHART_HEIGHT,
  HEIGHT,
  TOOLTIP_ROW_HEIGHT,
  TOOLTIP_MIN_HEIGHT,
  EVENT_COLORS,
} from '../../helpers/consts';

import {
  appendXScale,
  appendYScale,
  updateYScale,
  createLine,
  updateLine,
  createXScale,
  createYScale,
  appendEvent,
} from './helpers/scale-helpers';
import { setInitialDate } from '../../helpers/helpers';
import { setScaleTicks } from './helpers/data-helpers';

import withData from './hocs/withData';
import withEventsData from 'containers/D3Charts/charts/hocs/withEventsData';
import { SYSTEM_FORMAT } from 'helpers/date-helper';
import { setCorrectTitle } from 'helpers/string-helpers';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Loading, Button, Icon } from '@calltouch/ct-ui-kit';
import Legend from './components/Legend/Legend';
import Tooltip from '../../components/Tooltip/Tooltip';

import styles from './LinearChart.module.scss';

// ======================================================
// Types
// ======================================================
import * as d3Selection from 'd3-selection';

import {
  LinearChartProps,
  ChartPropsWithEventType,
  LegendData,
  DataType,
  ChartTooltip,
} from './types';
import {
  Event as EventType,
  Period,
  ChartType,
  TooltipContent,
  DataItem,
  LinearChartData,
} from '../../types/commonTypes';

// ======================================================
// Static
// ======================================================
import { PAGES } from 'consts';

const cn: Function = classnames.bind(styles);

const addEventIcon = <Icon name="CalendarIcon" viewBox="0 0 24 24" color="#ffffff" />;

const EVENT_TITLES = ['событие', 'события', 'событий'];
export const EVENT_TOOLTIP_STYLES = {
  bottom: 35,
  top: 'auto',
  left: 'auto',
  right: 'auto',
};
const FIRST_TOOLTIP_STYLES = {
  bottom: 240,
  top: 'auto',
  left: 'auto',
  right: 'auto',
};
const SECOND_TOOLTIP_STYLES = {
  bottom: 'auto',
  top: 269,
  left: 'auto',
  right: 'auto',
};

const FIRST_TOOLTIP_NO_LEGEND_STYLES = {
  bottom: 240,
  top: 'auto',
  left: 'auto',
  right: 'auto',
};
const SECOND_TOOLTIP_NO_LEGEND_STYLES = {
  bottom: 'auto',
  top: 177,
  left: 'auto',
  right: 'auto',
};

function setSubtrahend(isDashboard: boolean, chartDataLength): number {
  if (!isDashboard) {
    return 90;
  }
  return chartDataLength === 1 ? 105 : 130;
}

// CLASSES
const ChartLine = cn('ChartLine');
const ChartLineSaturated = cn('ChartLine--saturated');
const ChartLineHidden = cn('ChartLine--hidden');
const Svg = cn('Svg');
const RightTickLine = cn('RightTickLine');
const RightTickLineHidden = cn('RightTickLine--hidden');
const Rectangle = cn('Rectangle');
const RectangleHovered = cn('Rectangle--hovered');
const LineVisible = cn('LineVisible');
const TextVisible = cn('TextVisible');
const TooltipCircle = cn('TooltipCircle');
const TooltipCircleHidden = cn('TooltipCircle--hidden');
const XAxisLabel = cn('XAxisLabel');
const YAxisLabel = cn('YAxisLabel');
const RotatedLeft = cn('RotatedLeft');
const RotatedRight = cn('RotatedRight');

// FUNCTIONS

function highlightSelectedMetric(
  metricId: string | null,
  node: d3Selection.Selection<HTMLDivElement, any, any, any>,
): void {
  if (metricId) {
    node.selectAll(`.${ChartLine}:not(.metric-${metricId})`).classed(ChartLineSaturated, true);
  } else {
    node.selectAll(`.${ChartLine}`).classed(ChartLineSaturated, false);
  }
}

function mapLegend(
  data: LegendData,
  columnIndex: number,
  metricId: string,
): { legendIds: string[]; groupIndex: number } {
  const isMetricMain = data.columns[columnIndex].metrics.find(metric => metric.id === metricId)!
    .isMain;
  const legendIds = data.columns.reduce<string[]>((result, column) => {
    const metric = column.metrics.find(({ isMain }) => isMain === isMetricMain);
    return [...result, metric!.id];
  }, []);
  return {
    legendIds,
    groupIndex: isMetricMain ? 0 : 1,
  };
}

function setMargin(period: Period): number {
  switch (period) {
    default:
    case 'day':
      return 40;
    case 'week':
      return 60;
    case 'month':
      return 80;
  }
}

export function calcEventLeft(
  node: HTMLElement,
  chartWrapper: HTMLElement,
  period: Period,
  isCohort?: boolean,
): number {
  const nodeLeft = node.getBoundingClientRect().left;
  const chartLeft = chartWrapper.getBoundingClientRect().left;
  const chartRight = chartLeft + chartWrapper.getBoundingClientRect().width;
  const margin = isCohort ? 60 : setMargin(period);
  return chartRight - nodeLeft < 280 ? nodeLeft - chartLeft - 270 : nodeLeft - chartLeft + margin;
}

export function generateEventTooltipContent(
  events: EventType[] | null,
  date: string,
): TooltipContent {
  if (!events) {
    return { titleLeft: '', rows: [] };
  }
  const { eventList } = events.find(event => event.date === date)!;
  return {
    titleLeft: moment(date, SYSTEM_FORMAT).format('DD.MM'),
    titleRight: `${eventList.length} ${setCorrectTitle(eventList.length, EVENT_TITLES)}`,
    rows: eventList.map(event => ({
      id: event.id,
      color: `#${event.color}`,
      title: event.name,
    })),
  };
}

function setTooltipBottom(
  numOfRows: number | undefined,
  chartHeight: number,
  hasLegend: boolean,
  isDashboard: boolean,
  isSingle: boolean,
): number {
  if (isDashboard) {
    return 10;
  }
  if (!isSingle || !numOfRows) {
    return hasLegend ? FIRST_TOOLTIP_STYLES.bottom : FIRST_TOOLTIP_NO_LEGEND_STYLES.bottom;
  }
  const tooltipHeight = numOfRows * TOOLTIP_ROW_HEIGHT + TOOLTIP_MIN_HEIGHT;
  return chartHeight / 2 - tooltipHeight / 2 + 50;
}

function manageTooltips(
  chart: d3Selection.Selection<HTMLDivElement, any, any, any>,
  chartData: DataType,
  width: number,
  chartHeight: number,
  periodType: Period,
  chartType: ChartType,
  xValue: number | string | Date,
  tooltipLeft: number | null,
  isDashboard: boolean,
  reducerId?: string,
): { tooltips: TooltipContent[]; left: number } {
  const selector = isDashboard ? `.${Svg}-${reducerId}` : `.${Svg}`;
  const svg = chart.select(selector);

  let left = 0;
  let maxYScale = 0;
  const data: { group1: any[]; group2: any } = {
    group1: [],
    group2: [],
  };

  for (let i = 0; i < chartData.initialData.length; i += 1) {
    const currentSetCommonData = chartData.filteredData[i].data;
    const { maxMetricValue, minMetricValue } = chartData.filteredData[i];
    const groupedData = chartData.groupedData[i].group;

    const { y, maxY } = createYScale(
      currentSetCommonData,
      chartHeight,
      false,
      maxMetricValue,
      minMetricValue,
    );
    maxYScale = maxY > maxYScale ? maxY : maxYScale;

    // eslint-disable-next-line no-loop-func
    groupedData.forEach(group => {
      const circle = svg.select(`.${TooltipCircle}.metric-${group.key}`);
      const x = createXScale(group.values, width, periodType, chartType);
      left = x(xValue as any)!;
      const { value, date } = group.values.find(
        item => item.date!.toString() === xValue.toString(),
      )!;
      const initialItem = chartData.initialData[i].data.find(
        dataItem =>
          dataItem.date === setInitialDate(chartData.initialData[i].data, date!, periodType) &&
          dataItem.id === group.key,
      )!;

      if (maxY > 0) {
        const yValue = y(value!);
        circle.attr(
          'transform',
          `translate(${tooltipLeft || x(date as any)},${
            yValue || yValue === 0 ? yValue : chartHeight
          })`,
        );
        circle.classed(TooltipCircleHidden, false);
      }

      if (initialItem.value !== null) {
        const item = {
          name: initialItem.metricName,
          value: initialItem.value,
          mappedValue:
            i === 0
              ? initialItem.value
              : chartData.mappedData[i].data.find(
                  dataItem => dataItem.date === date && dataItem.id === group.key,
                )!.value,
          date: initialItem.date,
          color: circle.select('circle').attr('fill'),
          circleColor: circle.select('circle').attr('circleColor'),
        };
        if (group.isMain) {
          if (!data.group1.some(({ name }) => name === item.name)) {
            data.group1.push(item);
          }
        } else if (!data.group2.some(({ name }) => name === item.name)) {
          data.group2.push(item);
        }
      }
    });
  }

  return {
    tooltips:
      maxYScale > 0
        ? Object.keys(data).reduce<TooltipContent[]>((result, key, index) => {
            if (data[key].length > 0) {
              const rows = data[key].map((item, rowIndex) => {
                let title = item.name;
                if (chartType === 'trend' && index === 1) {
                  title = rowIndex === 0 ? 'Доля сессий с ПК' : 'Доля сессий с мобильных';
                }
                return {
                  id: item.color,
                  color: item.color,
                  circleColor: item.circleColor,
                  title,
                  value: item.value,
                  mappedValue: item.mappedValue,
                };
              });
              let titleLeft =
                chartData.initialData[index].columnType === 'percent'
                  ? `${chartData.initialData[index].columnName}, %`
                  : chartData.initialData[index].columnName;
              if (chartType === 'trend') {
                if (index === 0) {
                  titleLeft = 'Конверсия';
                } else {
                  titleLeft = 'Сессии';
                }
              }
              const content = {
                titleLeft,
                rows: orderBy(rows, ['mappedValue'], ['desc']),
              };
              return [...result, content];
            }
            return result;
          }, [])
        : [],
    left,
  };
}

function setGroups(group: any, forecastPeriodStart: string): any[] {
  const mainPeriod = group.values.map(item => {
    if (moment(item.date as Date).isAfter(moment(forecastPeriodStart, SYSTEM_FORMAT))) {
      return {
        ...item,
        value: null,
      };
    }
    return item;
  });
  const forecastPeriod = group.values.map(item => {
    if (moment(item.date as Date).isBefore(moment(forecastPeriodStart, SYSTEM_FORMAT))) {
      return {
        ...item,
        value: null,
      };
    }
    return item;
  });
  return [
    { key: group.key, isMain: true, values: mainPeriod },
    { key: group.key, isMain: true, values: forecastPeriod },
  ];
}

function setEventOptions(
  eventList: {
    id: number;
    name: string;
    color: string;
  }[],
): { text: string | number; color: string } {
  const rand = Math.floor(Math.random() * EVENT_COLORS.length);
  return {
    text: eventList.length === 1 ? eventList[0].name.substr(0, 1) : eventList.length,
    color: eventList.length === 1 ? `#${eventList[0].color}` : `#${EVENT_COLORS[rand]}`,
  };
}

export function updateEvents(
  events: EventType[],
  container: d3Selection.Selection<HTMLDivElement, any, any, any>,
  period: Period,
  onHoverEvent: Function,
  setEventParams: Function,
  cnOwn: Function,
): void {
  container
    .selectAll(`.${cnOwn('XAxisLabel')} .tick`)
    .nodes()
    .forEach(function(tick) {
      const tickEvents = (tick as SVGGElement).querySelector(`.${cnOwn('Event')}`);
      const date = (tick as SVGGElement).getAttribute('id')!.split('_')[1];
      const dateEvents = events.find(event => event.date === date);

      if (!tickEvents && dateEvents && dateEvents.eventList.length > 0) {
        const { text, color } = setEventOptions(dateEvents.eventList);
        appendEvent(
          select(`.${cnOwn('XAxisLabel')}`),
          0,
          text,
          onHoverEvent,
          cnOwn,
          date,
          color,
          setEventParams,
          date,
        );
      }
      if (tickEvents && (!dateEvents || (dateEvents && dateEvents.eventList.length === 0))) {
        tickEvents.remove();
      }
      if (tickEvents && dateEvents && dateEvents.eventList.length > 0) {
        const currentText = Number(
          (select(tickEvents)
            .select('text')
            .node()! as SVGTextElement).innerHTML,
        );
        if (
          (isNaN(currentText) && dateEvents.eventList.length > 1) ||
          (!isNaN(currentText) && dateEvents.eventList.length === 1)
        ) {
          const { color } = setEventOptions(dateEvents.eventList);
          select(tickEvents)
            .select('circle')
            .attr('fill', color);
        }
        const { text } = setEventOptions(dateEvents.eventList);
        select(tickEvents)
          .select('text')
          .text(text);
      }
    });
}

function checkData(data: DataType, currentPeriod: Period): boolean {
  if (!data.initialData[0].data || !data.initialData[0].data[0]) {
    return true;
  }
  if (
    currentPeriod === 'hour' &&
    (data.initialData[0].data[0].date! as string).indexOf('-') !== -1
  ) {
    return false;
  }
  if (
    (currentPeriod === 'day' || currentPeriod === 'week') &&
    (data.initialData[0].data[0].date! as string).indexOf('-') === -1
  ) {
    return false;
  }
  return true;
}

// ======================================================
// Component
// ======================================================
const LinearChart: React.FunctionComponent<LinearChartProps & ChartPropsWithEventType> = (
  props: LinearChartProps & ChartPropsWithEventType,
) => {
  const chartRef = useRef<HTMLDivElement>();
  const chartWrapperRef = useRef<HTMLDivElement>();

  const tooltipTimer = useRef<number>();
  const prevTooltipParams = useRef<ChartTooltip>(props.tooltipParams);

  const [isDashboard] = useState<boolean>(
    props.pageId === PAGES.DASHBOARD_SETTINGS_EDIT ||
      props.pageId === PAGES.DASHBOARD_REPORT ||
      props.pageId === PAGES.DASHBOARD_SETTINGS_ADD ||
      document.location.href.indexOf('dashboard') !== -1,
  );
  const [isResizing] = useResize();

  const prevDisabledMetrics: undefined | string[] = usePrevious(props.disabledMetrics.metrics);
  const prevSetId: undefined | string | null = usePrevious(props.disabledMetrics.lastSetId);
  const prevIsResizing = usePrevious<boolean>(isResizing);
  const prevEvents = usePrevious(props.events);

  const [isPeriodComparison] = useState<boolean>(props.pageId === PAGES.ALL_SOURCES_COMPARISON);
  const [isAntifraud] = useState<boolean>(props.pageId === PAGES.ANTI_FRAUD);
  const [isForecast] = useState<boolean>(props.pageId === PAGES.ALL_SOURCES_METRICS_FORECAST);
  const [forecastPeriodStart] = useState<string>(
    props.timePeriods && props.timePeriods.periods.length > 1
      ? props.timePeriods.periods[1].start.format(SYSTEM_FORMAT)
      : moment().format(SYSTEM_FORMAT),
  );
  const [firstTooltipStyle] = useState<{ [field: string]: number | string }>(
    props.hasLegend ? FIRST_TOOLTIP_STYLES : FIRST_TOOLTIP_NO_LEGEND_STYLES,
  );
  const [secondTooltipStyle] = useState<{ [field: string]: number | string }>(
    props.hasLegend ? SECOND_TOOLTIP_STYLES : SECOND_TOOLTIP_NO_LEGEND_STYLES,
  );
  const [margin] = useState<number>(isDashboard ? 50 : 45);
  const [fullHeight] = useState<number>(
    props.height
      ? props.height - setSubtrahend(isDashboard, (props.chartData as LinearChartData).length)
      : CHART_HEIGHT,
  );
  const [chartHeight] = useState<number>(props.height ? fullHeight - margin : HEIGHT);

  // ======================================================
  // Memoized handlers
  // ======================================================
  const memoizedTooltipHover = useCallback(
    (
      isRect: boolean,
      isShown: boolean,
      xValue: number | string | Date,
      tickNode: d3Selection.Selection<d3Selection.BaseType, unknown, HTMLElement, any> | null,
      setParams: Function,
    ) => {
      window.clearTimeout(tooltipTimer.current);
      if (isShown && !isRect) {
        return;
      }
      if (isShown && xValue.toString().length > 0) {
        if (tickNode) {
          selectAll(`.${Rectangle}`).classed(RectangleHovered, false);
          selectAll('line').classed(LineVisible, false);
          selectAll('text').classed(TextVisible, false);
          tickNode.select('rect').classed(RectangleHovered, true);
          tickNode.select('line').classed(LineVisible, true);
          tickNode.select('text').classed(TextVisible, true);
        }
        if (!prevTooltipParams.current.isShown) {
          const width = chartRef.current!.clientWidth - MARGINS.left - MARGINS.right;
          const paramsLeft = tickNode
            ? Number(
                tickNode
                  .attr('transform')
                  .split('(')[1]
                  .split(',')[0],
              )
            : null;
          const { tooltips, left } = manageTooltips(
            select(chartRef.current!),
            props.data,
            width,
            chartHeight,
            props.currentPeriod,
            props.chartType,
            xValue,
            paramsLeft,
            isDashboard,
            props.filterOptions?.reducerId,
          );
          const chartWidth = chartWrapperRef.current!.getBoundingClientRect().width;
          setParams({
            xValue,
            isShown: true,
            left: chartWidth - left - 80 < 400 ? left - 220 : left + 80,
            tooltips,
          });
        }
      } else if (!isShown) {
        tooltipTimer.current = window.setTimeout(() => {
          const selector = isDashboard ? `.${Svg}-${props.filterOptions?.reducerId}` : `.${Svg}`;
          const svg = select(selector);
          if (tickNode) {
            tickNode.select(`.${Rectangle}`).classed(RectangleHovered, false);
            tickNode.select('line').classed(LineVisible, false);
            tickNode.select('text').classed(TextVisible, false);
          }
          setParams({ isShown, left: null, tooltips: [], xValue: '' });
          svg.selectAll(`.${TooltipCircle}`).classed(TooltipCircleHidden, true);
        }, 50);
      }
    },
    [
      chartHeight,
      isDashboard,
      props.chartType,
      props.currentPeriod,
      props.data,
      props.filterOptions,
    ],
  );

  const memoizedEventHover = useCallback(
    (
      isCircle: boolean,
      node: HTMLElement | null,
      date: string,
      isHovered: boolean,
      setEventParams: Function,
    ) => {
      window.clearTimeout(props.eventsTooltipTimer.current);
      if (isHovered && isCircle && node) {
        const left = calcEventLeft(node, chartWrapperRef.current!, props.currentPeriod);
        setEventParams({
          isShown: true,
          style: {
            ...EVENT_TOOLTIP_STYLES,
            left,
          },
          content: generateEventTooltipContent(props.eventsRef.current || [], date),
        });
      } else if (!isHovered) {
        props.eventsTooltipTimer.current = window.setTimeout(() => {
          setEventParams({
            isShown: false,
            style: null,
            content: '',
          });
        }, 400);
      }
    },
    [props.currentPeriod, props.eventsTooltipTimer, props.eventsRef],
  );

  // ======================================================
  // Memoized drawings
  // ======================================================
  const memoizedDrawing = useCallback(
    (data: DataType) => {
      if (!chartRef.current) {
        return;
      }
      const validData = checkData(data, props.currentPeriod);

      if (!validData) {
        select(chartRef.current).empty();
        return;
      }

      select(chartRef.current).empty();

      const width = isDashboard
        ? chartRef.current.clientWidth - MARGINS.left - 30
        : chartRef.current.clientWidth - MARGINS.left - MARGINS.right;

      const svg = select(chartRef.current)
        .append('svg')
        .attr('class', `${Svg} ${Svg}-${props.filterOptions?.reducerId}`)
        .attr(
          'width',
          isDashboard ? width + MARGINS.left + 30 : width + MARGINS.left + MARGINS.right,
        )
        .attr('height', fullHeight)
        .append('g')
        .attr('transform', `translate(${isDashboard ? 40 : MARGINS.left},20)`);

      appendXScale({
        data: uniqBy(data.initialData[0].data, 'date'),
        allData: data.initialData,
        svg,
        width,
        cn,
        periodType: props.currentPeriod,
        chartType: props.chartType,
        events: props.eventsRef.current || [],
        height: chartHeight,
        isPeriodComparison,
        isDashboard,
        setParams: props.setTooltipParams,
        setEventParams: props.setEventTooltipParams,
        onHoverEvent: memoizedEventHover,
        onHoverTooltip: memoizedTooltipHover,
      });
      for (let i = 0; i < data.mappedData.length; i += 1) {
        const currentSetCommonData = data.filteredData[i].data;
        const dataForSecondTicks =
          i === 0
            ? undefined
            : data.initialData[i].data.filter(
                item => !props.disabledMetrics.metrics.includes(item.id),
              );
        const ticksValues =
          i === 0 ? undefined : setScaleTicks(dataForSecondTicks!, data.filteredData[i].columnType);
        const groupedData = data.initialGroupedData[i].group;

        if (props.chartType !== 'trend' || (props.chartType === 'trend' && i === 0)) {
          appendYScale({
            data: i === 0 ? currentSetCommonData : dataForSecondTicks!,
            columnType: data.filteredData[i].columnType,
            svg,
            width,
            height: chartHeight,
            cn,
            styleTicks: true,
            index: i,
            ticksValues,
            chartType: props.chartType,
            isDashboard,
          });
          const maxValue =
            max(i === 0 ? currentSetCommonData : dataForSecondTicks!, d => (d as DataItem).value) ||
            0;

          if (
            (isDashboard &&
              data.filteredData[i].columnType !== 'percent' &&
              Math.round(maxValue).toString().length >= 5) ||
            (isDashboard &&
              data.filteredData[i].columnType === 'percent' &&
              Math.round(maxValue * 100).toString().length >= 3) ||
            (!isDashboard &&
              data.filteredData[i].columnType !== 'percent' &&
              Math.round(maxValue).toString().length >= 7) ||
            (!isDashboard &&
              data.filteredData[i].columnType === 'percent' &&
              Math.round(maxValue * 100).toString().length >= 4)
          ) {
            select(chartRef.current)
              .select(`.YAxisLabel-${i}`)
              .selectAll('.tick:not(:first-of-type) text')
              .attr('class', i === 0 ? RotatedLeft : RotatedRight);
          }
        }
        groupedData.forEach((group, groupIndex) => {
          const groups = isForecast ? setGroups(group, forecastPeriodStart) : [group];
          groups.forEach((item, itemIndex) => {
            createLine({
              data: item.values,
              allData: currentSetCommonData,
              trendData:
                props.chartType === 'trend' && groupIndex === 0 && i === 0
                  ? data.initialGroupedData[1].group
                  : undefined,
              svg,
              width,
              height: chartHeight,
              index: groupIndex,
              setIndex: i,
              isFirstRender: props.firstRender,
              isMain: group.isMain,
              isHidden: props.disabledMetrics.metrics.includes(group.key),
              cn,
              periodType: props.currentPeriod,
              chartType: props.chartType,
              isAntifraud,
              isForecast,
              isDashed: itemIndex === 1,
              onHoverTooltip: memoizedTooltipHover,
              setParams: props.setTooltipParams,
            });
          });
        });
      }

      if (props.firstRender) {
        props.setFirstRender(false);
      }

      /** Поднимаем шкалу Х наверх для area, чтобы area не перекрывал тултипы */
      if (props.chartType === 'area' || props.chartType === 'trend') {
        if (props.chartType === 'trend') {
          svg.selectAll(`.${ChartLine}`).raise();
          svg.select(`.${YAxisLabel}`).raise();
        }
        svg.select(`.${XAxisLabel}`).raise();
      }
      svg.selectAll(`.${TooltipCircle}`).raise();
    },
    [
      props,
      isDashboard,
      fullHeight,
      chartHeight,
      isPeriodComparison,
      memoizedTooltipHover,
      memoizedEventHover,
      isForecast,
      forecastPeriodStart,
      isAntifraud,
    ],
  );

  const memoizedUpdateDrawing = useCallback(
    ({ lastSetIndex, lastSetId, metrics }) => {
      if (
        lastSetIndex === null ||
        lastSetId === null ||
        (prevDisabledMetrics && metrics.length === prevDisabledMetrics.length)
      ) {
        return;
      }
      const { legendIds, groupIndex } = mapLegend(props.legendData, lastSetIndex, lastSetId);
      const width = isDashboard
        ? chartRef.current!.clientWidth - MARGINS.left - 30
        : chartRef.current!.clientWidth - MARGINS.left - MARGINS.right;
      const selector = isDashboard ? `.${Svg}-${props.filterOptions?.reducerId}` : `.${Svg}`;
      const svg = select(selector);
      const filteredSet = props.data.filteredData[groupIndex];
      const groupedData = props.data.groupedData[groupIndex].group;

      if (intersection(legendIds, metrics).length === props.legendData.columns.length) {
        svg.selectAll(`.${RightTickLine}`).classed(RightTickLineHidden, false);
      } else {
        svg.selectAll(`.${RightTickLine}`).classed(RightTickLineHidden, true);
      }

      svg.selectAll(`.${ChartLine}`).classed(ChartLineSaturated, false);

      metrics.forEach(metric => {
        const chartLine = svg.selectAll(`path.metric-${metric}`);
        chartLine.classed(ChartLineHidden, true);
      });

      const dataForSecondTicks =
        groupIndex === 0
          ? undefined
          : props.data.initialData[groupIndex].data.filter(item => !metrics.includes(item.id));
      const ticksValues =
        groupIndex === 0 ? undefined : setScaleTicks(dataForSecondTicks!, filteredSet.columnType);

      updateYScale({
        data: groupIndex === 0 ? filteredSet.data : dataForSecondTicks!,
        svg,
        width,
        height: chartHeight,
        cn,
        index: groupIndex,
        ticksValues,
        chartType: props.chartType,
        columnType: filteredSet.columnType,
        isDashboard,
      });

      /** Обвноление ссылок на функцию memoizedTooltipHover */
      svg.selectAll(`.${Rectangle}`).call(rect => {
        rect
          .on('mouseenter', function(e: any) {
            memoizedTooltipHover(
              true,
              true,
              e,
              select((this as Element).parentNode as any) as any,
              props.setTooltipParams,
            );
          })
          .on('mouseleave', function(e: any) {
            memoizedTooltipHover(
              true,
              false,
              e,
              select((this as Element).parentNode as any) as any,
              props.setTooltipParams,
            );
          });
      });

      groupedData.forEach(group => {
        const groups = isForecast ? setGroups(group, forecastPeriodStart) : [group];
        const chartLines = svg.selectAll(`path.metric-${group.key}`);
        chartLines.each(function(d, index) {
          select(this)
            .classed(ChartLineHidden, false)
            .attr('stroke-dasharray', 0);
          updateLine({
            lineNode: select(this),
            data: groups[index].values,
            allData: filteredSet.data,
            width,
            height: chartHeight,
            periodType: props.currentPeriod,
            chartType: props.chartType,
            wasHidden: prevDisabledMetrics ? prevDisabledMetrics.includes(group.key) : false,
            isDashed: index === 1,
          });
        });
      });
    },
    [
      prevDisabledMetrics,
      props.legendData,
      props.data.filteredData,
      props.data.groupedData,
      props.data.initialData,
      props.chartType,
      props.setTooltipParams,
      props.currentPeriod,
      isDashboard,
      chartHeight,
      memoizedTooltipHover,
      isForecast,
      forecastPeriodStart,
      props.filterOptions,
    ],
  );

  // ======================================================
  // Effects
  // ======================================================
  useEffect(() => {
    if (
      (typeof prevIsResizing === 'undefined' && !isResizing) ||
      (prevIsResizing && prevIsResizing !== isResizing)
    ) {
      memoizedDrawing(props.data);
    }
  }, [prevIsResizing, isResizing, memoizedDrawing, props.data]);

  useEffect(() => {
    prevTooltipParams.current = props.tooltipParams;
  }, [props.tooltipParams]);

  useEffect(() => {
    if (
      (prevDisabledMetrics &&
        prevDisabledMetrics!.length !== props.disabledMetrics.metrics.length) ||
      (prevSetId && prevSetId !== props.disabledMetrics.lastSetId)
    ) {
      memoizedUpdateDrawing(props.disabledMetrics);
    }
  }, [props.disabledMetrics, prevDisabledMetrics, memoizedUpdateDrawing, prevSetId]);

  useEffect(() => {
    if (
      props.events &&
      chartRef.current &&
      prevEvents &&
      !isDashboard &&
      !isPeriodComparison &&
      !isEqual(prevEvents, props.events)
    ) {
      (props.eventsRef as any).current = props.events;
      updateEvents(
        props.events,
        select(chartRef.current),
        props.currentPeriod,
        memoizedEventHover,
        props.setEventTooltipParams,
        cn,
      );
    }
  }, [
    memoizedEventHover,
    prevEvents,
    props.events,
    props.setEventTooltipParams,
    props.currentPeriod,
    isDashboard,
    isPeriodComparison,
    props.eventsRef,
  ]);

  // ======================================================
  // Refs
  // ======================================================
  function getChartRef(node: HTMLDivElement): void {
    if (node) {
      chartRef.current = node;
    }
  }

  function getChartWrapperRef(node: HTMLDivElement): void {
    if (node) {
      chartWrapperRef.current = node;
    }
  }

  // ======================================================
  // Handlers
  // ======================================================

  /** Legend */
  function handleMouseEnterColor(metricId: string): void {
    if (!props.disabledMetrics.metrics.includes(metricId)) {
      highlightSelectedMetric(metricId, select(chartRef.current!));
    }
  }

  function handleMouseLeaveColor(): void {
    highlightSelectedMetric(null, select(chartRef.current!));
  }

  function handleColorClick(index: number, metricId: string): void {
    props.changeDisabledMetrics(index, metricId);
  }

  function handleAddEvent(): void {
    props.onEventClick(null);
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <div
      className={cn('ChartWrapper', 'Linear', `Linear--${props.chartType}`, {
        'Linear--no-legend': !props.hasLegend,
        'Linear--dashboard': isDashboard,
      })}
      ref={getChartWrapperRef}
    >
      {props.hasLegend && (
        <Legend
          isLinearInDashboard={isDashboard}
          data={props.legendData}
          disabledMetrics={props.disabledMetrics.metrics}
          pageId={props.pageId}
          onMouseEnterColor={handleMouseEnterColor}
          onMouseLeaveColor={handleMouseLeaveColor}
          onClickColor={handleColorClick}
        />
      )}
      {isResizing && <Loading className={cn('Loading')} />}
      {!isResizing && <div className={cn('Chart')} ref={getChartRef} />}
      {props.eventTooltipParams.isShown && (
        <Tooltip
          content={props.eventTooltipParams.content}
          style={props.eventTooltipParams.style}
          onHover={memoizedEventHover}
          onRowClick={props.onEventClick}
          params={props.setEventTooltipParams}
        />
      )}
      {props.tooltipParams.isShown && props.tooltipParams.tooltips.length > 0 && (
        <Tooltip
          content={props.tooltipParams.tooltips[0]}
          style={{
            ...firstTooltipStyle,
            left: (props.tooltipParams.left as number) || 0,
            bottom: setTooltipBottom(
              props.tooltipParams.tooltips[0].rows?.length,
              fullHeight,
              props.hasLegend,
              isDashboard,
              props.tooltipParams.tooltips.length === 1,
            ),
          }}
          isTrendFirstTooltip={props.chartType === 'trend'}
          usePercent={
            props.tooltipParams.tooltips[0].titleLeft.indexOf('%') !== -1 ||
            props.chartType === 'trend'
          }
          useTime={
            (props.data.initialData.length === 1 &&
              props.data.initialData[0].columnType === 'time') ||
            (props.data.initialData.length === 2 &&
              props.tooltipParams.tooltips.length === 2 &&
              props.data.initialData[0].columnType === 'time') ||
            (props.data.initialData.length === 2 &&
              props.tooltipParams.tooltips.length === 1 &&
              props.data.initialData[1].columnType === 'time')
          }
          useCurrency={props.data.initialData[0].columnType === 'currency'}
          round={props.data.initialData[0].columnRound}
          unit={props.data.initialData[0].unit}
        />
      )}
      {props.tooltipParams.isShown &&
        props.data.groupedData.length > 1 &&
        props.tooltipParams.tooltips.length > 1 && (
          <Tooltip
            content={props.tooltipParams.tooltips[1]}
            style={{ ...secondTooltipStyle, left: (props.tooltipParams.left as number) || 0 }}
            usePercent={
              props.data.initialData[1].columnType === 'percent' || props.chartType === 'trend'
            }
            isTrendSecondTooltip={props.chartType === 'trend'}
            useTime={props.data.initialData[1].columnType === 'time'}
            useCurrency={props.data.initialData[1].columnType === 'currency'}
            round={props.data.initialData[1].columnRound}
            unit={props.data.initialData[1].unit}
          />
        )}
      {!isDashboard &&
        !isPeriodComparison &&
        !isResizing &&
        !!props.events &&
        !props.periodHasEvents &&
        props.currentPeriod !== 'hour' && (
          <div className={cn('AddEvent')}>
            <span className={cn('AddEvent__text')}>Нет событий за выбранный период</span>
            <Button size="s" text="Добавить событие" icon={addEventIcon} onClick={handleAddEvent} />
          </div>
        )}
    </div>
  );
};

export default withEventsData(withData(LinearChart));
