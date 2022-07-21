import React, { useContext } from 'react';
import classnames from 'classnames/bind';

// ======================================================
// Helpers and utils
// ======================================================

// ======================================================
// Redux and api
// ======================================================
import DataContext from '../../context/DataContext';

// ======================================================
// Components and css
// ======================================================
import DonutChart from '../DonutChart/DonutChart';

import styles from './DoubleDonutChart.module.scss';

// ======================================================
// Types
// ======================================================
import { ChartContext, DonutChartData, MetricPopoverData } from '../../types/commonTypes';

// ======================================================
// Static
// ======================================================
import { MAIN_COLORS } from '../../helpers/consts';

const cn: Function = classnames.bind(styles);

function setSelectedMetric(metricData: MetricPopoverData, selectedMetric: number | null): string {
  let selected = 'Абсолютное';
  metricData.metricTypes.forEach(group => {
    group.metrics.forEach(metric => {
      if (
        selectedMetric &&
        (selectedMetric === metric.id || selectedMetric === metric.dependentMetricId)
      ) {
        selected = metric.name;
      } else if (!selectedMetric && metric.isSelected) {
        selected = metric.name;
      }
    });
  });
  return selected;
}

// ======================================================
// Component
// ======================================================
const DoubleDonutChart: React.FunctionComponent = () => {
  const props: ChartContext = useContext(DataContext);

  function renderLegend(data: DonutChartData, title: string): React.ReactNode {
    return (
      <div className={cn('Legend')}>
        <h4 className={cn('Title')}>{`${title}: `}</h4>
        {data.data.map((item, index) => (
          <div className={cn('Data')} key={MAIN_COLORS[index]}>
            <div className={cn('Color')} style={{ backgroundColor: MAIN_COLORS[index] }} />
            <div className={cn('Name')}>{item.name}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('DoubleDonut')}>
      <div className={cn('Content')}>
        <div className={cn('Block')}>
          {renderLegend(
            props.chartData[0],
            setSelectedMetric(
              props.metricData as MetricPopoverData,
              props.selectedMetrics[0] || null,
            ),
          )}
          <DonutChart dataIndex={0} />
        </div>
        <div className={cn('Divider')} />
        <div className={cn('Block')}>
          {renderLegend(props.chartData[1], 'Сессии')}
          <DonutChart dataIndex={1} />
        </div>
      </div>
    </div>
  );
};

export default DoubleDonutChart;
