import serverApiClient from 'api/server-api-client';

export const URLS = {
  urlGetData: '/sites/{siteId}/event/{eventId}/get',
  urlCreateEvent: '/sites/{siteId}/event/create',
  urlUpdateEvent: '/sites/{siteId}/event/{eventId}/update',
  urlDeleteEvent: '/sites/{siteId}/event/{eventId}/delete',
};

export function apiGetData(eventId: number): Promise<object> {
  return serverApiClient
    .post(URLS.urlGetData, null, { useErrorHandler: true, pathParams: { eventId } })
    .then(({ data }) => data);
}

export function apiSaveEvent(eventId: number | null, event: object): Promise<object> {
  const url = eventId ? URLS.urlUpdateEvent : URLS.urlCreateEvent;
  return serverApiClient
    .post(url, event, {
      useErrorHandler: true,
      type: 'json',
      pathParams: eventId ? { eventId } : null,
    })
    .then(({ data }) => data);
}

export function apiDeleteEvent(eventId: number): Promise<object> {
  return serverApiClient
    .post(URLS.urlDeleteEvent, null, { useErrorHandler: true, pathParams: { eventId } })
    .then(({ data }) => data);
}
