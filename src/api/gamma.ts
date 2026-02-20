
import axios from 'axios';
import type { SeriesQueryParams, ListEventsQueryParams, RawApiSearchResults, RawApiEventData, RawApiSeriesData, RawApiPublicSearchParams, SearchParamsSimple, RawApiPublicSearchResponse } from './types';
import { POLYMARKET_DOMAIN } from './types';

let URL_GAMMA = `https://gamma-api.${POLYMARKET_DOMAIN}`;
// let URL_GAMMA = `http://localhost:8000`;

// TODO: this is so it can be proxified to bypass CORS
const http = axios.create({
  baseURL: URL_GAMMA,
  paramsSerializer: {
    indexes: null,
  },
});

export async function get<T>(url: string, params?: Record<string, object>): Promise<T> {
  const response = await http.get<T>(url, params);
  return response.data;
}

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
  return get<RawApiPublicSearchResponse>(`/public-search`, { params });
}

export async function getRawEventsListPage(params: ListEventsQueryParams): Promise<RawApiEventData[]> {
  const response = await http.get<RawApiEventData[]>(`/events`, { params });
  return response.data;
}

export async function* getRawEventsList(params: ListEventsQueryParams & { batchSize?: number }): AsyncGenerator<RawApiEventData> {
  let offset = 0;
  const set = new Set<string>();
  const limit = params.limit ?? 1000;
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

export async function getRawSeries(params: SeriesQueryParams): Promise<RawApiSeriesData[]> {
  const axiosParams: Record<string, string> = {};
  if (params.limit !== undefined) {
    axiosParams.limit = params.limit.toString();
  }
  if (params.offset !== undefined) {
    axiosParams.offset = params.offset.toString();
  }
  if (params.orderBy) { // TODO: can this can be passed as array?
    axiosParams.orderBy = params.orderBy.join(',');
  }
  if (params.ascending !== undefined) {
    axiosParams.ascending = params.ascending.toString();
  }
  if (params.closed) {
    axiosParams.closed = params.closed.toString();
  }
  const response = await http.get<RawApiSeriesData[]>(`/series`, { params: axiosParams });
  return response.data;
}

export async function getRawSeriesById(seriesId: string | number): Promise<RawApiSeriesData> {
  const response = await http.get<RawApiSeriesData>(`/series/${seriesId}`);
  return response.data;
}
