import React, { useState, useContext, useEffect } from 'react';
import { nest } from 'd3';
import { isEqual } from 'lodash';

import { mapData, generateLegendData } from '../helpers/format-helpers';
import DataContext from '../../../context/DataContext';

import usePrevious from 'hooks/usePrevious';

import {
  TooltipParams,
  DataType,
  ChartData,
  LinearChartProps,
  ChartPropsWithEventType,
  ChartTooltip,
  LegendData,
} from '../types';

import {
  Event as EventType,
  ChartContext,
  Period,
  LinearChartData,
  DataItem,
} from 'containers/D3Charts/types/commonTypes';

const defaultTooltipParams = { isShown: false, left: null, xValue: '', tooltips: [] };

function updateData(
  data: ChartData,
  disabledMetrics: string[],
  period: Period | undefined = 'day',
): DataType {
  const initialData = data;
  const mappedData = mapData(data, period);
  const filteredData = mappedData.map(item => {
    return {
      ...item,
      data: item.data.filter(({ id }) => !disabledMetrics.includes(id)),
    };
  });
  const groupedData = filteredData.map(item => {
    const group = nest()
      .key(d => (d as DataItem).id)
      .entries(item.data)
      .map(groupItem => ({ ...groupItem, isMain: item.isMain, type: item.columnType }));
    return { group };
  });

  const initialGroupedData = mappedData.map(item => {
    const group = nest()
      .key(d => (d as DataItem).id)
      .entries(item.data)
      .map(groupItem => ({ ...groupItem, isMain: item.isMain, type: item.columnType }));
    return { group };
  });

  return {
    initialData,
    initialGroupedData,
    mappedData,
    filteredData,
    groupedData,
  };
}

const withData = (
  BaseComponent: React.FunctionComponent<LinearChartProps & ChartPropsWithEventType>,
) => (ownProps: {
  onEventClick: (eventId: number | null | string) => void;
  periodHasEvents: boolean;
  disabledMetrics: {
    lastSetIndex: number | null;
    lastSetId: string | null;
    metrics: string[];
    componentMetrics: string[];
  };
  setDisabledMetrics: Function;
  eventTooltipParams: TooltipParams;
  setEventTooltipParams: (params: TooltipParams) => void;
  eventsTooltipTimer: React.MutableRefObject<number | undefined>;
  eventsRef: React.RefObject<EventType[]>;
}): React.ReactElement => {
  const props: ChartContext = useContext(DataContext);
  const prevData = usePrevious(props.chartData);

  const [firstRender, setFirstRender] = useState<boolean>(true);

  const [tooltipParams, setTooltipParams] = useState<ChartTooltip>(defaultTooltipParams);

  const [data, setData] = useState<DataType>(
    updateData(
      props.chartData as LinearChartData,
      ownProps.disabledMetrics.metrics,
      props.currentPeriod,
    ),
  );
  const [legendData] = useState<LegendData>(generateLegendData(props.chartData as LinearChartData));

  useEffect(() => {
    if (prevData && !isEqual(prevData, props.chartData)) {
      const newData = updateData(
        props.chartData as LinearChartData,
        ownProps.disabledMetrics.metrics,
        props.currentPeriod,
      );
      setData(newData);
    }
  }, [ownProps.disabledMetrics.metrics, prevData, props.chartData, props.currentPeriod]);

  function changeDisabledMetrics(index: number, metricId: string): void {
    ownProps.setDisabledMetrics(prevMetrics => {
      const newMetrics = {
        ...prevMetrics,
        lastSetIndex: index,
        lastSetId: metricId,
        metrics: prevMetrics.metrics.includes(metricId)
          ? prevMetrics.metrics.filter(metric => metric !== metricId)
          : [...prevMetrics.metrics, metricId],
      };
      const newData = updateData(
        props.chartData as LinearChartData,
        newMetrics.metrics,
        props.currentPeriod,
      );
      setData(newData);
      return newMetrics;
    });
  }

  return (
    <BaseComponent
      {...props}
      {...ownProps}
      firstRender={firstRender}
      setFirstRender={setFirstRender}
      changeDisabledMetrics={changeDisabledMetrics}
      tooltipParams={tooltipParams}
      setTooltipParams={setTooltipParams}
      data={data}
      legendData={legendData}
    />
  );
};

export default withData;
