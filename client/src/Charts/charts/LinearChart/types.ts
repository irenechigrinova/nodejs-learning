import {
  Event as EventType,
  ChartContext,
  Data,
  TooltipContent,
} from 'containers/D3Charts/types/commonTypes';

export type ChartData = {
  id: string;
  columnName: string;
  columnType?: string;
  columnRound?: number;
  isMain: boolean;
  data: Data;
  unit?: string;
  maxMetricValue?: number;
  minMetricValue?: number;
}[];

export type LegendData = {
  titles: {
    name: string;
    type: string;
  }[];
  columns: {
    columnName: string;
    metrics: { id: string; name: string; isMain: boolean }[];
  }[];
};

export type TooltipStyle = {
  left: string | number;
  right: string | number;
  top: string | number;
  bottom: string | number;
};

export type TooltipParams = {
  isShown: boolean;
  style: TooltipStyle | null;
  content?: TooltipContent;
};

export type DataType = {
  mappedData: ChartData;
  groupedData: {
    group: {
      key: string;
      values: Data;
      isMain: boolean;
      type?: string;
    }[];
  }[];
  filteredData: ChartData;
  initialData: ChartData;
  initialGroupedData: {
    group: {
      key: string;
      values: Data;
      isMain: boolean;
      type?: string;
    }[];
  }[];
};

export type ChartTooltip = {
  isShown: boolean;
  left: number | null;
  xValue: number | string | Date;
  tooltips: TooltipContent[];
};

export interface LinearChartProps extends ChartContext {
  firstRender: boolean;
  setFirstRender: (value: boolean) => void;
  changeDisabledMetrics: (index: number, metricId: string) => void;
  tooltipParams: ChartTooltip;
  setTooltipParams: (params: ChartTooltip) => void;
  data: DataType;
  legendData: LegendData;
  periodHasEvents: boolean;
  disabledMetrics: {
    lastSetIndex: number | null;
    lastSetId: string | null;
    metrics: string[];
    componentMetrics: string[];
  };
  setDisabledMetrics: Function;
}
export interface ChartPropsWithEventType extends ChartContext {
  onEventClick: (eventId: number | string | null) => void;
  periodHasEvents: boolean;
  eventTooltipParams: TooltipParams;
  setEventTooltipParams: (params: TooltipParams) => void;
  eventsTooltipTimer: React.MutableRefObject<number | undefined>;
  eventsRef: React.RefObject<EventType[]>;
}
