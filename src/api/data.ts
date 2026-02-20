import axios from 'axios';
import { POLYMARKET_DOMAIN } from './types';
import type { MarketPriceHistory, TokenPriceHistory, UserPosition, UserTrade, UserValue } from './types';

let URL_DATA = `https://data-api.${POLYMARKET_DOMAIN}`;

const http = axios.create({
  baseURL: URL_DATA,
});

export async function fetchRawMarketHistory(tokenId: string, fidelityMin: number = 60, timestampStart: number = 1): Promise<TokenPriceHistory[]> {
  const axiosParams = {
    market: tokenId,
    fidelity: fidelityMin.toString(),
    startTs: timestampStart.toString(),
  };
  const response = await http.get(`/prices-history`, { params: axiosParams });
  const prices = response.data as MarketPriceHistory;
  return prices.history;
}

export async function fetchUserPositions(address: string, conditionIds: string[] = [], sizeThreshold: number = 0, limit: number = 100, offset: number = 0): Promise<UserPosition[]> {
  const params = new URLSearchParams({
    user: address,
    sizeThreshold: sizeThreshold.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (conditionIds.length > 0) {
    params.append('market', conditionIds.join(','));
  }
  const url = `/positions?${params.toString()}`;
  const response = await fetch(url);
  return response.json() as Promise<UserPosition[]>;
}

export async function fetchAllUserPositions(address: string, conditionIds: string[] = [], batchSize: number = 100): Promise<UserPosition[]> {
  const positions: UserPosition[] = [];
  let offset = 0;

  while (true) {
    const batch = await fetchUserPositions(address, conditionIds, batchSize, offset);
    if (!batch || batch.length === 0) {
      break;
    }
    positions.push(...batch);
    offset += batchSize;
  }

  return positions;
}

export async function fetchUserTrades(address: string, eventId?: string, limit: number = 1000, offset: number = 0): Promise<UserTrade[]> {
  const params = new URLSearchParams({
    user: address,
    limit: limit.toString(),
    offset: offset.toString(),
    takerOnly: 'false',
  });
  if (eventId) {
    params.append('eventId', eventId);
  }
  const url = `/trades?${params.toString()}`;
  const response = await fetch(url);
  return response.json() as Promise<UserTrade[]>;
}

// TODO: yield
/*
this endpoint sorts by timestamps descending! so annoying!
meaning the pagination can be completely messed up
*/
export async function fetchAllUserTrades(address: string, eventId?: string, batchSize: number = 1000): Promise<UserTrade[]> {
  const trades: UserTrade[] = [];
  let batch: UserTrade[] = [];
  let chunk: UserTrade[] = [];
  let offset = 0;
  do {
    batch = await fetchUserTrades(address, eventId, batchSize, offset);
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

export async function fetchUserPortfolioValue(address: string, markets?: string[]): Promise<UserValue[]> {
  const params = new URLSearchParams({
    user: address,
  });
  if (markets && markets.length > 0) {
    markets.forEach(market => params.append('market', market));
  }
  const url = `/value?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json() as { error: string };
    throw new Error(`Failed to fetch user value: ${error.error}`);
  }
  return response.json() as Promise<UserValue[]>;
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
