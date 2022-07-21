import React, { useContext, useState, useEffect, useMemo } from "react";
import classnames from "classnames/bind";
import { uniqBy, intersection } from "lodash";

// ======================================================
// Helpers and utils
// ======================================================
import DataContext from "../context/DataContext";
import Notification from "helpers/notification";
import usePrevious from "hooks/usePrevious";

import {
  addEventHelper,
  updateEventHelper,
  deleteEventHelper,
} from "./events-helpers";

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Loading } from "@calltouch/ct-ui-kit";
import { Sidebar } from "components";

import Toolbar from "../components/Toolbar/Toolbar";
import LinearChart from "../charts/LinearChart/LinearChart";
import DonutChart from "../charts/DonutChart/DonutChart";
import BarChart from "../charts/BarChart/BarChart";
import DoubleDonutChart from "../charts/DoubleDonutChart/DoubleDonutChart";
import StackedChart from "../charts/StackedChart/StackedChart";

import Event from "../containers/Event/Event";

import styles from "./ChartLayout.module.scss";

// ======================================================
// Types
// ======================================================
import {
  ChartType,
  EventData,
  Event as EventType,
  ChartContext,
  LinearChartData,
  DonutChartData,
  Period,
} from "../types/commonTypes";

// ======================================================
// Static
// ======================================================
import { PAGES } from "../../../consts";

import { CHART_TYPES } from "consts";

type SidebarParams = {
  isOpened: boolean;
  eventId: number | null | string;
};

const cn: Function = classnames.bind(styles);

const defaultSidebarParams = {
  isOpened: false,
  eventId: null,
};

function addNewEvent(
  event: EventData,
  events: EventType[],
  period: Period,
  periodPoints: string[]
): EventType[] {
  const shortEvent = {
    id: event.id as number,
    name: event.name,
    color: event.color,
  };
  return addEventHelper(events, event, shortEvent, period, periodPoints);
}

function deleteEvent(eventId: number, events: EventType[]): EventType[] {
  return deleteEventHelper(events, eventId);
}

function updateEvent(
  updatedEvent: EventData,
  events: EventType[],
  period: Period,
  periodPoints: string[]
): EventType[] {
  const shortEvent = {
    id: updatedEvent.id as number,
    name: updatedEvent.name,
    color: updatedEvent.color,
  };
  return updateEventHelper(
    updatedEvent,
    shortEvent,
    events,
    period,
    periodPoints
  );
}

function checkEvents(
  events: null | EventType[],
  data: LinearChartData | DonutChartData
): boolean {
  if (
    !events ||
    (events && events.length === 0) ||
    !Array.isArray(data) ||
    (Array.isArray(data) && (!data[0] || !data[0].data))
  ) {
    return false;
  }
  if (events.every((event) => event.eventList.length === 0)) {
    return false;
  }
  const chartDates = uniqBy(data[0].data, "date").map(({ date }) => date);
  const eventsDates = events
    .filter((event) => event.eventList.length > 0)
    .map(({ date }) => date);
  return intersection(chartDates, eventsDates).length > 0;
}

// ======================================================
// Component
// ======================================================
const ChartLayout: React.FunctionComponent = () => {
  const props: ChartContext = useContext(DataContext);
  const prevEvents = usePrevious(props.events);

  const numOfScales = Array.isArray(props.chartData)
    ? props.chartData.length
    : 1;

  const { offsetHeight = 0 } = props;

  const [sidebarParams, setSidebarParams] =
    useState<SidebarParams>(defaultSidebarParams);
  const [addEventTogglerIsActive, setAddEventTogglerIsActive] =
    useState<boolean>(false);
  const [eventsHasChanges, setEventHasChanges] = useState<boolean>(false);
  const [periodHasEvents, setPeriodHasEvents] = useState<boolean>(
    checkEvents(props.events, props.chartData)
  );
  const isPeriodComparison = props.pageId === PAGES.ALL_SOURCES_COMPARISON;

  const events =
    props.events && !isPeriodComparison
      ? {
          eventTogglerIsActive: props.showEvents,
          addEventTogglerIsActive,
          onAddEvent: handleAddEvent,
          onToggleEvents: props.onToggleEvents,
        }
      : undefined;

  useEffect(() => {
    setPeriodHasEvents(checkEvents(props.events, props.chartData));
  }, [props.events, prevEvents, props.chartData]);

  function handleEventClick(eventId: number | null | string): void {
    setSidebarParams({ isOpened: true, eventId });
  }

  function handleAddEvent(): void {
    setSidebarParams({ isOpened: true, eventId: null });
    setAddEventTogglerIsActive(true);
  }

  function handleCloseSidebar(): void {
    if (eventsHasChanges) {
      Notification.notify(
        "Вы уверены, что хотите отменить введенные изменения? Событие не будет сохранено.",
        {
          onApply: handleCloseSidebarApply,
          onApplyText: "Да",
          onCancel: () => {},
          onCancelText: "Нет",
        }
      );
    } else {
      handleCloseSidebarApply();
    }
  }

  function handleCloseSidebarApply(): void {
    setSidebarParams({
      isOpened: false,
      eventId: null,
    });
    setEventHasChanges(false);
    setAddEventTogglerIsActive(false);
  }

  function handleCreateEvent(event: EventData): void {
    setSidebarParams((prevParams) => ({
      ...prevParams,
      eventId: event.id,
    }));
    const periodPoints =
      props.chartData && props.chartData[0] && props.chartData[0].data
        ? uniqBy((props.chartData as LinearChartData)[0].data, "date").map(
            ({ date }) => date as string
          )
        : [];
    const newEvents = addNewEvent(
      event,
      props.events!,
      props.currentPeriod,
      periodPoints
    );
    props.onUpdateEvents(newEvents);
  }

  function handleChangeEvent(hasChanges: boolean): void {
    setEventHasChanges(hasChanges);
  }

  function handleDeleteEvent(eventId: number): void {
    handleCloseSidebarApply();
    const newEvents = deleteEvent(eventId, props.events!);
    props.onUpdateEvents(newEvents);
  }

  function handleUpdateEvent(event: EventData): void {
    const periodPoints =
      props.chartData && props.chartData[0] && props.chartData[0].data
        ? uniqBy((props.chartData as LinearChartData)[0].data, "date").map(
            ({ date }) => date as string
          )
        : [];
    const newEvents = updateEvent(
      event,
      props.events!,
      props.currentPeriod,
      periodPoints
    );
    props.onUpdateEvents(newEvents);
  }

  function renderChart(
    chartType: ChartType,
    hasEvents: boolean
  ): React.ReactNode {
    if (
      (!props.chartData || !props.chartData[0]) &&
      ["bar", "stack"].includes(chartType)
    ) {
      return null;
    }
    switch (chartType) {
      default:
        return null;
      case "linear":
      case "area":
      case "trend":
        return (
          <LinearChart
            onEventClick={handleEventClick}
            periodHasEvents={hasEvents && !isPeriodComparison}
            disabledMetrics={props.disabledMetrics}
            setDisabledMetrics={props.setDisabledMetrics}
          />
        );
      case "donut":
        return <DonutChart />;
      case "bar":
        return <BarChart />;
      case "double-donut":
        return <DoubleDonutChart />;
      case "stack":
        return (
          <StackedChart
            onEventClick={handleEventClick}
            periodHasEvents={hasEvents}
          />
        );
    }
  }

  const heightLayout = useMemo(() => {
    if (props.chartType === CHART_TYPES.STACKED_CHART && props.height) {
      if (props.showEvents) {
        const offsetEvent = props.onlyOneYear ? 40 : 54;
        return props.height + offsetEvent;
      }
      return props.height + offsetHeight;
    }
    return props.height;
  }, [
    props.chartType,
    props.height,
    props.showEvents,
    props.onlyOneYear,
    offsetHeight,
  ]);

  if (props.canHide && props.chartIsHidden) {
    return (
      <div className={cn("Layout", "Layout--chart-hidden")}>
        <Toolbar events={events} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "Layout",
        `Layout--${props.chartType}`,
        props.showEvents && !isPeriodComparison
          ? `Layout--with-events-${numOfScales}`
          : "",
        !!props.events && !props.showEvents && !isPeriodComparison
          ? `Layout--events-hidden-${numOfScales}`
          : "",
        {
          "Layout--with-events": props.showEvents && !isPeriodComparison,
          "Layout--with-events-and-years":
            props.chartType === CHART_TYPES.STACKED_CHART && !props.onlyOneYear,
          "Layout--events-hidden":
            !!props.events && !props.showEvents && !isPeriodComparison,
          "Layout--no-legend": !props.hasLegend,
          "Layout--overflow-unset":
            !!props.height && props.chartType !== CHART_TYPES.STACKED_CHART,
        }
      )}
      style={props.height ? { height: heightLayout } : undefined}
    >
      {renderChart(props.chartType, false)}
    </div>
  );
};

export default ChartLayout;
