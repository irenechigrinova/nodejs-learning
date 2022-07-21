import { min, max } from 'd3';
import { uniqBy } from 'lodash';

import { LegendData, ChartData } from '../types';
import { Data, DataItem, Period } from '../../../types/commonTypes';

import { setDate } from '../../../helpers/helpers';

/**
 * Преобразование второй шкалы к первой
 */
function convertValues(
  data: ChartData,
): {
  id: string;
  columnName: string;
  columnType?: string;
  isMain: boolean;
  data: Data;
} {
  const firstScaleMin =
    min(data[0].data, function(d) {
      return (d as DataItem).value;
    }) || 0;
  const firstScaleMax =
    max(data[0].data, function(d) {
      return (d as DataItem).value;
    }) || 0;
  const secondScaleMin =
    min(data[1].data, function(d) {
      return (d as DataItem).value;
    }) || 0;
  const secondScaleMax =
    max(data[1].data, function(d) {
      return (d as DataItem).value;
    }) || 0;

  return {
    ...data[1],
    data: data[1].data.map(item => {
      const convertedValue =
        ((item.value! - secondScaleMin) / (secondScaleMax - secondScaleMin)) *
          (firstScaleMax - firstScaleMin) +
        firstScaleMin;
      return {
        ...item,
        value: convertedValue < 1 ? convertedValue : Math.round(convertedValue),
      };
    }),
  };
}

/**
 * Преобразование входных данных для правильной отрисовки горизонтальной шкалы
 */
export function mapData(chartData: ChartData, period: Period): ChartData {
  const mappedData = chartData.map(item => ({
    ...item,
    data: item.data.map(d => ({
      ...d,
      date: setDate((d as DataItem).date!.toString(), period, item.data),
    })),
  }));
  return mappedData;
}

export function generateLegendData(data: ChartData): LegendData {
  const mappedData = data.map(item => {
    const uniqueMetrics = uniqBy(item.data, 'id');
    return {
      columnName: item.columnName,
      columnType: item.columnType!,
      metrics: uniqueMetrics.map(metric => ({
        id: metric.id,
        isMain: item.isMain,
        name: metric.metricName,
      })),
    };
  });
  const titles = [
    { name: 'Метрики', type: 'plain' },
    ...mappedData.map(item => ({ name: item.columnName, type: item.columnType })),
  ];
  const columns = mappedData[0].metrics.map((item, index) => {
    const secondMetric = mappedData.length > 1 ? mappedData[1].metrics[index] : null;
    return {
      columnName: item.name,
      metrics: secondMetric ? [item, secondMetric] : [item],
    };
  });
  return { titles, columns };
}
