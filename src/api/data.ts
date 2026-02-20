import axios from 'axios';
import { POLYMARKET_DOMAIN } from './types';
import type { RawUserPosition, RawUserTrade, RawClosedPosition, RawActivity, RawTraded, RawTraderLeaderboardEntry, RawBuilderLeaderboardEntry, RawBuilderVolumeEntry, UserValue, RawMarketHistoryQueryParams, UserPositionsQueryParams, UserCashBalanceQueryParams, RawUserPositionsQueryParams, RawUserTradesQueryParams, RawUserPortfolioValueQueryParams, RawUserClosedPositionsQueryParams, RawUserActivityQueryParams, RawLeaderboardQueryParams, RawBuilderLeaderboardQueryParams, RawBuilderVolumeQueryParams } from './types';

let URL_DATA = `https://data-api.${POLYMARKET_DOMAIN}`;

const http = axios.create({
  baseURL: URL_DATA,
  paramsSerializer: {
    indexes: null,
  },
});

export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await http.get<T>(url, { params });
  return response.data;
}

export async function getRawUserPositionsPage(params: RawUserPositionsQueryParams): Promise<RawUserPosition[]> {
  return get<RawUserPosition[]>(`/positions`, params);
}

export async function* getRawUserPositions(params: RawUserPositionsQueryParams & { batchSize?: number }): AsyncGenerator<RawUserPosition> {
  let offset = 0;
  const limit = params.limit ?? Infinity;

  while (offset < limit) {
    const batch = await getRawUserPositionsPage({
      ...params,
      limit: params.batchSize ?? 500,
      offset,
    });

    if (!batch) {
      return;
    }

    for (const position of batch) {
      yield position;
    }

    offset += batch.length;
  }
}

export async function getRawUserTradesPage(params: RawUserTradesQueryParams): Promise<RawUserTrade[]> {
  return get<RawUserTrade[]>(`/trades`, params);
}

/*
this endpoint sorts by timestamps descending! so annoying!
meaning the pagination can be completely messed up. but the deduping should fix it!
*/
export async function* getRawUserTrades(params: RawUserTradesQueryParams & { batchSize?: number }): AsyncGenerator<RawUserTrade> {
  const set = new Set<string>();
  let offset = 0;
  const limit = params.limit ?? Infinity;

  while (offset < limit) {
    const batch = await getRawUserTradesPage({
      ...params,
      limit: params.batchSize ?? 150,
      offset,
    });

    if (!batch || batch.length === 0) {
      return;
    }

    for (const trade of batch) {
      const key = [trade.transactionHash, trade.asset, trade.size.toString(), trade.price.toString()].join(',');
      if (set.has(key)) {
        continue;
      }

      set.add(key);
      yield trade;
    }

    offset += batch.length;
  }
}

export async function getRawUserPortfolioValue(params: RawUserPortfolioValueQueryParams): Promise<UserValue[]> {
  return get<UserValue[]>(`/value`, params);
}

export async function getRawUserClosedPositionsPage(params: RawUserClosedPositionsQueryParams): Promise<RawClosedPosition[]> {
  return get<RawClosedPosition[]>(`/closed-positions`, params);
}

export async function* getRawUserClosedPositions(params: RawUserClosedPositionsQueryParams & { batchSize?: number }): AsyncGenerator<RawClosedPosition> {
  let offset = 0;
  const limit = params.limit ?? Infinity;

  while (offset < limit) {
    const batch = await getRawUserClosedPositionsPage({
      ...params,
      limit: params.batchSize ?? 50,
      offset,
    });

    if (!batch || batch.length === 0) {
      return;
    }

    for (const position of batch) {
      yield position;
    }

    offset += batch.length;
  }
}

export async function getRawUserActivityPage(params: RawUserActivityQueryParams): Promise<RawActivity[]> {
  return get<RawActivity[]>(`/activity`, params);
}

export async function* getRawUserActivity(params: RawUserActivityQueryParams & { batchSize?: number }): AsyncGenerator<RawActivity> {
  let offset = 0;
  const limit = params.limit ?? Infinity;

  while (offset < limit) {
    const batch = await getRawUserActivityPage({
      ...params,
      limit: params.batchSize ?? 500,
      offset,
    });

    if (!batch || batch.length === 0) {
      return;
    }

    for (const activity of batch) {
      yield activity;
    }

    offset += batch.length;
  }
}

export async function getRawUserTraded(address: string): Promise<RawTraded> {
  return get<RawTraded>(`/traded`, { user: address });
}

export async function getRawLeaderboardPage(params: RawLeaderboardQueryParams): Promise<RawTraderLeaderboardEntry[]> {
  return get<RawTraderLeaderboardEntry[]>(`/v1/leaderboard`, params);
}

export async function* getRawLeaderboard(params: RawLeaderboardQueryParams & { batchSize?: number }): AsyncGenerator<RawTraderLeaderboardEntry> {
  let offset = 0;
  const limit = params.limit ?? Infinity;
  while (offset < limit) {
    const batch = await getRawLeaderboardPage({
      ...params,
      limit: params.batchSize ?? 50,
      offset,
    });
    if (!batch || batch.length === 0) {
      return;
    }

    for (const entry of batch) {
      yield entry;
    }

    offset += batch.length;
  }
}

export async function getRawBuilderLeaderboardPage(params?: RawBuilderLeaderboardQueryParams): Promise<RawBuilderLeaderboardEntry[]> {
  return get<RawBuilderLeaderboardEntry[]>(`/v1/builders/leaderboard`, params);
}

export async function* getRawBuilderLeaderboard(params: RawBuilderLeaderboardQueryParams & { batchSize?: number }): AsyncGenerator<RawBuilderLeaderboardEntry> {
  let offset = 0;
  const limit = params.limit ?? Infinity;
  while (offset < limit) {
    const batch = await getRawBuilderLeaderboardPage({
      ...params,
      limit: params.batchSize ?? 50,
      offset,
    });
    if (!batch || batch.length === 0) {
      return;
    }

    for (const entry of batch) {
      yield entry;
    }

    offset += batch.length;
  }
}

export async function getRawBuilderVolume(params?: RawBuilderVolumeQueryParams): Promise<RawBuilderVolumeEntry[]> {
  return get<RawBuilderVolumeEntry[]>(`/v1/builders/volume`, params);
}


// TODO: use token-utils. in fact no need both utils.ts and helpers.ts, just move the rest of this file to helpers.ts
export async function fetchUserCashBalance(address: string, rpcUrl?: string): Promise<number> {
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
