import type { EventData, RawListEventsQueryParams, RawListMarketsQueryParams, RawApiPublicSearchParams, RawUserPositionsQueryParams, RawUserPosition, RawClosedPosition, RawUserClosedPositionsQueryParams, UserPortfolioValueQueryParams, UserValue, SearchParamsSimple, UserPositionsQueryParams, PublicProfileData, MarketData, UserTrade, UserTradesQueryParams, RawUserTradesQueryParams } from './types.js';
import { canonicalizeEventData, canonicalMarketData } from './helpers.js';
import { getRawEventsList, getRawEvent, getRawSearchEventsPage, getRawPublicProfileByAddress, getRawMarketsList, getRawMarket, getRawMarketsListPage, getRawMarketById, getRawMarketBySlug } from './gamma.js';
import { getRawUserPositions, getRawUserPortfolioValue, getRawUserTraded, getRawUserTrades } from './data.js';

///
/// GAMMA API
///

// EVENTS

export async function getEvent(slugOrId: string): Promise<EventData> {
  const eventData = await getRawEvent(slugOrId);

  return canonicalizeEventData(eventData);
}

export async function* getEventsList(params: RawListEventsQueryParams & { batchSize?: number }): AsyncGenerator<EventData> {
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

// MARKETS

export async function getMarketById(id: string): Promise<MarketData> {
  const marketData = await getRawMarketById(id);
  return canonicalMarketData(marketData);
}

export async function getMarketBySlug(slug: string): Promise<MarketData> {
  const marketData = await getRawMarketBySlug(slug);
  return canonicalMarketData(marketData);
}

export async function getMarket(slugOrId: string): Promise<MarketData> {
  const marketData = await getRawMarket(slugOrId);
  return canonicalMarketData(marketData);
}

export async function* getMarketsList(params: RawListMarketsQueryParams & { batchSize?: number }): AsyncGenerator<MarketData> {
  for await (const market of getRawMarketsList(params)) {
    yield canonicalMarketData(market);
  }
}

// PROFILE

export async function getPublicProfileByAddress(address: string): Promise<PublicProfileData> {
  // no changes to this endpoint
  return getRawPublicProfileByAddress(address);
}

///
/// DATA API
///

export async function* getUserPositions(params: UserPositionsQueryParams): AsyncGenerator<RawUserPosition> {
  // this mainly just renames params for clarity
  const rawParams: RawUserPositionsQueryParams = {
    user: params.address,
    market: params.conditionIds,
    sizeThreshold: params.sizeThreshold,
    redeemable: params.redeemable,
    mergeable: params.mergeable,
    limit: params.batchSize,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    title: params.title,
  };

  return getRawUserPositions(rawParams);
}

export async function getUserPortfolioValue(params: UserPortfolioValueQueryParams): Promise<number | undefined> {
  // basically rename and strip the response to scalar
  const response = await getRawUserPortfolioValue({ user: params.address, markets: params.conditionIds });
  return response?.[0]?.value;
}

export async function getUserTraded(address: string): Promise<number> {
  // basically rename and strip the response to scalar
  const response = await getRawUserTraded(address);
  return response.traded;
}

export async function* getUserTrades(params: UserTradesQueryParams & { batchSize?: number }): AsyncGenerator<UserTrade> {
  const rawParams: RawUserTradesQueryParams & { batchSize?: number } = {
    user: params.address,
    market: params.conditionIds,
    eventId: params.eventId,
    limit: params.limit,
    takerOnly: params.takerOnly,
    filterType: params.filterType,
    filterAmount: params.filterAmount,
    side: params.side,
    batchSize: params.batchSize,
  };

  for await (const rawTrade of getRawUserTrades(rawParams)) {
    const trade: UserTrade = {
      side: rawTrade.side,
      asset: rawTrade.asset,
      conditionId: rawTrade.conditionId,
      size: rawTrade.size,
      price: rawTrade.price,
      timestamp: rawTrade.timestamp,
      title: rawTrade.title,
      slug: rawTrade.slug,
      eventSlug: rawTrade.eventSlug,
      outcome: rawTrade.outcome,
      outcomeIndex: rawTrade.outcomeIndex,
      transactionHash: rawTrade.transactionHash,
    };
    yield trade;
  }
}

