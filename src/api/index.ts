
import type { EventData, TokenPriceHistory, MarketPriceHistory, SeriesQueryParams, ListEventsQueryParams, UserPosition, UserTrade, RawApiSearchResults, RawApiEventData, UserValue, RawApiSeriesData } from './types';
import { canonicalizeEventData } from './helpers';
import { getRawAllEvents, getRawEvent, getRawEventsList, getRawEventsListPage, getRawSearchEvents } from './gamma';

export async function getEvent(slugOrId: string): Promise<EventData> {
  const eventData = await getRawEvent(slugOrId);

  return canonicalizeEventData(eventData);
}

export async function getEventsListPage(params: ListEventsQueryParams): Promise<EventData[]> {
  const rawEvents = await getRawEventsListPage(params);
  return rawEvents.map(canonicalizeEventData);
}

export async function* getAllEvents(params: ListEventsQueryParams & { batchSize?: number }): AsyncGenerator<EventData> {
  for await (const event of getRawAllEvents(params)) {
    yield canonicalizeEventData(event);
  }
}

export async function* getAllEventsActiveAndOpen(): AsyncGenerator<EventData> {
  return getAllEvents({ active: true, closed: false });
}

export async function* getAllEventsUpdatedSince(
  params: {
  sinceTimestamp: number,
  closed?: boolean,
  seriesSlug?: string
}): AsyncGenerator<EventData> {
  // there is no way to limit by timestamp, so sort by updatedAt and stop when reached sinceTimestamp
  for await (const event of getAllEvents({
    order: "updatedAt",
    ascending: false,
    closed: params.closed
  })) {
    if (!event.eventUpdateTimestamp || event.eventUpdateTimestamp <= params.sinceTimestamp) {
      return;
    }

    if (params.seriesSlug && event.seriesSlug !== params.seriesSlug) {
      continue;
    }

    yield event;
  }
}

export async function* getSearchEvents(query: string, tags?: string[], numPages: number = 1000, startPage: number = 0): AsyncGenerator<EventData> {
  for await (const event of getRawSearchEvents({ query, tags }, numPages, startPage)) {
    yield canonicalizeEventData(event); // TODO: events - markets
  }
}

export async function* getSearchEventsByTag(tag: string, numPages: number = 1, startPage: number = 0): AsyncGenerator<EventData> {
  // NOTE: this is hacky since must have some query but query=" " seems to work
  for await (const event of getSearchEvents(" ", tag ? [tag] : undefined, numPages, startPage)) {
    yield event;
  }
}
