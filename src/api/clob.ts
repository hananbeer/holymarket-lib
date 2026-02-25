import axios from 'axios';
import { RawMarketPriceHistory, POLYMARKET_DOMAIN, type TokenPriceHistory, type RawMarketHistoryQueryParams } from './types.js';
import { Side } from '@polymarket/clob-client';

let URL_CLOB = `https://clob.${POLYMARKET_DOMAIN}`;

const http = axios.create({
  baseURL: URL_CLOB,
  paramsSerializer: {
    indexes: null,
  } as any,
});

export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await http.get<T>(url, { params });
  return response.data;
}

export type RawRequestCurrentPriceParams = {
  token_id: string;
  side: Side;
}

export type RawCurrentPriceResponse = {
  price: number;
}

export async function getRawMarketHistory(params: RawMarketHistoryQueryParams): Promise<TokenPriceHistory[]> {
  const axiosParams: Record<string, any> = {
    market: params.tokenId,
    fidelity: params.fidelityMin ?? 60,
    startTs: params.startTimestamp ?? 1,
  };

  const response = await get<RawMarketPriceHistory>(`/prices-history`, axiosParams);
  return response.history;
}

export async function getCurrentPrice(params: RawRequestCurrentPriceParams): Promise<number> {
  const response = await get<RawCurrentPriceResponse>(`/price`, params);
  return response.price;
}

// Order Book
export type RawOrderBookParams = {
  token_id: string;
}

export type RawOrderSummary = {
  price: string;
  size: string;
}

export type RawOrderBookResponse = {
  market: string;
  asset_id: string;
  timestamp: string;
  hash: string;
  bids: RawOrderSummary[];
  asks: RawOrderSummary[];
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
  last_trade_price: string;
}

export async function getOrderBook(params: RawOrderBookParams): Promise<RawOrderBookResponse> {
  return get<RawOrderBookResponse>(`/book`, params);
}

// Spread
export type RawSpreadParams = {
  token_id: string;
}

export type RawSpreadResponse = {
  spread: string;
}

export async function getSpread(params: RawSpreadParams): Promise<string> {
  const response = await get<RawSpreadResponse>(`/spread`, params);
  return response.spread;
}

// Last Trade Price
export type RawLastTradePriceParams = {
  token_id: string;
}

export type RawLastTradePriceResponse = {
  price: string;
  side: 'BUY' | 'SELL' | '';
}

export async function getLastTradePrice(params: RawLastTradePriceParams): Promise<RawLastTradePriceResponse> {
  return get<RawLastTradePriceResponse>(`/last-trade-price`, params);
}

// Fee Rate
export type RawFeeRateParams = {
  token_id?: string;
}

export type RawFeeRateResponse = {
  base_fee: number;
}

export async function getFeeRate(params?: RawFeeRateParams): Promise<number> {
  const response = await get<RawFeeRateResponse>(`/fee-rate`, params);
  return response.base_fee;
}

// Tick Size
export type RawTickSizeParams = {
  token_id?: string;
}

export type RawTickSizeResponse = {
  minimum_tick_size: number;
}

export async function getTickSize(params?: RawTickSizeParams): Promise<number> {
  const response = await get<RawTickSizeResponse>(`/tick-size`, params);
  return response.minimum_tick_size;
}

// Server Time
export type RawServerTimeResponse = {
  server_time: string;
}

export async function getServerTime(): Promise<string> {
  const response = await get<RawServerTimeResponse>(`/server-time`);
  return response.server_time;
}
