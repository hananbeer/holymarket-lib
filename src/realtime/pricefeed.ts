import { RealTimeDataClient, Message, ConnectionStatus, SubscriptionMessage } from "@polymarket/real-time-data-client";

export type CryptoTicker = "btc" | "eth" | "sol" | "xrp"
export type CryptoAsset = "bitcoin" | "ethereum" | "solana" | "xrp"

const TOPIC_CRYPTO_PRICES_CHAINLINK = "crypto_prices_chainlink";
export const SYMBOL_CHAINLINK_BTC_USD = "btc/usd";
export const SYMBOL_CHAINLINK_ETH_USD = "eth/usd";
export const SYMBOL_CHAINLINK_SOL_USD = "sol/usd";
export const SYMBOL_CHAINLINK_XRP_USD = "xrp/usd";

const TOPIC_CRYPTO_PRICES_BINANCE = "crypto_prices";
export const SYMBOL_BINANCE_BTC_USDT = "btcusdt";
export const SYMBOL_BINANCE_ETH_USDT = "ethusdt";
export const SYMBOL_BINANCE_SOL_USDT = "solusdt";
export const SYMBOL_BINANCE_XRP_USDT = "xrpusdt";

export type CryptoSymbol = typeof SYMBOL_CHAINLINK_BTC_USD | typeof SYMBOL_CHAINLINK_ETH_USD | typeof SYMBOL_CHAINLINK_SOL_USD | typeof SYMBOL_CHAINLINK_XRP_USD | typeof SYMBOL_BINANCE_BTC_USDT | typeof SYMBOL_BINANCE_ETH_USDT | typeof SYMBOL_BINANCE_SOL_USDT | typeof SYMBOL_BINANCE_XRP_USDT;

export function tickerToSymbol(ticker: CryptoTicker, source: 'chainlink' | 'binance'): CryptoSymbol {
  if (source === 'chainlink') {
    switch (ticker) {
      case 'btc':
        return SYMBOL_CHAINLINK_BTC_USD;
      case 'eth':
        return SYMBOL_CHAINLINK_ETH_USD;
      case 'sol':
        return SYMBOL_CHAINLINK_SOL_USD;
      case 'xrp':
        return SYMBOL_CHAINLINK_XRP_USD;
    }
  } else if (source === 'binance') {
    switch (ticker) {
      case 'btc':
        return SYMBOL_BINANCE_BTC_USDT;
      case 'eth':
        return SYMBOL_BINANCE_ETH_USDT;
      case 'sol':
        return SYMBOL_BINANCE_SOL_USDT;
      case 'xrp':
        return SYMBOL_BINANCE_XRP_USDT;
    }
  }

  throw new Error(`Invalid source: ${source}`);
}

type SubscriptionMessageItem = SubscriptionMessage["subscriptions"][number];

function toSubscriptionMessageItem(symbol: string): SubscriptionMessageItem {
  const isBinance = (symbol.indexOf('/') === -1);
  return {
    topic: isBinance ? TOPIC_CRYPTO_PRICES_BINANCE : TOPIC_CRYPTO_PRICES_CHAINLINK,
    type: isBinance ? "update" : "*",
    filters: `{"symbol":"${symbol}"}`,
  };
}

export type PricePayload = {
  symbol: string;
  timestamp: number;
  value: number;
  full_accuracy_value?: string;
}

export type PriceMessage = {
  /** Topic of the message */
  topic: string;
  /** Type of the message */
  type: string;
  /** Timestamp of when the message was sent */
  timestamp: number;
  /** Payload containing the message data */
  payload: PricePayload;
}

/*
  Polymarket websocket price feed that streams both chainlink and binance prices.
  To fetch historical prices, use src/lib/prices/<binance|chainlink>.ts
*/
export class PolymarketRealtimePriceFeed {
  private client: RealTimeDataClient | null = null;
  private symbolRefCounts: Map<string, number> = new Map();
  private prices: Map<string, PricePayload> = new Map();
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private isDisconnecting: boolean = false;

  // readonly priceCheckpoints: PricePayload[] = [];

  constructor(symbols?: CryptoSymbol[]) {
    if (symbols) {
      for (const symbol of symbols) {
        this.symbolRefCounts.set(symbol, 1);
      }
    }
  }

  private onConnect(client: RealTimeDataClient): void {
    // Subscribe based on: https://docs.polymarket.com/developers/RTDS/RTDS-crypto-prices
    const symbolsToSubscribe = Array.from(this.symbolRefCounts.keys()).filter(
      symbol => (this.symbolRefCounts.get(symbol) ?? 0) > 0
    );
    if (symbolsToSubscribe.length > 0) {
      client.subscribe({
        subscriptions: symbolsToSubscribe.map(toSubscriptionMessageItem)
      });
    }
  };

  private onStatusChange(status: ConnectionStatus): void {
    this.status = status;

    if (status === ConnectionStatus.DISCONNECTED) {
      // attempt to reconnect
      this.connect();
    }
  }

  connect(): void {
    const onMessage = (_: RealTimeDataClient, message: Message) => {
      if ((message.payload as any)?.data) {
        return; // message = message[message.length - 1] as PriceMessage;
      }

      const payload = message.payload as PricePayload;
      this.prices.set(payload.symbol as CryptoSymbol, payload);
      // if (payload.timestamp % (5 * 60 * 1000) === 0) {
      //   this.priceCheckpoints.unshift(payload);
      // }
    };
    this.client = new RealTimeDataClient({
      onConnect: this.onConnect.bind(this),
      onMessage,
      onStatusChange: this.onStatusChange.bind(this),
    });
    this.client.connect();
  }

  disconnect(): void {
    if (this.client && !this.isDisconnecting) {
      this.isDisconnecting = true;
      this.client.disconnect();
      this.client = null;
    }
  }

  subscribe(symbols: CryptoSymbol[]): void {
    const symbolsToSubscribe: CryptoSymbol[] = [];

    for (const symbol of symbols) {
      const currentCount = this.symbolRefCounts.get(symbol) ?? 0;
      const newCount = currentCount + 1;
      this.symbolRefCounts.set(symbol, newCount);

      // If ref count went from 0 -> 1, we need to subscribe
      if (currentCount === 0) {
        symbolsToSubscribe.push(symbol);
      }
    }

    if (symbolsToSubscribe.length > 0 && this.status === ConnectionStatus.CONNECTED) {
      if (this.client) {
        this.client.subscribe({
          subscriptions: symbolsToSubscribe.map(toSubscriptionMessageItem)
        });
      } else {
        console.error('EDGE CASE: Price feed not connected (should not happen)');
      }
    } else {
      console.log('first connection to price feed');
      this.connect();
    }
  }

  unsubscribe(symbols: CryptoSymbol[]): void {
    const symbolsToUnsubscribe: CryptoSymbol[] = [];

    for (const symbol of symbols) {
      const currentCount = this.symbolRefCounts.get(symbol) ?? 0;
      if (currentCount > 0) {
        const newCount = currentCount - 1;
        if (newCount === 0) {
          this.symbolRefCounts.delete(symbol);
          // If ref count went from 1 -> 0, we need to unsubscribe
          symbolsToUnsubscribe.push(symbol);
        } else {
          this.symbolRefCounts.set(symbol, newCount);
        }
      }
    }

    if (symbolsToUnsubscribe.length > 0 && this.status === ConnectionStatus.CONNECTED) {
      if (this.client) {
        this.client.unsubscribe({
          subscriptions: symbolsToUnsubscribe.map(toSubscriptionMessageItem)
        });
      } else {
        console.error('EDGE CASE: Price feed not connected (should not happen)');
      }
    }
  }

  getPrice(symbol: CryptoSymbol): PricePayload | undefined {
    return this.prices.get(symbol);
  }
}

let priceFeedSingleton: PolymarketRealtimePriceFeed;

/**
 * Returns a singleton instance of PolymarketRealtimePriceFeed.
 */
export function getPriceFeed(): PolymarketRealtimePriceFeed {
  if (!priceFeedSingleton) {
    priceFeedSingleton = new PolymarketRealtimePriceFeed();
  }

  return priceFeedSingleton;
}
