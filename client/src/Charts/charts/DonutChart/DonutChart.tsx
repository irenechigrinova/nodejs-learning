import React, { useRef, useEffect, useContext, useState, useCallback, useMemo } from 'react';
import classnames from 'classnames/bind';
import { select, selectAll, arc, pie, interpolate } from 'd3';
import { useTranslation } from 'react-i18next';

// ======================================================
// Helpers and utils
// ======================================================
import DataContext from '../../context/DataContext';
import useResize from '../../hooks/useResize';
import usePrevious from 'hooks/usePrevious';

import formatToThousands from 'helpers/formatHelpers/formatToThousands';
import { calcSum, convertTime } from './helpers/data-helpers';
import { getCurrencySign } from 'pages/Reports/Journals/components/Table/helpers';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Loading } from '@calltouch/ct-ui-kit';
import Legend from './components/Legend/Legend';
import { Error } from 'components';

import styles from './DonutChart.module.scss';

// ======================================================
// Types
// ======================================================
import { ChartContext, DonutChartData, MetricPopoverData } from '../../types/commonTypes';
import * as d3Selection from 'd3-selection';

type ChartItem = {
  id: string;
  name: string;
  value: number;
  percent: string;
};

type ArcData = {
  data: ChartItem;
  index: number;
  value: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
};

interface Props {
  dataIndex?: number;
}

// ======================================================
// Static
// ======================================================
import { MARGINS, CHART_HEIGHT, MAIN_COLORS, ADDITIONAL_COLORS } from '../../helpers/consts';
import { TECH_AND_DEVICES } from 'consts/pages_ids';

const cn: Function = classnames.bind(styles);
const COLORS = [...MAIN_COLORS, ...ADDITIONAL_COLORS];
const MAX_NAME_LENGTH = 24;
const MAX_WIDTH = 500;

// CLASSES
const Svg = cn('Svg');
const Arc = cn('Arc');
const ArcEmpty = cn('Arc--empty');
const ArcSelected = cn('Arc--selected');
const Text = cn('Text');
const TextValue = cn('TextValue');
const TextPercent = cn('TextPercent');

// FUNCTIONS
function setData(initialData: DonutChartData, index: number): ChartItem[] {
  const sum = calcSum(initialData.data, index);
  return initialData.data.map(item => {
    const value = Number(item.values[index]);
    const percent =
      value === 0
        ? '0.00%'
        : `${formatToThousands((value / sum) * 100, {
            fixed: 2,
          })}%`;
    return {
      id: item.id,
      name: item.name,
      value,
      percent,
    };
  });
}

function setChartMetricName(metricData: MetricPopoverData, selectedMetrics: number[]): string {
  let selected = '';
  metricData.metricTypes.forEach(item => {
    item.metrics.forEach(metric => {
      if (selectedMetrics.length && metric.id === selectedMetrics[0]) {
        selected = metric.name;
      } else if (!selectedMetrics.length && metric.isSelected) {
        selected = metric.name;
      }
    });
  });
  return selected.length > MAX_NAME_LENGTH
    ? `${selected.substr(0, MAX_NAME_LENGTH - 3)}...`
    : selected;
}

// ======================================================
// Component
// ======================================================
const DonutChart: React.FunctionComponent<Props> = (ownProps: Props) => {
  const props: ChartContext = useContext(DataContext);

  const { t } = useTranslation('reports');

  const chartData = useMemo(() => {
    return ownProps.dataIndex || ownProps.dataIndex === 0
      ? props.chartData[ownProps.dataIndex]
      : props.chartData;
  }, [ownProps.dataIndex, props.chartData]);
  const type = useMemo(() => {
    return chartData.columns[ownProps.dataIndex || ownProps.dataIndex === 0 ? 0 : 1]?.type;
  }, [chartData.columns, ownProps.dataIndex]);
  const unit = useMemo(() => {
    return chartData.columns[ownProps.dataIndex || ownProps.dataIndex === 0 ? 0 : 1]?.unit;
  }, [chartData.columns, ownProps.dataIndex]);
  const round = useMemo(() => {
    return chartData.columns[ownProps.dataIndex || ownProps.dataIndex === 0 ? 0 : 1]?.round || 0;
  }, [chartData.columns, ownProps.dataIndex]);
  const currency = useMemo(() => {
    return type === 'currency' && unit ? ` ${getCurrencySign(unit)}` : '';
  }, [type, unit]);
  const isPercent = useMemo(() => {
    return type === 'percent';
  }, [type]);
  const valueIndex = useMemo(() => {
    return props.pageId === TECH_AND_DEVICES &&
      props.selectedMetrics[0] !== 1 &&
      !ownProps.dataIndex &&
      ownProps.dataIndex !== 0
      ? 1
      : 0;
  }, [ownProps.dataIndex, props.pageId, props.selectedMetrics]);
  const data = useMemo(() => {
    return setData(chartData as DonutChartData, valueIndex);
  }, [chartData, valueIndex]);
  const sum = useMemo(() => {
    return calcSum((chartData as DonutChartData).data, valueIndex);
  }, [chartData, valueIndex]);
  const fillData = useMemo(() => {
    return sum > 0
      ? data
      : data.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              value: 1,
            };
          }
          return item;
        });
  }, [data, sum]);
  const defaultInfo = useMemo(() => {
    return {
      id: '',
      name:
        props.pageId === TECH_AND_DEVICES && ownProps.dataIndex === 1
          ? 'Сессии'
          : setChartMetricName(props.metricData as MetricPopoverData, props.selectedMetrics),
      value: sum,
      percent: '100%',
    };
  }, [ownProps.dataIndex, props.metricData, props.pageId, props.selectedMetrics, sum]);
  const innerRadius = useMemo(() => {
    return props.height ? 40 : 60;
  }, [props.height]);

  const chartRef = useRef<HTMLDivElement>();
  const chartWrapperRef = useRef<HTMLDivElement>();

  const [selectedArcs, setSelectedArcs] = useState<ChartItem[]>([]);
  const [centerInfo, setCenterInfo] = useState<ChartItem>(defaultInfo);
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  const [isNegative, setIsNegative] = useState<boolean>(false);
  const [isResizing] = useResize();

  const prevSelected = usePrevious(selectedArcs);
  const prevIsResizing = usePrevious(isResizing);
  const prevNegative = usePrevious(isNegative);

  // ======================================================
  // Memoized handlers
  // ======================================================

  const memoizedHandleArcMouseEvent = useCallback(
    (
      node: d3Selection.Selection<SVGPathElement, any, any, any>,
      radius: number,
      direction: 'enter' | 'leave',
    ) => {
      const path = arc()
        .innerRadius(direction === 'enter' ? radius : radius - 10)
        .outerRadius(radius - innerRadius);
      node.transition().attr('d', (path as unknown) as string);

      if (selectedArcs.length === 0) {
        const arcData = direction === 'enter' ? node.data()[0].data : defaultInfo;
        setCenterInfo(arcData);
      }
    },
    [defaultInfo, innerRadius, selectedArcs.length],
  );

  // ======================================================
  // Memoized drawing
  // ======================================================
  const drawChart = useCallback(
    (donutData: ChartItem[]) => {
      if (!chartRef.current) {
        return;
      }

      select(chartRef.current).empty();

      const width = chartRef.current.clientWidth - MARGINS.left - MARGINS.right;
      const height = props.height ? props.height - 80 : CHART_HEIGHT;
      const svgWidth = width + MARGINS.left + MARGINS.right;
      const radius = props.height ? props.height / 2 - 40 : Math.min(width, MAX_WIDTH) / 2 - 50;

      const pieChart = pie()
        .sort(null)
        .value(function(d) {
          return ((d as unknown) as ChartItem).value;
        });
      const holeArc = arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - innerRadius);

      const svg = select(chartRef.current)
        .append('svg')
        .attr('class', Svg)
        .attr('width', svgWidth)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${svgWidth / 2},${height / 2})`);

      /** Арки из данных */
      const chartArc = svg
        .selectAll(`${Arc}`)
        .data(pieChart(donutData as any))
        .enter()
        .append('g')
        .attr('class', function(d, i) {
          return `${Arc} ${sum > 0 ? '' : ArcEmpty} arc-${((d as unknown) as ArcData).data.id} no-events`;
        });

      chartArc
        .append('path')
        .attr('d', holeArc as any)
        .attr('fill', function(d, i) {
          return sum > 0 ? COLORS[i] : '#fafafa';
        })
        .transition()
        .duration(1500)
        .attrTween('d', function(d) {
          const interpolated = interpolate(
            {
              startAngle: isFirstRender ? 0 : d.startAngle,
              endAngle: isFirstRender ? 0 : d.endAngle,
            },
            d,
          );
          return function(t) {
            return holeArc(interpolated(t) as any);
          } as any;
        })
        .on('end', function() {
          chartArc.classed('no-events', false);
        });

      chartArc
        .on('mouseenter', function() {
          if (!select(this).classed(ArcSelected) && sum > 0 && !select(this).classed('no-events')) {
            memoizedHandleArcMouseEvent(select(this).select('path'), radius, 'enter');
          }
        })
        .on('mouseleave', function() {
          if (!select(this).classed(ArcSelected) && sum > 0 && !select(this).classed('no-events')) {
            memoizedHandleArcMouseEvent(select(this).select('path'), radius, 'leave');
          }
        })
        .on('click', function() {
          if (sum > 0) {
            handleArcClick(select(this), radius);
          }
        });

      if (isFirstRender) {
        setIsFirstRender(false);
      }
    },
    [props.height, innerRadius, isFirstRender, sum, memoizedHandleArcMouseEvent],
  );

  // ======================================================
  // Effects
  // ======================================================
  useEffect(() => {
    if (
      (typeof prevIsResizing === 'undefined' && !isResizing) ||
      (prevIsResizing && prevIsResizing !== isResizing)
    ) {
      const hasNegative = chartData.data.some(item => item.values.some(number => number < 0));
      if ((hasNegative && hasNegative !== prevNegative) || isPercent) {
        setIsNegative(true);
      } else if (!hasNegative) {
        setIsNegative(false);
        drawChart(fillData);
      }
    }
  }, [drawChart, isResizing, prevIsResizing, fillData, t, prevNegative, isPercent, chartData]);

  useEffect(() => {
    if (prevSelected && prevSelected.length !== selectedArcs.length) {
      const width = chartRef.current!.clientWidth - MARGINS.left - MARGINS.right;
      const radius = props.height ? props.height / 2 - 40 : Math.min(width, MAX_WIDTH) / 2 - 50;
      selectAll(`.${Arc}`)
        .on('mouseenter', function() {
          if (!select(this).classed(ArcSelected) && sum > 0 && !select(this).classed('no-events')) {
            memoizedHandleArcMouseEvent(select(this).select('path'), radius, 'enter');
          }
        })
        .on('mouseleave', function() {
          if (!select(this).classed(ArcSelected) && sum > 0 && !select(this).classed('no-events')) {
            memoizedHandleArcMouseEvent(select(this).select('path'), radius, 'leave');
          }
        });
      if (selectedArcs.length > 0) {
        const sumValue = selectedArcs.reduce<number>((result, item) => {
          return result + item.value;
        }, 0);
        const percent = `${formatToThousands((sumValue / sum) * 100, {
          fixed: 2,
        })}%`;
        setCenterInfo({
          id: 'sum',
          name: 'Сумма по выбранным',
          value: sumValue,
          percent,
        });
      } else {
        setCenterInfo(defaultInfo);
      }
    }
  }, [selectedArcs, props.height, prevSelected, sum, memoizedHandleArcMouseEvent, defaultInfo]);

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

  function handleArcClick(
    clickedArc: d3Selection.Selection<SVGGElement, any, any, any>,
    radius: number,
  ): void {
    const arcData = (clickedArc.data()[0] as ArcData).data;
    const isSelected = clickedArc.classed(ArcSelected);
    clickedArc.classed(ArcSelected, !isSelected);
    const path = arc()
      .innerRadius(!isSelected ? radius : radius - 10)
      .outerRadius(radius - 60);

    clickedArc
      .select('path')
      .transition()
      .attr('d', (path as unknown) as string);

    setSelectedArcs(prevSelectedState => {
      if (!isSelected) {
        return [...prevSelectedState, arcData];
      }
      return prevSelectedState.filter(({ id }) => id !== arcData.id);
    });
  }

  // ======================================================
  // Render
  // ======================================================

  function renderInfo(info: ChartItem): React.ReactNode {
    if (!chartRef.current) {
      return null;
    }
    const width = chartRef.current.clientWidth - MARGINS.left - MARGINS.right;
    const radius = props.height ? props.height / 2 - 40 : Math.min(width, MAX_WIDTH) / 2 - 50;
    const formatted: string =
      type === 'currency'
        ? formatToThousands(info.value, { fixed: 2 })
        : formatToThousands(info.value, { fixed: round });
    const res: string =
      type === 'currency' && formatted.indexOf('.') === -1 ? `${formatted}.00` : formatted;
    return (
      <div className={cn('Info', { 'Info--small': !!props.height })} style={{ width: radius }}>
        <span className={Text}>{info.name}</span>
        <span className={TextValue}>
          {type === 'time' ? convertTime(info.value) : res}
          {type === 'currency' && currency}
        </span>
        <span className={TextPercent}>{info.percent}</span>
      </div>
    );
  }

  return (
    <div
      className={cn('ChartWrapper', 'Donut', {
        'Donut--centered': ownProps.dataIndex || ownProps.dataIndex === 0,
      })}
      ref={getChartWrapperRef}
    >
      <div
        className={cn('Block', {
          'Block--auto': !!props.height,
          'Block--full': isNegative || isPercent,
        })}
      >
        {isResizing && !isNegative && !isPercent && <Loading className={cn('Loading')} />}
        {!isResizing && !isNegative && !isPercent && (
          <div className={cn('Chart')} ref={getChartRef} />
        )}
        {!isResizing && sum > 0 && !isNegative && !isPercent && renderInfo(centerInfo)}
        {(isNegative || isPercent) && (
          <Error
            errorTitle={t('DonutChart.negativeTitle')}
            errorMessage={t('DonutChart.negativeMessage')}
          />
        )}
      </div>
      {props.hasLegend && !isNegative && !isPercent && (
        <div className={cn('Block', { 'Block--auto': !!props.height })}>
          <Legend
            data={chartData as DonutChartData}
            isTechAndDevice={props.isTechAndDevice}
            type={type}
            unit={currency}
            round={round}
          />
        </div>
      )}
    </div>
  );
};

export default DonutChart;
