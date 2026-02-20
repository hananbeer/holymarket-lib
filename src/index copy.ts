import type { EventData, TokenPriceHistory, MarketPriceHistory, SeriesQueryParams, ListEventsQueryParams, UserPosition, UserTrade, RawApiSearchResults, RawApiEventData, UserValue } from './types';
import { canonicalizeEventData } from './helpers';
import { Side } from '@polymarket/clob-client';

const POLYMARKET_DOMAIN = 'polymarket.com';

export const ENDPOINTS = {
  GAMMA: `https://gamma-api.${POLYMARKET_DOMAIN}`,
  DATA: `https://data-api.${POLYMARKET_DOMAIN}`,
  CLOB: `https://clob.${POLYMARKET_DOMAIN}`,
  USER_PNL: `https://user-pnl-api.${POLYMARKET_DOMAIN}`,
  WEB: `https://${POLYMARKET_DOMAIN}/api`,
};

export async function fetchSeries(params: SeriesQueryParams): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }
  if (params.orderBy) {
    searchParams.append('orderBy', params.orderBy.join(','));
  }
  if (params.ascending !== undefined) {
    searchParams.append('ascending', params.ascending.toString());
  }
  if (params.closed) {
    searchParams.append('closed', params.closed.toString());
  }
  const url = `${ENDPOINTS.GAMMA}/series?${searchParams.toString()}`;
  const response = await fetch(url);
  return response.json();
}

export async function fetchSeriesById(seriesId: string | number): Promise<any> {
  const urlSeries = `${ENDPOINTS.GAMMA}/series/${seriesId}`;
  const response = await fetch(urlSeries);
  return response.json();
}

export async function fetchRawEventBySlug(slug: string): Promise<any> {
  const urlEvent = `${ENDPOINTS.GAMMA}/events/slug/${slug}`;
  const response = await fetch(urlEvent);
  return response.json();
}

export async function fetchRawEventById(id: string | number): Promise<any> {
  const urlEvent = `${ENDPOINTS.GAMMA}/events/${id}`;
  const response = await fetch(urlEvent);
  return response.json();
}

export async function fetchRawEvent(slugOrId: string | number): Promise<any> {
  if (!isNaN(Number(slugOrId))) {
    return fetchRawEventById(slugOrId);
  }

  return fetchRawEventBySlug(slugOrId as string);
}

// TODO: return errors instead of throwing? or allow null if event not found?
export async function fetchEvent(slugOrId: string | number): Promise<EventData> {
  // const queryTimestamp = Math.floor(Date.now() / 1000);
  const eventData = await fetchRawEvent(slugOrId);

  if ('error' in eventData) {
    throw new Error(`${slugOrId} error: ${eventData.error}`);
  }

  if (!eventData.markets) {
    throw new Error(`${slugOrId} no markets: ${JSON.stringify(eventData)}`);
  }

  return canonicalizeEventData(eventData);
}

export async function fetchCurrentPrice(tokenId: string | number, side: Side): Promise<number> {
  const response = await fetch(`${ENDPOINTS.CLOB}/price?token_id=${tokenId}&side=${side}`);
  const data = await response.json() as { price: string };
  return parseFloat(data.price);
}

export async function* fetchRawSearchEvents(query?: string, tags?: string[], numPages: number = 1, startPage: number = 0): AsyncGenerator<RawApiEventData> {
  if (!query) {
    // must be present but space seems to work well
    query = " ";
  }

  const params = new URLSearchParams({
    q: query,
    sort: "id",
    // keep_closed_markets: "1", // this flag does not work :\
    // ascending: "false",
  });
  if (tags) {
    tags.forEach(tag => params.append('events_tag', tag));
  }
  for (let i = 0; i < numPages; i++) {
    params.set('page', (startPage + i).toString());
    const url = `${ENDPOINTS.GAMMA}/public-search?${params.toString()}`;
    const response = (await (await fetch(url)).json()) as unknown as RawApiSearchResults;
    if (!response.pagination.hasMore) {
      break;
    }
    for (const event of response.events) {
      yield event;
    }
  }
}

export async function* fetchSearchEvents(query: string, tag?: string, numPages: number = 1000, startPage: number = 0): AsyncGenerator<EventData> {
  for await (const event of fetchRawSearchEvents(query, tag ? [tag] : undefined, numPages, startPage)) {
    yield canonicalizeEventData(event);
  }
}

export async function* fetchSearchEventsByTag(tag: string, numPages: number = 1, startPage: number = 0): AsyncGenerator<EventData> {
  // NOTE: this is hacky since must have some query but query=" " seems to work
  for await (const event of fetchSearchEvents(" ", tag, numPages, startPage)) {
    yield event;
  }
}

export async function fetchRawEventsList(params: ListEventsQueryParams): Promise<RawApiEventData[]> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.offset !== undefined) {
      searchParams.append('offset', params.offset.toString());
    }
    if (params.order) {
      searchParams.append('order', params.order);
    }
    if (params.ascending !== undefined) {
      searchParams.append('ascending', params.ascending.toString());
    }
    if (params.id && params.id.length > 0) {
      params.id.forEach(id => searchParams.append('id', id.toString()));
    }
    if (params.tag_id !== undefined) {
      searchParams.append('tag_id', params.tag_id.toString());
    }
    if (params.exclude_tag_id && params.exclude_tag_id.length > 0) {
      params.exclude_tag_id.forEach(id => searchParams.append('exclude_tag_id', id.toString()));
    }
    if (params.slug && params.slug.length > 0) {
      params.slug.forEach(slug => searchParams.append('slug', slug));
    }
    if (params.tag_slug) {
      searchParams.append('tag_slug', params.tag_slug);
    }
    if (params.related_tags !== undefined) {
      searchParams.append('related_tags', params.related_tags.toString());
    }
    if (params.active !== undefined) {
      searchParams.append('active', params.active.toString());
    }
    if (params.archived !== undefined) {
      searchParams.append('archived', params.archived.toString());
    }
    if (params.featured !== undefined) {
      searchParams.append('featured', params.featured.toString());
    }
    if (params.cyom !== undefined) {
      searchParams.append('cyom', params.cyom.toString());
    }
    if (params.include_chat !== undefined) {
      searchParams.append('include_chat', params.include_chat.toString());
    }
    if (params.include_template !== undefined) {
      searchParams.append('include_template', params.include_template.toString());
    }
    if (params.recurrence) {
      searchParams.append('recurrence', params.recurrence);
    }
    if (params.closed !== undefined) {
      searchParams.append('closed', params.closed.toString());
    }
    if (params.liquidity_min !== undefined) {
      searchParams.append('liquidity_min', params.liquidity_min.toString());
    }
    if (params.liquidity_max !== undefined) {
      searchParams.append('liquidity_max', params.liquidity_max.toString());
    }
    if (params.volume_min !== undefined) {
      searchParams.append('volume_min', params.volume_min.toString());
    }
    if (params.volume_max !== undefined) {
      searchParams.append('volume_max', params.volume_max.toString());
    }
    if (params.start_date_min) {
      searchParams.append('start_date_min', params.start_date_min);
    }
    if (params.start_date_max) {
      searchParams.append('start_date_max', params.start_date_max);
    }
    if (params.end_date_min) {
      searchParams.append('end_date_min', params.end_date_min);
    }
    if (params.end_date_max) {
      searchParams.append('end_date_max', params.end_date_max);
    }
  }

  const url = `${ENDPOINTS.GAMMA}/events?${searchParams.toString()}`;
  const response = await fetch(url);
  return response.json() as Promise<RawApiEventData[]>;
}

export async function fetchEventsBatch(params: ListEventsQueryParams): Promise<EventData[]> {
  const rawEvents = await fetchRawEventsList(params);
  return rawEvents.map(canonicalizeEventData);
}

export async function* fetchAllEvents(params: ListEventsQueryParams, batchSize: number = 500): AsyncGenerator<EventData> {
  let offset = 0;
  const map = {};

  while (true) {
    const batch = await fetchEventsBatch({
      ...params,
      limit: batchSize,
      offset
    });

    if (batch.length === 0) {
      return;
    }

    for (const event of batch) {
      if (map[event.id]) {
        // apparently there are duplicates so dedup here
        continue;
      }

      map[event.id] = event;
      yield event;
    }

    offset += batch.length;
  }
}

export async function* fetchAllEventsActiveAndOpen(): AsyncGenerator<EventData> {
  for await (const event of fetchAllEvents({ active: true, closed: false })) {
    yield event;
  }
}

export async function* fetchAllEventsUpdatedSince(sinceTimestamp: number = 0, closed?: boolean, seriesSlug?: string | number): AsyncGenerator<EventData> {
  for await (const event of fetchAllEvents({
    order: "updatedAt",
    ascending: false,
    closed
  })) {
    if (!event.eventUpdateTimestamp || event.eventUpdateTimestamp <= sinceTimestamp) {
      return;
    }

    if (seriesSlug && event?.seriesSlug !== seriesSlug) {
      continue;
    }

    yield event;
  }
}

export async function fetchRawMarketHistory(tokenId: string, fidelityMin: number = 60, timestampStart: number = 1): Promise<TokenPriceHistory[]> {
  const params = new URLSearchParams({
    market: tokenId,
    fidelity: fidelityMin.toString(),
    startTs: timestampStart.toString(),
  });
  const url = `${ENDPOINTS.CLOB}/prices-history?${params.toString()}`;
  const response = await fetch(url);
  const prices = await response.json() as MarketPriceHistory;
  return prices.history;
}

export async function fetchUserPositions(user: string, conditionIds: string[] = [], limit: number = 100, offset: number = 0): Promise<UserPosition[]> {
  const params = new URLSearchParams({
    user,
    sizeThreshold: '0.1',
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (conditionIds.length > 0) {
    params.append('market', conditionIds.join(','));
  }
  const url = `${ENDPOINTS.DATA}/positions?${params.toString()}`;
  const response = await fetch(url);
  return response.json() as Promise<UserPosition[]>;
}

export async function fetchAllUserPositions(user: string, conditionIds: string[] = [], batchSize: number = 100): Promise<UserPosition[]> {
  const positions: UserPosition[] = [];
  let offset = 0;

  while (true) {
    const batch = await fetchUserPositions(user, conditionIds, batchSize, offset);
    if (!batch || batch.length === 0) {
      break;
    }
    positions.push(...batch);
    offset += batchSize;
  }

  return positions;
}

export async function fetchUserTrades(user: string, eventId?: string, limit: number = 1000, offset: number = 0): Promise<UserTrade[]> {
  const params = new URLSearchParams({
    user,
    limit: limit.toString(),
    offset: offset.toString(),
    takerOnly: 'false',
  });
  if (eventId) {
    params.append('eventId', eventId);
  }
  const url = `${ENDPOINTS.DATA}/trades?${params.toString()}`;
  const response = await fetch(url);
  return response.json() as Promise<UserTrade[]>;
}

// TODO: yield
/*
this endpoint sorts by timestamps descending! so annoying!
meaning the pagination can be completely messed up
*/
export async function fetchAllUserTrades(user: string, eventId?: string, batchSize: number = 1000): Promise<UserTrade[]> {
  const trades: UserTrade[] = [];
  let batch: UserTrade[] = [];
  let chunk: UserTrade[] = [];
  let offset = 0;
  do {
    batch = await fetchUserTrades(user, eventId, batchSize, offset);
    if (!batch || batch.length === 0) {
      break;
    }

    // stupid logic to detect duplicates of stupid api
    for (let i = 0; i < batch.length; i++) {
      const incoming = batch[i];
      const existing = trades.find(t =>
        t.transactionHash === incoming.transactionHash &&
        t.asset === incoming.asset &&
        t.size === incoming.size &&
        t.price === incoming.price
      );

      if (existing) {
        batch[i].transactionHash = 'duplicate';
        console.warn('found duplicate');
      }
    }

    chunk = batch.filter(t => t.transactionHash !== 'duplicate');
    if (chunk.length === 0) {
      // strange api fr
      console.warn('???', trades.length);
      break;
    }
    trades.push(...chunk);
    offset += batchSize;
  } while (batch.length > 0);

  return trades;
}

export async function fetchUserPortfolioValue(user: string, markets?: string[]): Promise<UserValue[]> {
  const params = new URLSearchParams({
    user,
  });
  if (markets && markets.length > 0) {
    markets.forEach(market => params.append('market', market));
  }
  const url = `${ENDPOINTS.DATA}/value?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json() as { error: string };
    throw new Error(`Failed to fetch user value: ${error.error}`);
  }
  return response.json() as Promise<UserValue[]>;
}

// TODO: use token-utils. in fact no need both utils.ts and helpers.ts, just move the rest of this file to helpers.ts
export async function getUSDCBalance(address: string, rpcUrl?: string): Promise<number> {
  const url = rpcUrl ?? process.env.RPC_URL!;
  // const ALCHEMY_API_KEY = '..'; // TODO: get own api key
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'eth_call',
      params: [{
        data: `0x70a08231000000000000000000000000${address.replace('0x', '')}`, // balanceOf(address)
        to: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' // usdc.e contract
      }, 'latest'],
    }),
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${ALCHEMY_API_KEY}`,
    },
  });

  const data = await response.json() as { result: string };
  // TODO: error checks
  return Number(BigInt(data.result) / BigInt(1e6));
}
