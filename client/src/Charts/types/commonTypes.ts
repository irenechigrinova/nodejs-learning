import React from "react";
import { FilterCondition } from "ts-types/base-types";
import { FilterFields } from "ts-types/field-types";
import { Dimension } from "containers/StatisticsTable/Dimensions/types";
import { SegmentSet } from "containers/StatisticsTable/types";
import { TimePeriods } from "ts-types/periods-types";
import { DataStatuses } from "ts-types/status-types";
import { DashboardFilter } from "containers/Filter/types";

export type LinearChartData = {
  id: string;
  columnName: string;
  columnType?: string;
  isMain: boolean;
  unit?: string;
  data: {
    value: number;
    date: string | number;
    metricName: string;
    id: string;
    initialDate?: string;
    isSecondPeriod?: boolean;
  }[];
}[];

export type DonutChartData = {
  columns: { id: string; name: string; type?: string }[];
  data: {
    id: string;
    name: string;
    values: (number | string)[];
  }[];
  usePercent: boolean;
};

export type Period = "hour" | "day" | "week" | "month" | "dayOfWeek";
export type ChartType =
  | "linear"
  | "area"
  | "donut"
  | "bar"
  | "trend"
  | "double-donut"
  | "stack";

export type DataItem = {
  value: number | null;
  date: string | number | Date | null;
  metricName: string;
  id: string;
  isSecondPeriod?: boolean;
  initialDate?: string;
};

export type Data = DataItem[];

export type TooltipContent = {
  titleLeft: string;
  titleRight?: string;
  rows: {
    id: number | string;
    color: string;
    circleColor?: string;
    title: string;
    value?: number;
  }[];
};

export type EventData = {
  id: null | number;
  name: string;
  description: string;
  color: string;
  dateFrom: string;
  dateTo: string;
  partyName: string;
  isAllowEdit: boolean;
};

export type MetricItem = {
  id: number;
  name: string;
  nameInGroup: string;
  description: string;
  isPinned: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  section: string | null;
  dependentMetricId?: number;
};

export interface Metric {
  name: string;
  id: string;
  isDisabled: boolean;
  description: null | string;
  metrics: Array<MetricItem>;
}
export interface MetricSet {
  id: number;
  name: string;
  type: string;
  metricItemIds: number[];
}

export interface MetricData {
  metricTypes: Metric[];
  sets: MetricSet[];
  settings: {
    metricId: number;
    sort: number;
  }[];
  defaultSortField: string;
}

export interface MetricPopoverDataGroup {
  name: string;
  description: string | null;
  isDisabled: boolean;
  id: string;
  metrics: {
    dependentMetricId: number | null;
    id: number;
    name: string;
    description: string | null;
    isSelected: boolean;
    isPinned: boolean;
    isDisabled: boolean;
    nameInGroup: string;
    section: string;
  }[];
}

export interface MetricPopoverData {
  metricTypes: MetricPopoverDataGroup[];
  sets: MetricSet[];
  settings: { metricId: number; sort: number }[];
  defaultSortField: string;
}

export interface Event {
  date: string;
  eventList: {
    id: number;
    name: string;
    color: string;
  }[];
}

export interface ChartContext {
  pageId: string;
  componentId: number;
  valuesType?: StackValuesType;
  offsetHeight?: number;
  onlyOneYear?: boolean;
  metricData: MetricData | MetricPopoverData;
  selectedMetrics: Array<number>;
  isTitleEditable?: boolean;
  dataLoading: boolean;
  settingsLoading: boolean;
  isLoadingAddSet: boolean;
  isLoadingSaveSet: boolean;
  chartName: string;
  eventTogglerIsActive: boolean;
  addEventTogglerIsActive: boolean;
  hasPeriods: boolean;
  hasLegend: boolean;
  hasToolbar: boolean;
  minPeriod: Period;
  periods: Array<{ value: Period; text: string; disabled: boolean }>;
  currentPeriod: Period;
  chartData: LinearChartData | DonutChartData;
  legendDataByDate?: Array<{
    metricId: string;
    date: string;
  }>;
  events: Array<Event> | null;
  chartType: ChartType;
  useCustomizer: boolean;
  useDimensions?: boolean;
  useOwnFilter?: boolean;
  canHide?: boolean;
  chartIsHidden: boolean;
  showEvents: boolean;
  isTechAndDevice: boolean;
  filterOptions?: DashboardFilter;
  dimensions: Array<Dimension>;
  openedPopover: string | null;
  actionPopover: Function;
  disableToolbarConversion?: boolean;
  color?: string;
  height?: number;
  timePeriods: TimePeriods | null;
  toolbarHandlers: any;
  onCompleteTitleEdit: (value: string) => void;
  onUpdateEvents: (events: Event[]) => void;
  disabledMetrics: {
    lastSetIndex: number | null;
    lastSetId: string | null;
    metrics: string[];
    componentMetrics: string[];
  };
  updateAttributionModelStatuses: DataStatuses;
  setDisabledMetrics: Function;
  onToggleChart: () => void;
  onToggleEvents: () => void;
}

export type StackValuesType = "one" | "multiple";

export interface ChartProps {
  chartName: string;
  pageId: string;
  componentId: number;
  siteId: number;
  valuesType?: StackValuesType;
  offsetHeight?: number;
  accountId?: number;
  reducerId: string;
  filterId?: string;
  tableReducerId?: string;
  chartType: string;
  minPeriod?: Period;
  onlyOneYear: boolean;
  selectedPeriod?: {
    value: string;
    text: string;
    disabled: boolean;
  };
  legendDataByDate?: Array<{
    metricId: string;
    date: string;
  }>;
  hasPeriods: boolean;
  hasLegend: boolean;
  canHide?: boolean;
  chartIsHidden: boolean;
  showEvents: boolean;
  isTechAndDevice?: boolean;
  dimensions: Array<Dimension>;
  generalMetrics?: MetricPopoverData | null;
  disableToolbarConversion?: boolean;
  defaultSelectedMetrics?: Array<number>;
  height?: number;
  hasToolbar?: boolean;
  color?: string;
  useOwnFilter?: boolean;
  ownFilterValues?: Array<{
    paramAlias: string;
    valueId: string;
    value: string;
  }>;
  useCustomizer?: boolean;
  usePercent?: boolean;
  // Использовать dimensions которые получает график от запроса настроек. иначе будет использовать
  // dimensions таблиы (если они есть)
  useDimensions?: boolean;
  topDimension?: string;
  currentPeriod?: Period;
  filterOptions?: {
    reducerId: string;
    selectedFilters: {
      paramAlias: string;
      valueId: string;
      value: string;
    }[];
    filterFields: FilterFields;
    filterReportId: number;
    filterPopoverId: string;
  };
  ownSettings?: {
    dateTypes: any[];
    dimensions: Dimension[];
    metricData: MetricData;
  };
  id?: number;
  isTitleEditable?: boolean;
  isUpdatedDashboard?: boolean;
  updateAttributionModelStatuses: DataStatuses;
  onChangeProperties?: Function;
  onApplyFilter?: Function;
  onCompleteTitleEdit?: Function;

  // From redux
  metricData: MetricData | MetricPopoverData;
  segmentSet?: SegmentSet;
  timePeriods: TimePeriods;
  filter: {
    settings: { [field: string]: any };
    conditions: { [field: string]: string };
  };
  chartData: LinearChartData;
  userSelectedMetric?: number | null;
  selectedMetrics: Array<number>;
  actionGetSettings: Function;
  actionGetData: Function;
  actionResetSettings: Function;
  actionChangeSelectedMetrics: Function;
  actionUpdateDashboardMetrics: Function;
  actionChangeDimensionsOrder: Function;
  actionUpdateSelectedMetrics: Function;
  actionCreateMetricSet: Function;
  actionRemoveMetricSet: Function;
  actionUpdateMetricSet: Function;
  actionUpdateUserSettings: Function;
  actionUpdateEvents: Function;
  getSettingsStatuses: DataStatuses;
  getDataStatuses: DataStatuses;
  createMetricSetStatuses: DataStatuses;
  updateMetricSetStatuses: DataStatuses;
  actionPopover: Function;
  openedPopover: string | null;
}
