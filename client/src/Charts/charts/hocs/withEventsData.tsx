import React, { useState, useContext, useRef } from 'react';

import DataContext from 'containers/D3Charts/context/DataContext';

import {
  ChartPropsWithEventType,
  TooltipParams,
} from 'containers/D3Charts/charts/LinearChart/types';

import { Event as EventType, ChartContext } from 'containers/D3Charts/types/commonTypes';

const defaultEventTooltipParams = { isShown: false, style: null };

const withEventsData = (
  BaseComponent: React.FunctionComponent<ChartPropsWithEventType>,
) => (ownProps: {
  onEventClick: (eventId: number | null | string) => void;
  periodHasEvents: boolean;
  disabledMetrics?: {
    lastSetIndex: number | null;
    lastSetId: string | null;
    metrics: string[];
    componentMetrics: string[];
  };
  setDisabledMetrics?: Function;
}): React.ReactElement => {
  const props: ChartContext = useContext(DataContext);

  const [eventTooltipParams, setEventTooltipParams] = useState<TooltipParams>(
    defaultEventTooltipParams,
  );

  const eventsTooltipTimer = useRef<number>();
  const eventsRef = useRef<EventType[]>(props.events);

  return (
    <BaseComponent
      {...props}
      {...ownProps}
      onEventClick={ownProps.onEventClick}
      periodHasEvents={ownProps.periodHasEvents}
      eventTooltipParams={eventTooltipParams}
      setEventTooltipParams={setEventTooltipParams}
      eventsTooltipTimer={eventsTooltipTimer}
      eventsRef={eventsRef}
    />
  );
};

export default withEventsData;
