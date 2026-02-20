
import axios from 'axios';
import type { RawSeriesQueryParams, RawListEventsQueryParams, RawListMarketsQueryParams, RawApiSearchResults, RawApiEventData, RawApiSeriesData, RawApiMarketData, RawApiPublicProfileData, RawApiPublicSearchParams, SearchParamsSimple, RawApiPublicSearchResponse } from './types';
import { POLYMARKET_DOMAIN } from './types';

let URL_GAMMA = `https://gamma-api.${POLYMARKET_DOMAIN}`;

// TODO: this is so it can be proxified to bypass CORS
const http = axios.create({
  baseURL: URL_GAMMA,
  paramsSerializer: {
    indexes: null,
  },
});

export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await http.get<T>(url, { params });
  return response.data;
}

// EVENTS

export async function getRawEventBySlug(slug: string): Promise<RawApiEventData> {
  return get<RawApiEventData>(`/events/slug/${slug}`);
}

export async function getRawEventById(id: string): Promise<RawApiEventData> {
  return get<RawApiEventData>(`/events/${id}`);
}

export async function getRawEvent(slugOrId: string): Promise<RawApiEventData> {
  if (!isNaN(Number(slugOrId))) {
    return getRawEventById(slugOrId);
  }

  return getRawEventBySlug(slugOrId as string);
}

export async function getRawSearchEventsPage(params: RawApiPublicSearchParams): Promise<RawApiPublicSearchResponse> {
  return get<RawApiPublicSearchResponse>(`/public-search`, params);
}

export async function getRawEventsListPage(params: RawListEventsQueryParams): Promise<RawApiEventData[]> {
  return get<RawApiEventData[]>(`/events`, params);
}

export async function* getRawEventsList(params: RawListEventsQueryParams & { batchSize?: number }): AsyncGenerator<RawApiEventData> {
  let offset = 0;
  const set = new Set<string>();
  const limit = params.limit ?? Infinity;
  while (set.size < limit) {
    const batch = await getRawEventsListPage({
      ...params,
      limit: params.batchSize ?? 500,
      offset
    });

    if (batch.length === 0) {
      return;
    }

    for (const event of batch) {
      if (set.size >= limit) {
        return;
      }

      if (set.has(event.id)) {
        // apparently there are duplicates so dedup here
        continue;
      }

      set.add(event.id);
      yield event;
    }

    offset += batch.length;
  }
}

export async function getRawSeriesPage(params: RawSeriesQueryParams): Promise<RawApiSeriesData[]> {
  return get<RawApiSeriesData[]>(`/series`, params);
}

export async function getRawSeriesById(seriesId: string): Promise<RawApiSeriesData> {
  return get<RawApiSeriesData>(`/series/${seriesId}`);
}

// MARKETS

export async function getRawMarketsListPage(params?: RawListMarketsQueryParams): Promise<RawApiMarketData[]> {
  return get<RawApiMarketData[]>(`/markets`, params);
}

export async function* getRawMarketsList(params: RawListMarketsQueryParams & { batchSize?: number }): AsyncGenerator<RawApiMarketData> {
  let offset = 0;
  const set = new Set<string>();
  const limit = params.limit ?? Infinity;
  while (set.size < limit) {
    const batch = await getRawMarketsListPage({
      ...params,
      limit: params.batchSize ?? 500,
      offset
    });

    if (batch.length === 0) {
      return;
    }

    for (const market of batch) {
      if (set.size >= limit) {
        return;
      }

      if (set.has(market.id)) {
        // apparently there are duplicates so dedup here
        continue;
      }

      set.add(market.id);
      yield market;
    }

    offset += batch.length;
  }
}

export async function getRawMarketById(id: string): Promise<RawApiMarketData> {
  return get<RawApiMarketData>(`/markets/${id}`);
}

export async function getRawMarketBySlug(slug: string): Promise<RawApiMarketData> {
  return get<RawApiMarketData>(`/markets/slug/${slug}`);
}

export async function getRawMarket(slugOrId: string): Promise<RawApiMarketData> {
  if (!isNaN(Number(slugOrId))) {
    return getRawMarketById(slugOrId);
  }

  return getRawMarketBySlug(slugOrId as string);
}

// PROFILE

export async function getRawPublicProfileByAddress(address: string): Promise<RawApiPublicProfileData> {
  return get<RawApiPublicProfileData>(`/public-profile`, { address });
}
