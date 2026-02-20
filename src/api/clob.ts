import axios from 'axios';
import { POLYMARKET_DOMAIN } from './types';
import { Side } from '@polymarket/clob-client';

let URL_CLOB = `https://clob.${POLYMARKET_DOMAIN}`;

const http = axios.create({
  baseURL: URL_CLOB
});

export type RequestCurrentPriceParams = {
  tokenId: string | number;
  side: Side;
}

export type ResponseCurrentPrice = {
  price: number;
}

export async function fetchCurrentPrice(params: RequestCurrentPriceParams): Promise<number> {
  const { tokenId, side } = params;
  const response = await http.get<ResponseCurrentPrice>(`/price`, { params: { token_id: tokenId, side: side } });
  return response.data.price;
}
