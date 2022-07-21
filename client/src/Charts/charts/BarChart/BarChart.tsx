import React, { useRef, useEffect, useContext, useState, useCallback, useMemo } from 'react';
import classnames from 'classnames/bind';
import { select, selectAll, scaleBand, scaleLinear, max, min, timeParse } from 'd3';
import { uniqBy } from 'lodash';

// ======================================================
// Helpers and utils
// ======================================================
import DataContext from '../../context/DataContext';
import useResize from '../../hooks/useResize';
import usePrevious from 'hooks/usePrevious';
import { emptyFunction } from 'utils/common';

import { appendXScale, appendYScale } from '../LinearChart/helpers/scale-helpers';
import { setInitialDate } from '../../helpers/helpers';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Loading } from '@calltouch/ct-ui-kit';
import Tooltip from '../../components/Tooltip/Tooltip';

import styles from './BarChart.module.scss';

// ======================================================
// Types
// ======================================================
import {
  ChartContext,
  Data,
  DataItem,
  LinearChartData,
  MetricPopoverData,
  Period,
  TooltipContent,
} from '../../types/commonTypes';
import * as d3Selection from 'd3-selection';

type BarData = {
  date: string;
  columnName: string;
  values: { id: string; value: number; metricName: string }[];
};

type TooltipParams = {
  isShown: boolean;
  left: null | number;
  xValue: string | number | Date;
  content: null | TooltipContent;
};

// ======================================================
// Static
// ======================================================
import {
  MARGINS,
  CHART_HEIGHT,
  MAIN_COLORS,
  HEIGHT,
  TOOLTIP_ROW_HEIGHT,
  TOOLTIP_MIN_HEIGHT,
} from '../../helpers/consts';
import { PAGES } from 'consts';

const cn: Function = classnames.bind(styles);

const BAR_MARGIN = 4;
const defaultTooltipParams = { isShown: false, left: null, xValue: '', content: null };
const TOOLTIP_STYLES = {
  bottom: 250,
  top: 'auto',
  left: 'auto',
  right: 'auto',
};

// CLASSES
const Svg = cn('Svg');
const Bar = cn('Bar');
const Rectangle = cn('Rectangle');
const RectangleHovered = cn('Rectangle--hovered');
const LineVisible = cn('LineVisible');
const TextVisible = cn('TextVisible');

// FUNCTIONS
function setData(data: Data, columnName: string): BarData[] {
  const uniqDates = uniqBy(data, 'date').map(({ date }) => date);
  return uniqDates.map(date => {
    const dataByDate = data.filter(item => item.date === date);
    return {
      date: date!.toString(),
      columnName,
      values: dataByDate as { id: string; value: number; metricName: string }[],
    };
  });
}

function manageTooltip(
  initialData: DataItem[],
  chartData: BarData[],
  periodType: Period,
  xValue: string | number | Date,
  ref: d3Selection.Selection<HTMLDivElement, any, any, any>,
  color?: string,
): { content: TooltipContent; left: number } {
  const data = chartData.find(
    ({ date }) => date === setInitialDate(initialData, xValue, periodType),
  )!;

  const rect = ref.select(`.${RectangleHovered}`);
  const parent = rect.select(function() {
    return (this as Element)!.parentNode as any;
  });

  // eslint-disable-next-line no-underscore-dangle
  const translate = (parent as any)._groups[0][0]
    ? parent
        .attr('transform')
        .split(',')[0]
        .split('(')[1]
    : '0';

  return {
    content: {
      titleLeft: data.columnName,
      rows: data.values.map((item, index) => ({
        id: item.id,
        color: color || MAIN_COLORS[index],
        title: item.metricName,
        value: item.value,
      })),
    },
    left: Number(translate) + 44,
  };
}

function setTooltipBottom(
  height: number | undefined,
  numOfRows: number | undefined,
  chartHeight: number,
): number {
  if (!height || !numOfRows) {
    return TOOLTIP_STYLES.bottom;
  }
  const tooltipHeight = numOfRows * TOOLTIP_ROW_HEIGHT + TOOLTIP_MIN_HEIGHT;
  return chartHeight / 2 - tooltipHeight / 2 + 35;
}

function calcBarWidth(width: number, bandWidth: number, itemsLength: number): number {
  const fitWidth = width / itemsLength;
  const barWidth = fitWidth / 2 - BAR_MARGIN * 2;
  if (barWidth > 24) {
    return 24;
  }
  return barWidth;
}

function getColumnType(
  metricData: MetricPopoverData,
  selectedMetric: number | null = null,
): string {
  let selected = 'plain';
  metricData.metricTypes.forEach(item => {
    item.metrics.forEach(metric => {
      if (selectedMetric || metric.isSelected) {
        if (metric.id === selectedMetric) {
          selected = 'plain';
        }
        if (metric.dependentMetricId !== null && metric.dependentMetricId === selectedMetric) {
          selected = 'percent';
        }
      }
    });
  });
  return selected;
}

// ======================================================
// Component
// ======================================================
const BarChart: React.FunctionComponent = () => {
  const props: ChartContext = useContext(DataContext);

  const { data } = props.chartData[0];
  const chartData = setData(
    data,
    props.chartData && props.chartData[0] ? props.chartData[0].columnName : '',
  );

  const minValue: number = useMemo(() => min(data, d => (d as DataItem).value) || 0, [data]);
  const maxValue: number = useMemo(() => max(data, d => (d as DataItem).value) || 0, [data]);

  /* если минимальное значение на грфике не 0, мы должны начинаь отсчет по Y как minValue - 10% */
  const indentForYScaleBottom = useMemo(() => {
    return 0.1 * (maxValue - minValue);
  }, [maxValue, minValue]);

  let minMetricValue = useMemo(() => {
    return minValue <= 0 || minValue - indentForYScaleBottom <= 0
      ? 0
      : Math.floor(minValue - indentForYScaleBottom);
  }, [minValue, indentForYScaleBottom]);

  const fullHeight = useMemo(() => (props.height ? props.height - 70 : CHART_HEIGHT), [
    props.height,
  ]);
  const chartHeight = useMemo(() => (props.height ? fullHeight - 45 : HEIGHT), [
    fullHeight,
    props.height,
  ]);
  const isSiteList = useMemo(() => props.pageId === PAGES.SITE_LIST, [props.pageId]);

  if (minValue === maxValue) {
    minMetricValue = 0;
  }

  const round = useMemo(() => props.chartData[0].columnRound || 0, [props.chartData]);
  const unit = useMemo(() => props.chartData[0].unit, [props.chartData]);
  const isCurrency = useMemo(() => props.chartData[0].columnType === 'currency', [props.chartData]);

  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  const [tooltipParams, setTooltipParams] = useState<TooltipParams>(defaultTooltipParams);
  const [columnType] = useState<string>(
    getColumnType(
      props.metricData as MetricPopoverData,
      props.selectedMetrics.length > 0 ? props.selectedMetrics[0] : null,
    ),
  );

  const chartRef = useRef<HTMLDivElement>();
  const chartWrapperRef = useRef<HTMLDivElement>();
  const tooltipTimer = useRef<number>();

  const [isResizing] = useResize();

  const prevIsResizing = usePrevious(isResizing);

  // ======================================================
  // Memoized handlers
  // ======================================================
  const memoizedTooltipHover = useCallback(
    (
      isRect: boolean,
      isShown: boolean,
      xValue: number | string | Date,
      tickNode: d3Selection.Selection<d3Selection.BaseType, unknown, HTMLElement, any>,
      setParams: Function,
    ) => {
      window.clearTimeout(tooltipTimer.current);
      selectAll(`.${Rectangle}`).classed(RectangleHovered, false);

      if (isShown && xValue.toString().length > 0) {
        if (tickNode) {
          const svg = select(chartRef.current as HTMLDivElement).select(`.${Svg}`);
          svg.selectAll('line').classed(LineVisible, false);
          svg.selectAll('text').classed(TextVisible, false);
          tickNode.select('rect').classed(RectangleHovered, true);
          tickNode.select('line').classed(LineVisible, true);
          tickNode.select('text').classed(TextVisible, true);
        }
        const { content, left } = manageTooltip(
          props.chartData[0].data,
          chartData,
          props.currentPeriod,
          xValue,
          select(chartRef.current as HTMLDivElement),
          props.color,
        );
        const chartWidth = chartWrapperRef.current!.getBoundingClientRect().width;
        setParams({
          xValue,
          isShown: true,
          left: chartWidth - left - 80 < 300 ? left - 280 : left + 30,
          content,
        });
      } else if (!isShown) {
        tooltipTimer.current = window.setTimeout(() => {
          if (tickNode) {
            tickNode.select(`.${Rectangle}`).classed(RectangleHovered, false);
            tickNode.select('line').classed(LineVisible, false);
            tickNode.select('text').classed(TextVisible, false);
          }
          setParams({ isShown, left: null, content: null, xValue: '' });
        }, 50);
      }
    },
    [chartData, props.chartData, props.currentPeriod, props.color],
  );

  // ======================================================
  // Memoized drawing
  // ======================================================
  const drawChart = useCallback(
    (drawData: LinearChartData, barData: BarData[]) => {
      if (!chartRef.current) {
        return;
      }

      select(chartRef.current).empty();

      const width = isSiteList
        ? chartRef.current.clientWidth - 65
        : chartRef.current.clientWidth - MARGINS.left - MARGINS.right;

      const x = scaleBand()
        .domain(
          barData.map(function(d) {
            return d.date;
          }),
        )
        .range([0, width])
        .padding(0.2);
      const y = scaleLinear()
        .domain([minMetricValue, maxValue])
        .range([chartHeight, 0]);

      const svg = select(chartRef.current)
        .append('svg')
        .attr('class', Svg)
        .attr('width', isSiteList ? width + 48 : width + MARGINS.left + MARGINS.right)
        .attr('height', fullHeight)
        .append('g')
        .attr('transform', `translate(${isSiteList ? 45 : MARGINS.left},20)`);

      appendXScale({
        data: (uniqBy(drawData[0].data, 'date') as unknown) as Data,
        svg,
        width,
        height: chartHeight,
        cn,
        periodType: props.currentPeriod,
        chartType: props.chartType,
        events: [],
        onHoverEvent: emptyFunction,
        onHoverTooltip: memoizedTooltipHover,
        setParams: setTooltipParams,
        setEventParams: emptyFunction,
      });

      appendYScale({
        data: drawData[0].data,
        svg,
        width,
        height: chartHeight,
        cn,
        styleTicks: true,
        index: 0,
        chartType: props.chartType,
        columnType,
        minMetricValue,
      });

      if (
        isSiteList &&
        (maxValue.toString().length >= 6 ||
          (columnType === 'percent' && (maxValue * 100).toString().length >= 4))
      ) {
        select(chartRef.current)
          .select(`.${cn('YAxisLabel')}`)
          .selectAll('.tick:not(:first-of-type) text')
          .style('transform', 'rotate(-45deg) translate(0px, -5px)');
      }

      /** Отрисовка bars */
      barData.forEach((item, itemIndex) => {
        const g = svg
          .append('g')
          .attr('class', Bar)
          .attr(
            'transform',
            select(chartRef.current as HTMLDivElement)
              .select(`.${cn('XAxisLabel')} .tick:nth-child(${itemIndex + 1})`)
              .attr('transform'),
          );

        item.values.forEach((metric, index) => {
          const bandWidth = x.bandwidth();
          const barWidth =
            item.values.length > 1 ? calcBarWidth(width, bandWidth, barData.length) : bandWidth;

          g.append('rect')
            .attr('y', isFirstRender ? chartHeight : y(metric.value)!)
            .attr('width', barWidth < 1 ? bandWidth / 2 : barWidth)
            .attr('transform', () => {
              const currentWidth = barWidth < 1 ? bandWidth / 2 : barWidth;
              const margin = barWidth < 1 ? 1 : BAR_MARGIN;
              if (item.values.length === 2) {
                return index === 0
                  ? `translate(-${currentWidth + margin}, 0)`
                  : `translate(${margin}, 0)`;
              }
              return `translate(-${currentWidth / 2}, 0)`;
            })
            .attr('fill', props.color || MAIN_COLORS[index])
            .attr('height', () => {
              if (isFirstRender || metric.value === 0) {
                return 0;
              }
              return chartHeight - y(metric.value)!;
            })
            .on('mouseenter', function(e: any) {
              if (item.values.length === 1 && Number(select(this).attr('height')) === chartHeight) {
                const xValue: string | Date =
                  props.currentPeriod === 'day'
                    ? timeParse('%Y-%m-%d')(item.date as string)!
                    : item.date!;
                const transform = select(select(this).node()!.parentNode as SVGGElement).attr(
                  'transform',
                );
                const translate = Number(transform.split(',')[0].split('(')[1]) + 44;
                window.clearTimeout(tooltipTimer.current);
                const { content } = manageTooltip(
                  props.chartData[0].data,
                  chartData,
                  props.currentPeriod,
                  xValue as string | Date,
                  select(chartRef.current as HTMLDivElement),
                );
                const chartWidth = chartWrapperRef.current!.getBoundingClientRect().width;
                setTooltipParams({
                  xValue,
                  isShown: true,
                  left: chartWidth - translate - 80 < 300 ? translate - 280 : translate + 30,
                  content,
                });
              }
            })
            .on('mouseleave', function(e: any) {
              if (item.values.length === 1 && Number(select(this).attr('height')) === chartHeight) {
                setTooltipParams({ isShown: false, left: null, content: null, xValue: '' });
              }
            })
            .transition()
            .duration(1000)
            .attr('height', () => {
              if (metric.value === 0) {
                return 0;
              }
              return chartHeight - y(metric.value)!;
            })
            .attr('y', y(metric.value)!);
        });
      });

      if (isFirstRender) {
        setIsFirstRender(false);
      }

      if (!isSiteList) {
        svg.select(`.${cn('XAxisLabel')}`).raise();
      }
    },
    [
      chartData,
      chartHeight,
      columnType,
      fullHeight,
      isFirstRender,
      isSiteList,
      maxValue,
      memoizedTooltipHover,
      minMetricValue,
      props.chartData,
      props.chartType,
      props.color,
      props.currentPeriod,
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
      drawChart(props.chartData as LinearChartData, chartData);
    }
  }, [drawChart, isResizing, prevIsResizing, props.chartData, chartData]);

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
  // Render
  // ======================================================
  return (
    <div
      className={cn('ChartWrapper', 'BarChart', {
        'BarChart--not-margined': props.height,
        'BarChart--sites': isSiteList,
      })}
      ref={getChartWrapperRef}
    >
      {isResizing && <Loading className={cn('Loading')} />}
      {!isResizing && <div className={cn('Chart')} ref={getChartRef} />}
      {maxValue > 0 && tooltipParams.isShown && tooltipParams.content && (
        <Tooltip
          content={tooltipParams.content}
          style={{
            ...TOOLTIP_STYLES,
            left: (tooltipParams.left as number) || 0,
            bottom: setTooltipBottom(
              props.height,
              tooltipParams.content?.rows?.length,
              chartHeight,
            ),
          }}
          usePercent={columnType === 'percent'}
          useCurrency={isCurrency}
          round={round}
          unit={unit}
        />
      )}
    </div>
  );
};

export default BarChart;
