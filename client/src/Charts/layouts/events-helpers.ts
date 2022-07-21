import moment from 'moment';

import { FULL_SYSTEM_FORMAT, SYSTEM_FORMAT } from 'helpers/date-helper';
import { Event as EventType, EventData, Period } from '../types/commonTypes';

type ShortEvent = {
  id: number;
  name: string;
  color: string;
};

type Interval = {
  from: string;
  to: string;
  fromMoment: moment.Moment;
  toMoment: moment.Moment;
};

function generateIntermediateDates(dateFrom: any, dateTo: any): string[] {
  const intermediateDates: string[] = [];
  let startDate = dateFrom;
  if (dateFrom.format(SYSTEM_FORMAT) !== dateTo.format(SYSTEM_FORMAT)) {
    while (startDate < dateTo) {
      intermediateDates.push(startDate.format(SYSTEM_FORMAT));
      startDate = startDate.add(1, 'day');
    }
    intermediateDates.push(dateTo.format(SYSTEM_FORMAT));
  } else {
    intermediateDates.push(dateTo.format(SYSTEM_FORMAT));
  }
  return intermediateDates;
}

function generateInterval(start: string, period: Period): Interval {
  const to =
    period === 'week'
      ? moment(start, SYSTEM_FORMAT).add(6, 'day')
      : moment(start)
          .add(1, 'M')
          .subtract(1, 'day');
  return {
    from: start,
    to: to.format(SYSTEM_FORMAT),
    fromMoment: moment(start, SYSTEM_FORMAT),
    toMoment: to,
  };
}

function generateMatchingIntervals(dateFrom, dateTo, intervals): Interval[] {
  const momentEventDateFrom = moment(dateFrom, SYSTEM_FORMAT);
  const momentEventDateTo = moment(dateTo, SYSTEM_FORMAT);
  return intervals.filter(interval => {
    return (
      interval.from === dateFrom ||
      interval.from === dateTo ||
      interval.to === dateTo ||
      interval.to === dateFrom ||
      (momentEventDateFrom.isAfter(interval.fromMoment) &&
        momentEventDateFrom.isBefore(interval.toMoment)) ||
      (momentEventDateTo.isAfter(interval.fromMoment) &&
        momentEventDateTo.isBefore(interval.toMoment)) ||
      (momentEventDateFrom.isBefore(interval.fromMoment) &&
        momentEventDateTo.isAfter(interval.toMoment))
    );
  });
}

function addEventForDay(
  event: EventData,
  shortEvent: ShortEvent,
  events: EventType[],
): EventType[] {
  const dateFrom = moment(event.dateFrom, FULL_SYSTEM_FORMAT);
  const dateTo = moment(event.dateTo, FULL_SYSTEM_FORMAT);
  const intermediateDates: string[] = generateIntermediateDates(dateFrom, dateTo);
  let updatedEvents: EventType[] = events;
  intermediateDates.forEach(date => {
    const existedEvent = updatedEvents.find(item => item.date === date);
    if (!existedEvent) {
      updatedEvents = [...updatedEvents, { date, eventList: [shortEvent] }];
    } else {
      updatedEvents = updatedEvents.map(item => {
        if (item.date === date) {
          return {
            ...item,
            eventList: [...item.eventList, shortEvent],
          };
        }
        return item;
      });
    }
  });
  return updatedEvents;
}

function addEventForInterval(
  event: EventData,
  shortEvent: ShortEvent,
  events: EventType[],
  period: Period,
  periodPoints: string[],
): EventType[] {
  const intervals = periodPoints.map(point => generateInterval(point, period));
  const matchingIntervals = generateMatchingIntervals(
    event.dateFrom.split(' ')[0],
    event.dateTo.split(' ')[0],
    intervals,
  );
  const matchingEvents = matchingIntervals.map(interval => {
    const intervalEvent = events.find(({ date }) => date === interval.from);
    if (intervalEvent) {
      return {
        ...intervalEvent,
        eventList: [...intervalEvent.eventList, shortEvent],
      };
    }
    return {
      date: interval.from,
      eventList: [shortEvent],
    };
  });
  const nonMatchingEvents = events.filter(
    ({ date }) => !matchingIntervals.find(({ from }) => from === date),
  );
  return [...matchingEvents, ...nonMatchingEvents];
}

function updateEventForDay(
  updatedEvent: EventData,
  shortEvent: ShortEvent,
  events: EventType[],
): EventType[] {
  const dateFrom = moment(updatedEvent.dateFrom, FULL_SYSTEM_FORMAT);
  const dateTo = moment(updatedEvent.dateTo, FULL_SYSTEM_FORMAT);
  const intermediateDates: string[] = generateIntermediateDates(dateFrom, dateTo);
  let updatedEvents: EventType[] = events;
  events.forEach((event, index) => {
    if (!intermediateDates.includes(event.date)) {
      const hasUpdatedEvent = event.eventList.find(({ id }) => id === updatedEvent.id);
      if (hasUpdatedEvent) {
        updatedEvents[index] = {
          ...event,
          eventList: event.eventList.filter(({ id }) => id !== updatedEvent.id),
        };
      }
    }
  });
  intermediateDates.forEach(date => {
    const existedEvent = updatedEvents.find(item => item.date === date);
    if (!existedEvent) {
      updatedEvents = [...updatedEvents, { date, eventList: [shortEvent] }];
    } else {
      updatedEvents = updatedEvents.map(item => {
        if (item.date === date) {
          if (item.eventList.find(({ id }) => id === updatedEvent.id)) {
            return {
              ...item,
              eventList: item.eventList.map(itemEvent => {
                if (itemEvent.id === updatedEvent.id) {
                  return shortEvent;
                }
                return itemEvent;
              }),
            };
          }
          return {
            ...item,
            eventList: [...item.eventList, shortEvent],
          };
        }
        return item;
      });
    }
  });
  return updatedEvents;
}

function updateEventForInterval(
  event: EventData,
  shortEvent: ShortEvent,
  events: EventType[],
  period: Period,
  periodPoints: string[],
): EventType[] {
  const intervals = periodPoints.map(point => generateInterval(point, period));
  const matchingIntervals = generateMatchingIntervals(
    event.dateFrom.split(' ')[0],
    event.dateTo.split(' ')[0],
    intervals,
  );
  const matchingEvents = matchingIntervals.map(interval => {
    const intervalEvent = events.find(({ date }) => date === interval.from);
    if (intervalEvent) {
      const hasEvent = intervalEvent.eventList.find(({ id }) => id === event.id);
      return {
        ...intervalEvent,
        eventList: hasEvent
          ? intervalEvent.eventList.map(item => {
              if (item.id === event.id) {
                return shortEvent;
              }
              return item;
            })
          : [...intervalEvent.eventList, shortEvent],
      };
    }
    return {
      date: interval.from,
      eventList: [shortEvent],
    };
  });
  const nonMatchingEvents = events
    .filter(({ date }) => !matchingIntervals.find(({ from }) => from === date))
    .map(item => ({
      ...item,
      eventList: item.eventList.filter(({ id }) => id !== event.id),
    }));
  return [...matchingEvents, ...nonMatchingEvents];
}

export function addEventHelper(
  events: EventType[],
  event: EventData,
  shortEvent: ShortEvent,
  period: Period,
  periodPoints: string[],
): EventType[] {
  if (period === 'day') {
    return addEventForDay(event, shortEvent, events);
  }
  return addEventForInterval(event, shortEvent, events, period, periodPoints);
}

export function updateEventHelper(
  updatedEvent: EventData,
  shortEvent: ShortEvent,
  events: EventType[],
  period: Period,
  periodPoints: string[],
): EventType[] {
  if (period === 'day') {
    return updateEventForDay(updatedEvent, shortEvent, events);
  }
  return updateEventForInterval(updatedEvent, shortEvent, events, period, periodPoints);
}

export function deleteEventHelper(events: EventType[], eventId: number): EventType[] {
  return events.map(item => {
    return {
      ...item,
      eventList: item.eventList.filter(({ id }) => id !== eventId),
    };
  });
}
