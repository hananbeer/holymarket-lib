import type { EventData, EventDataWithoutMarkets, ListEventsQueryParams, RawApiPublicSearchParams, SearchParamsSimple } from './types';
import { canonicalizeEventData } from './helpers';
import { getRawEventsList, getRawEvent, getRawEventsListPage, getRawSearchEventsPage } from './gamma';

export async function getEvent(slugOrId: string): Promise<EventData> {
  const eventData = await getRawEvent(slugOrId);

  return canonicalizeEventData(eventData);
}

export async function* getEventsList(params: ListEventsQueryParams & { batchSize?: number }): AsyncGenerator<EventData> {
  for await (const event of getRawEventsList(params)) {
    yield canonicalizeEventData(event);
  }
}

export async function* getAllEventsActiveAndOpen(): AsyncGenerator<EventData> {
  return getEventsList({ active: true, closed: false });
}

export async function* getAllEventsUpdatedSince(
  params: {
  sinceTimestamp: number,
  closed?: boolean,
  seriesSlug?: string
}): AsyncGenerator<EventData> {
  // there is no way to limit by timestamp, so sort by updatedAt and stop when reached sinceTimestamp
  for await (const event of getEventsList({
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

export async function* getSearchEvents(params: SearchParamsSimple): AsyncGenerator<EventData> {
  const rawParams: RawApiPublicSearchParams = {
    q: params.query ?? " ",
    events_tag: params.tags,
    sort: params.sort,
    ascending: params.ascending,
  }

  let count = 0;
  let page = 0;
  const limit = params.limit ?? 10000;
  while (count < limit) {
    const response = await getRawSearchEventsPage({ ...rawParams, page });
    if (!response.events) {
      return;
    }

    for (const event of response.events) {
      yield canonicalizeEventData(event);
      count++;
    }

    if (!response.pagination.hasMore) {
      return;
    }

    page++;
  }
}
