import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

import classnames from 'classnames/bind';

import withEventsData from 'containers/D3Charts/charts/hocs/withEventsData';

import { select, selectAll, sum, max, scaleBand, scaleLinear } from 'd3';

import { uniqBy, isEqual } from 'lodash';

// ======================================================
// Helpers and utils
// ======================================================
import useResize from 'containers/D3Charts/hooks/useResize';
import usePrevious from 'hooks/usePrevious';
import { emptyFunction } from 'utils/common';
import { formatMetricItem } from 'containers/StatisticsTable/helpers';

import { appendXScale, appendYScale } from '../LinearChart/helpers/scale-helpers';
import { createLineByPoint, addText, getLengthValue } from './helpers';
import { getWeeksAndYears, getMonth } from 'containers/D3Charts/helpers/helpers';
import formatToThousands from 'helpers/formatHelpers/formatToThousands';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================

import { Loading, Icon } from '@calltouch/ct-ui-kit';
import Legend from './Legend';
import Tooltip from 'containers/D3Charts/components/Tooltip/Tooltip';

import styles from './StackedChart.module.scss';

// ======================================================
// Static
// ======================================================
import {
  COHORT_COLORS,
  ALONE_COLOR,
  STACK_MARGIN,
  SvgClass,
  StackClass,
  StackOpacity,
  StackVisible,
  ValueVisible,
  MetricValueVisible,
  MARGINS_STACK,
  MARGIN_FOR_CHART_LEGEND,
  MIN_TICK_WIDTH,
  MIN_TICK_OFFSET,
  WHITE_FONT,
  REG_TRANSLATE_X,
} from './consts';

import { STACK_VALUES_TYPE } from 'pages/Reports/Attendance/CohortAnalysis/consts';

import { CHART_HEIGHT, HEIGHT } from '../../helpers/consts';

import { COHORT_ONE_CHART } from 'consts/server_component_ids';

import {
  updateEvents,
  calcEventLeft,
  generateEventTooltipContent,
  EVENT_TOOLTIP_STYLES,
} from 'containers/D3Charts/charts/LinearChart/LinearChart';

/** высота шапки у графика */
const HEIGHT_HEAD = 86;

/** высота от нижнего края графика до нижнего края chartLayout */
const HEIGHT_BOTTOM = 45;

const cn: Function = classnames.bind(styles);

// FUNCTIONS
function getIndexColor(index: number): number {
  return index - COHORT_COLORS.length * Math.floor(index / COHORT_COLORS.length);
}

function calcStackWidth(width: number, bandWidth: number, itemsLength: number): number {
  const fitWidth = width / itemsLength;
  const barWidth = fitWidth - STACK_MARGIN * 2;
  if (barWidth < 24) {
    return 24;
  }
  if (barWidth > 150) {
    return 150;
  }
  return barWidth;
}

function getWidthChart(clientWidth: number): number {
  return clientWidth - MARGINS_STACK.left - MARGINS_STACK.right;
}

/** подсчет вмещающихся столбцов в текущую ширину графика */
function getCountTickFitInScale(chartRef, numOfTicks: number): number {
  if (chartRef.current) {
    const width = getWidthChart(chartRef.current.clientWidth);
    const tickWidth = MIN_TICK_WIDTH + MIN_TICK_OFFSET;
    const fitNumber = Math.round(width / tickWidth);
    if (numOfTicks < fitNumber) {
      return numOfTicks;
    }
    return fitNumber;
  }
  return -1;
}

function setData(data: Data, columnName: string): Array<StackedData> {
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

function setLegendData(
  currentPeriod: string,
  data?: Array<{
    metricId: string;
    date: string;
  }>,
): Array<{
  date: string;
  metricId: string;
  color: string;
  fontColor: string;
}> | null {
  if (!Array.isArray(data) || !data) return null;
  return [...data].reverse().map((elem, index) => {
    let curDate = elem.date;
    if (currentPeriod === 'week') {
      const { weekNumber, yearNumber } = getWeeksAndYears(curDate as string);
      curDate = `${weekNumber} - ${yearNumber}`;
    } else {
      curDate = getMonth(elem.date as string, 'YY').monthWithYear;
    }
    const indexColor = getIndexColor(data.length - 1 - index);
    return {
      ...elem,
      date: curDate,
      color: COHORT_COLORS[indexColor],
      fontColor: WHITE_FONT.includes(indexColor) ? 'var(--white)' : 'var(--grey-darker)',
    };
  });
}

// ======================================================
// Types
// ======================================================
import { Data } from '../../types/commonTypes';
import { ChartPropsWithEventType } from 'containers/D3Charts/charts/LinearChart/types';

type StackedData = {
  date: string;
  columnName: string;
  values: { id: string; value: number; metricName: string }[];
};

// ======================================================
// Component
// ======================================================
const StackedChart: React.FunctionComponent<ChartPropsWithEventType> = (
  props: ChartPropsWithEventType,
) => {
  // ======================================================
  // Refs
  // ======================================================
  const chartRef = useRef<HTMLDivElement>();
  const chartWrapperRef = useRef<HTMLDivElement>();

  const hightlightColumnTimer = useRef<number>();

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

  const { data } = props.chartData[0];
  const { offsetHeight = 0 } = props;
  const chartData: Array<StackedData> = setData(
    data,
    props.chartData && props.chartData[0] ? props.chartData[0].columnName : '',
  );

  const legendData = setLegendData(props.currentPeriod, props.legendDataByDate);

  /** диапазон значений, отображаемый на графике */
  const [valuesXScale, setValuesXScale] = useState({
    from: 0,
    to: 0,
  });

  const visibleStackData = chartData.slice(valuesXScale.from, valuesXScale.to);

  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);

  const [isResizing] = useResize(valuesXScale);

  const prevIsResizing = usePrevious(isResizing);
  const prevEvents = usePrevious(props.events);

  // ======================================================
  // Consts
  // ======================================================
  const prevChartDataLength = usePrevious(chartData.length);

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
        const left = calcEventLeft(node, chartWrapperRef.current!, props.currentPeriod, true);
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
  // Effects
  // ======================================================
  useEffect(() => {
    if (
      typeof prevChartDataLength === 'undefined' ||
      (prevChartDataLength && prevChartDataLength !== chartData.length) ||
      (prevIsResizing && prevIsResizing !== isResizing) ||
      valuesXScale.to === -1
    ) {
      /** при первом рендере вернется -1, чтобы после монтирования chartRef в dom,
       * рассчитать его ширину для подсчета вмещающихся когорт */
      const countFitTick = getCountTickFitInScale(chartRef, chartData.length);

      if (countFitTick > 0 || countFitTick === -1) {
        setValuesXScale(prevState => ({
          ...prevState,
          from: prevState.from,
          to: countFitTick + prevState.from,
        }));
      }
    }
  }, [isResizing, prevIsResizing, prevChartDataLength, chartData.length, valuesXScale.to]);

  /** Задаём календарь событий на графике */
  useEffect(() => {
    if (props.events && chartRef.current && prevEvents && !isEqual(prevEvents, props.events)) {
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
    props.eventsRef,
  ]);

  /** кол-во столбиков, вмещающихся на график */
  const countTickFitXScale = useMemo(() => {
    return valuesXScale.to - valuesXScale.from;
  }, [valuesXScale.from, valuesXScale.to]);

  /** Высота графика */
  const fullHeight = useMemo(() => {
    return props.height ? props.height - HEIGHT_HEAD : CHART_HEIGHT;
  }, [props.height]);

  /** Высота графика по шкале y */
  const chartHeight = useMemo(() => {
    return props.height ? fullHeight - HEIGHT_BOTTOM : HEIGHT;
  }, [props.height, fullHeight]);

  const offsetRight = useMemo(() => {
    return props.hasLegend ? MARGIN_FOR_CHART_LEGEND : 0;
  }, [props.hasLegend]);

  const disabledLeftArrow = useMemo(() => {
    return valuesXScale.from === 0;
  }, [valuesXScale.from]);

  const disabledRightArrow = useMemo(() => {
    return valuesXScale.to === chartData.length;
  }, [valuesXScale.to, chartData.length]);

  useEffect(() => {
    const opacity = props.showEvents ? 1 : 0;
    const events = select(chartRef.current as HTMLDivElement).selectAll(`.tick .${cn('Event')}`);
    events
      .transition()
      .duration(400)
      .attr('opacity', opacity);
  }, [props.showEvents]);

  // ======================================================
  // Handlers
  // ======================================================
  const handleHoverLine = useCallback((isOpacity: boolean): void => {
    select(chartRef.current as HTMLDivElement)
      .selectAll(`.${cn('Stack')} rect`)
      .classed(StackOpacity, isOpacity);
  }, []);

  const setHighlightColumn = useCallback((highlight: boolean, date: string) => {
    selectAll(`.${StackClass}`).classed(StackOpacity, highlight);
    selectAll(`.${StackClass}.${cn(`stack-date-${date}`)}`).classed(StackVisible, highlight);
    selectAll(`.${StackClass} .${cn(`rect-value-${date}`)}`).classed(ValueVisible, highlight);
    // показываем подпись для столбца сверху (если значение не помещается в ширину столбика, оно не показывается)
    selectAll(`.${cn(`MetricValue--${date}`)}`).classed(MetricValueVisible, highlight);
  }, []);

  const highlightColumn = useCallback(
    (highlight: boolean, date: string): void => {
      window.clearTimeout(hightlightColumnTimer.current);
      if (highlight) {
        hightlightColumnTimer.current = window.setTimeout(() => {
          setHighlightColumn(highlight, date);
        }, 50);
      } else setHighlightColumn(highlight, date);
    },
    [setHighlightColumn],
  );

  const handleMouseEventColor = useCallback((metricId: string, highlight: boolean): void => {
    selectAll(`.${cn('StackItem')}`).classed(StackOpacity, highlight);
    selectAll(`.${cn(`StackItem-${metricId}`)}`).classed(StackVisible, highlight);
    selectAll(`.${StackClass} .${cn(`rect-value-${metricId}`)}`).classed(ValueVisible, highlight);
    selectAll(`.${cn(`MetricValue`)}`).classed(StackOpacity, highlight);
  }, []);

  const handleClickLeftArrow = useCallback(() => {
    if (disabledLeftArrow) return;
    setValuesXScale(prevState => ({
      ...prevState,
      from: prevState.from - 1,
      to: prevState.to - 1,
    }));
  }, [disabledLeftArrow]);

  const handleClickRightArrow = useCallback(() => {
    if (disabledRightArrow) return;
    setValuesXScale(prevState => ({
      ...prevState,
      from: prevState.from + 1,
      to: prevState.to + 1,
    }));
  }, [disabledRightArrow]);

  // ======================================================
  // Memoized drawing
  // ======================================================
  const drawChart = useCallback(
    (visibleData: Array<StackedData>) => {
      if (!chartRef.current) {
        return;
      }

      const visibleStackDataSum = visibleData.map(elem => sum(elem.values.map(item => item.value)));
      select(chartRef.current).empty();

      const width = getWidthChart(chartRef.current.clientWidth) - offsetRight;
      const svgWidth = width + MARGINS_STACK.left + MARGINS_STACK.right;

      const maxValue: number = max(visibleStackDataSum, d => d) || 0;

      const x = scaleBand()
        .domain(
          visibleData.map(d => {
            return d.date;
          }),
        )
        .range([0, width])
        .padding(0.3);

      const y = scaleLinear()
        .domain([0, maxValue])
        .range([chartHeight, 0]);

      const svg = select(chartRef.current)
        .append('svg')
        .attr('class', SvgClass)
        .attr('width', svgWidth)
        .attr('height', fullHeight + offsetHeight + HEIGHT_BOTTOM)
        .append('g')
        .attr('transform', `translate(${MARGINS_STACK.left}, 20)`);

      appendXScale({
        data: (visibleData as Array<any>).map(elem => ({
          ...elem,
          id: elem.date,
        })) as Data,
        svg,
        width,
        height: chartHeight,
        cn,
        periodType: props.currentPeriod,
        chartType: props.chartType,
        events: props.eventsRef.current || [],
        isHiddenIntermediatePoints: false,
        onlyOneYear: props.onlyOneYear,
        onHoverEvent: memoizedEventHover,
        setParams: emptyFunction,
        setEventParams: props.setEventTooltipParams,
        firstRenderHideOpacity: !props.showEvents,
      });

      appendYScale({
        data: (visibleData as Array<any>).map((elem, index) => ({
          ...elem,
          value: visibleStackDataSum[index],
        })) as Data,
        svg,
        width,
        height: chartHeight,
        cn,
        styleTicks: true,
        divOnScale: 5,
        index: 0,
        countFromZero: true,
        chartType: props.chartType,
        columnType: props.chartData[0] && props.chartData[0].columnType,
        unit: props.chartData[0] && props.chartData[0].unit,
      });

      const stackWidth = calcStackWidth(width, x.bandwidth(), visibleData.length);

      const formatValues = visibleStackDataSum.map(elem =>
        formatMetricItem(elem, props.chartData[0].columnType, props.chartData[0].unit || 'р', 0),
      );

      const isShowSumCohortValue = visibleData.every(
        (elem, index) => getLengthValue(formatValues[index]) < stackWidth + 8,
      );

      // отрисовка столбиков
      visibleData.forEach((item, itemIndex) => {
        const g = svg
          .append('g')
          .attr('class', `${StackClass} ${cn(`stack-date-${item.date}`)}`)
          .attr(
            'transform',
            select(chartRef.current as HTMLDivElement)
              .select(`.${cn('XAxisLabel')} .tick:nth-child(${itemIndex + 1})`)
              .attr('transform'),
          )
          .on('mouseenter', () => {
            highlightColumn(true, item.date);
          })
          .on('mouseleave', () => {
            highlightColumn(false, item.date);
          });

        const gYear = svg
          .append('g')
          .attr('class', cn('TickYear'))
          .attr('transform', () => {
            const transformValue = select(chartRef.current as HTMLDivElement)
              .select(`.${cn('XAxisLabel')} .tick:nth-child(${itemIndex + 1})`)
              .attr('transform');
            const groupMatch = transformValue.match(REG_TRANSLATE_X);
            const translateX = groupMatch && groupMatch[1];
            return `translate(${Number(translateX) - 16}, 465)`;
          });

        const { yearNumber, weekNumber, numberMonth } = getWeeksAndYears(item.date);

        const dateIsBeginOfYear =
          props.currentPeriod === 'month'
            ? itemIndex === 0 || numberMonth === 0
            : itemIndex === 0 || weekNumber === 1;

        if (dateIsBeginOfYear && !props.onlyOneYear) {
          gYear.append('text').text(yearNumber);
        }

        item.values.forEach((metric, index) => {
          let sumPreviousValues = 0;
          let i = 0;
          while (i < index) {
            sumPreviousValues += item.values[i].value;
            i += 1;
          }

          const currentY = y(metric.value)! - (chartHeight - y(sumPreviousValues)!);

          const currentColor =
            props.valuesType === STACK_VALUES_TYPE.one
              ? ALONE_COLOR
              : COHORT_COLORS[getIndexColor(index)];

          const stackItem = g
            .append('g')
            .attr('class', cn('StackItem', `StackItem-${metric.metricName}`));

          const heightItem = chartHeight - y(metric.value)!;

          const rect = stackItem
            .append('rect')
            .attr('class', `metric-${metric.metricName}`)
            .attr('y', () => {
              return isFirstRender ? chartHeight : currentY;
            })
            .attr('width', stackWidth)
            .attr('transform', () => {
              return `translate(-${stackWidth / 2}, 0)`;
            })
            .attr('fill', currentColor)
            .attr('height', () => {
              if (isFirstRender || metric.value === 0) {
                return 0;
              }
              return heightItem;
            });

          rect
            .transition()
            .duration(1500)
            .attr('height', () => {
              if (metric.value === 0) {
                return 0;
              }
              return heightItem;
            })
            .attr('y', currentY);

          if (props.valuesType === STACK_VALUES_TYPE.multiple) {
            // добавляем подпись к вкладу в столбец
            /** длина текста значения вклада */
            if (metric.value !== 0 && heightItem >= 11) {
              const formatMetricValue = formatToThousands(metric.value);
              const lengthValue = getLengthValue(formatMetricValue);

              const fontClass = WHITE_FONT.includes(getIndexColor(index))
                ? 'rect-value--white'
                : 'rect-value--black';

              const classNames = [
                cn('rect-value'),
                cn(`rect-value-${metric.metricName}`),
                cn(`rect-value-${item.date}`),
                cn(fontClass),
              ];

              if (lengthValue + 4 < stackWidth) {
                const d3Text = addText(
                  stackItem,
                  formatToThousands(metric.value),
                  currentY,
                  lengthValue,
                  heightItem / 2,
                  classNames,
                );

                const nodeText = d3Text.node();

                const computedWidth = nodeText && nodeText.getComputedTextLength();

                const computedHeight =
                  nodeText &&
                  nodeText.getBoundingClientRect &&
                  nodeText.getBoundingClientRect().height;

                if (computedWidth && computedHeight) {
                  const translateY = heightItem / 2 + computedHeight / 2;
                  d3Text.attr('transform', `translate(-${computedWidth / 2}, ${translateY - 2})`);
                }
                d3Text.attr('display', 'none');
              }
            }
          }
        });

        // добавляем подпись к столбику
        /** длина текста значения столбика */
        if (visibleStackDataSum[itemIndex] !== 0) {
          const length = getLengthValue(formatValues[itemIndex]);
          const classNameForSumCohort = [cn('MetricValue'), cn(`MetricValue--${item.date}`)];
          if (!isShowSumCohortValue) {
            classNameForSumCohort.push(cn('MetricValue--disabled'));
          }

          const d3Text = addText(
            g,
            formatValues[itemIndex],
            y(visibleStackDataSum[itemIndex])!,
            length,
            -10,
            classNameForSumCohort,
          );

          const nodeText = d3Text.node();

          const computedWidth = nodeText && nodeText.getComputedTextLength();
          if (computedWidth) {
            d3Text.attr('transform', `translate(-${computedWidth / 2}, -6)`);
          }

          d3Text.attr('opacity', () => {
            if (isFirstRender) {
              return 0;
            }
            return 1;
          });
          d3Text
            .transition()
            .duration(2500)
            .attr('opacity', 1);
        }
      });

      if (props.componentId === COHORT_ONE_CHART) {
        // отрисовка линейного графика по точкам
        createLineByPoint({
          data: (visibleData as Array<any>).map((elem, index) => ({
            ...elem,
            value: visibleStackDataSum[index],
          })) as Data,
          svg,
          width,
          height: chartHeight,
          cn,
          countFromZero: true,
          chartType: props.chartType,
          periodType: props.currentPeriod,
          onHover: handleHoverLine,
          chartRef,
        });
      }

      if (isFirstRender) {
        setIsFirstRender(false);
      }
    },
    [
      offsetRight,
      chartHeight,
      fullHeight,
      offsetHeight,
      props.currentPeriod,
      props.chartType,
      props.eventsRef,
      props.onlyOneYear,
      props.setEventTooltipParams,
      props.showEvents,
      props.chartData,
      props.componentId,
      props.valuesType,
      memoizedEventHover,
      isFirstRender,
      highlightColumn,
      handleHoverLine,
    ],
  );

  const prevVisibleStackData = usePrevious(visibleStackData);

  useEffect(() => {
    /** когда количество когорт не вмещается в ширину графика и появляется навигация по дате внизу,
     * график рендерится два раза(с полными значениями из props.chartData и текущими из visibleStackData),
     * так как в useResize передаётся изменяющийся стейт valuesXScale
     * чтобы этого избежать, добавляем два условия на рендер графика
     * 1) - prevVisibleStackData.length === visibleStackData.length - будут равны, после установки
     *    valuesXScale, так как после меняется стейт isResizing
     *    - valuesXScale.to !== chartData.length || valuesXScale.from !== 0 - условие наличия стрелок
     * 2) visibleStackData.length === chartData.length && valuesXScale.to === chartData.length -
     *    условие, когда общее количество когорт вмещается в текущую ширину графика
     */
    if (
      ((typeof prevIsResizing === 'undefined' && !isResizing) ||
        (prevIsResizing && prevIsResizing !== isResizing)) &&
      ((prevVisibleStackData &&
        prevVisibleStackData.length === visibleStackData.length &&
        (valuesXScale.to !== chartData.length || valuesXScale.from !== 0)) ||
        (visibleStackData.length === chartData.length && valuesXScale.to === chartData.length))
    ) {
      drawChart(visibleStackData);
    }
  }, [
    drawChart,
    isResizing,
    prevIsResizing,
    visibleStackData,
    prevVisibleStackData,
    valuesXScale.to,
    valuesXScale.from,
    chartData,
  ]);

  // ======================================================
  // Render
  // ======================================================
  function renderArrows(): React.ReactNode {
    const width = chartRef.current ? getWidthChart(chartRef.current.clientWidth) - offsetRight : 0;
    return (
      <div
        className={cn('XScaleArrows', {
          'XScaleArrows--with-legend': props.hasLegend,
        })}
        style={{ width: width + 50 }}
      >
        <div
          className={cn('XScaleArrowWrapper', {
            'XScaleArrowWrapper--disabled': disabledLeftArrow,
          })}
          onClick={handleClickLeftArrow}
          role="presentation"
        >
          <Icon
            className={cn('XScaleArrow', 'XScaleArrow--from')}
            name="ArrowsDownIcon"
            color="var(--blue)"
          />
        </div>
        <div
          className={cn('XScaleArrowWrapper', {
            'XScaleArrowWrapper--disabled': disabledRightArrow,
          })}
          onClick={handleClickRightArrow}
          role="presentation"
        >
          <Icon
            className={cn('XScaleArrow', 'XScaleArrow--to')}
            name="ArrowsDownIcon"
            color="var(--blue)"
          />
        </div>
      </div>
    );
  }

  const conditionForRenderLegend = useMemo(() => {
    return (
      (prevVisibleStackData &&
        prevVisibleStackData.length === visibleStackData.length &&
        (valuesXScale.to !== chartData.length || valuesXScale.from !== 0)) ||
      (visibleStackData.length === chartData.length && valuesXScale.to === chartData.length)
    );
  }, [
    prevVisibleStackData,
    visibleStackData.length,
    valuesXScale.to,
    valuesXScale.from,
    chartData.length,
  ]);

  return (
    <>
      <div className={cn('ChartWrapper', 'StackedChart')} ref={getChartWrapperRef}>
        {isResizing && <Loading className={cn('Loading')} />}
        {!isResizing && prevVisibleStackData && <div className={cn('Chart')} ref={getChartRef} />}
        {props.eventTooltipParams.isShown && (
          <Tooltip
            content={props.eventTooltipParams.content}
            style={props.eventTooltipParams.style}
            onHover={memoizedEventHover}
            onRowClick={props.onEventClick}
            params={props.setEventTooltipParams}
          />
        )}
        {!isResizing && props.hasLegend && legendData && conditionForRenderLegend && (
          <Legend legendData={legendData} onMouseEventColor={handleMouseEventColor} />
        )}
        {!isResizing &&
          prevVisibleStackData &&
          countTickFitXScale < chartData.length &&
          renderArrows()}
      </div>
    </>
  );
};

export default withEventsData(StackedChart);
