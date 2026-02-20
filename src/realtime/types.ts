export enum OrderType {
    GTC = "GTC",
    FOK = "FOK",
    GTD = "GTD",
    FAK = "FAK"
}

export enum Side {
    BUY = "BUY",
    SELL = "SELL"
}

export type MarketSubscriptionMessage = {
  assets_ids?: string[];
  custom_feature_enabled?: boolean;
  operation: "subscribe" | "unsubscribe";
}

export type UserSubscriptionMessage = {
  custom_feature_enabled?: boolean;
  markets: string[];
  operation: "subscribe" | "unsubscribe";
}

export type ChannelMessageEventType = "trade" | "order" | "book" | "price_change" | "tick_size_change" | "last_trade_price" | "best_bid_ask" | "new_market" | "market_resolved";

export type OrderAction = "PLACEMENT" | "UPDATE" | "CANCELLATION";
export type OrderStatus = "LIVE" | "MATCHED" | "CANCELED" | "EXPIRED";
export type TradeStatus = "MATCHED" | "MINED" | "CONFIRMED" | "RETRYING" | "FAILED";
export type TraderSide = "MAKER" | "TAKER";

export type MakerOrderRaw = {
  asset_id: string;
  fee_rate_bps: string;
  maker_address: string;
  matched_amount: string;
  order_id: string;
  outcome: string;
  outcome_index: number;
  owner: string;
  price: string;
  side: Side;
}

export type TradeMessageRaw = {
  market: string;
  timestamp: string;
  asset_id: string;
  bucket_index: number;
  event_type: "trade";
  fee_rate_bps: string;
  id: string;
  last_update: string;
  maker_address: string;
  maker_orders: MakerOrderRaw[];
  match_time: string;
  outcome: string;
  owner: string;
  price: string;
  side: Side;
  size: string;
  status: TradeStatus;
  taker_order_id: string;
  trade_owner: string;
  trader_side: TraderSide;
  transaction_hash: string;
  type: "TRADE";
}

export type OrderMessageRaw = {
  market: string;
  timestamp: string;
  associate_trades: string[];
  asset_id: string;
  created_at: string;
  event_type: "order";
  expiration: string;
  id: string;
  maker_address: string;
  order_owner: string;
  order_type: OrderType;
  original_size: string;
  outcome: string;
  owner: string;
  price: string;
  side: Side;
  size_matched: string;
  status: OrderStatus;
  type: OrderAction;
}

export type UserChannelMessageRaw = TradeMessageRaw | OrderMessageRaw;

export interface OrderSummaryRaw {
  price: string;
  size: string;
}

export interface BookMessageRaw {
  asks: OrderSummaryRaw[];
  asset_id: string;
  bids: OrderSummaryRaw[];
  event_type: "book";
  hash: string;
  market: string;
  timestamp: string;
}

export interface PriceChangeRaw {
  asset_id: string;
  best_ask: string;
  best_bid: string;
  hash: string;
  price: string;
  side: Side;
  size: string;
}

export interface PriceChangeMessageRaw {
  event_type: "price_change";
  market: string;
  price_changes: PriceChangeRaw[];
  timestamp: string;
}

export interface TickSizeChangeMessageRaw {
  asset_id: string;
  event_type: "tick_size_change";
  market: string;
  new_tick_size: string;
  old_tick_size: string;
  timestamp: string;
}

export interface LastTradePriceMessageRaw {
  asset_id: string;
  event_type: "last_trade_price";
  fee_rate_bps: string;
  market: string;
  price: string;
  side: Side;
  size: string;
  timestamp: string;
  transaction_hash: string;
}

export interface BestBidAskMessageRaw {
  asset_id: string;
  best_ask: string;
  best_bid: string;
  event_type: "best_bid_ask";
  market: string;
  spread: string;
  timestamp: string;
}

export interface EventMessage {
  description: string;
  id: string;
  slug: string;
  ticker: string;
  title: string;
}

export interface NewMarketMessageRaw {
  assets_ids: string[];
  description: string;
  event_message: EventMessage;
  event_type: "new_market";
  id: string;
  market: string;
  outcomes: string[];
  question: string;
  slug: string;
  timestamp: string;
}

export interface MarketResolvedMessageRaw {
  assets_ids: string[];
  description: string;
  event_message: EventMessage;
  event_type: "market_resolved";
  id: string;
  market: string;
  outcomes: string[];
  question: string;
  slug: string;
  timestamp: string;
  winning_asset_id: string;
  winning_outcome: string;
}

export type MarketChannelMessageRaw =
  | BookMessageRaw
  | PriceChangeMessageRaw
  | TickSizeChangeMessageRaw
  | LastTradePriceMessageRaw
  | BestBidAskMessageRaw
  | NewMarketMessageRaw
  | MarketResolvedMessageRaw;

export type ChannelMessageRaw = MarketChannelMessageRaw | UserChannelMessageRaw;

/// TYPES WITH NUMERIC VALUES ///

export type MakerOrder = {
  asset_id: string;
  fee_rate_bps: number;
  maker_address: string;
  matched_amount: string;
  order_id: string;
  outcome: string;
  outcome_index: number;
  owner: string;
  price: number;
  side: Side;
}

export type TradeMessage = {
  asset_id: string;
  bucket_index: number;
  event_type: "trade";
  fee_rate_bps: number;
  id: string;
  last_update: number;
  maker_address: string;
  maker_orders: MakerOrder[];
  market: string;
  match_time: number;
  outcome: string;
  owner: string;
  price: number;
  side: Side;
  size: number;
  status: TradeStatus;
  taker_order_id: string;
  timestamp: number;
  trade_owner: string;
  trader_side: TraderSide;
  transaction_hash: string;
  type: "TRADE";
}

export type OrderMessage = {
  associate_trades: string[];
  asset_id: string;
  created_at: number;
  event_type: "order";
  expiration: number;
  id: string;
  maker_address: string;
  market: string;
  order_owner: string;
  order_type: OrderType;
  original_size: number;
  outcome: string;
  owner: string;
  price: number;
  side: Side;
  size_matched: number;
  status: OrderStatus;
  timestamp: number;
  type: OrderAction;
}

export type UserChannelMessage = TradeMessage | OrderMessage;

export interface OrderSummary {
  price: number;
  size: number;
}

export interface BookMessage {
  asks: OrderSummary[];
  asset_id: string;
  bids: OrderSummary[];
  event_type: "book";
  hash: string;
  market: string;
  timestamp: number;
}

export interface PriceChange {
  asset_id: string;
  best_ask: number;
  best_bid: number;
  hash: string;
  price: number;
  side: Side;
  size: number;
}

export interface PriceChangeMessage {
  event_type: "price_change";
  market: string;
  price_changes: PriceChange[];
  timestamp: number;
}

export interface TickSizeChangeMessage {
  asset_id: string;
  event_type: "tick_size_change";
  market: string;
  new_tick_size: number;
  old_tick_size: number;
  timestamp: number;
}

export interface LastTradePriceMessage {
  asset_id: string;
  event_type: "last_trade_price";
  fee_rate_bps: number;
  market: string;
  price: number;
  side: Side;
  size: number;
  timestamp: number;
  transaction_hash: string;
}

export interface BestBidAskMessage {
  asset_id: string;
  best_ask: number;
  best_bid: number;
  event_type: "best_bid_ask";
  market: string;
  spread: number;
  timestamp: number;
}

export interface EventMessage {
  description: string;
  id: string;
  slug: string;
  ticker: string;
  title: string;
}

export interface NewMarketMessage {
  assets_ids: string[];
  description: string;
  event_message: EventMessage;
  event_type: "new_market";
  id: string;
  market: string;
  outcomes: string[];
  question: string;
  slug: string;
  timestamp: number;
}

export interface MarketResolvedMessage {
  assets_ids: string[];
  description: string;
  event_message: EventMessage;
  event_type: "market_resolved";
  id: string;
  market: string;
  outcomes: string[];
  question: string;
  slug: string;
  timestamp: number;
  winning_asset_id: string;
  winning_outcome: string;
}

export type MarketChannelMessage =
  | BookMessage
  | PriceChangeMessage
  | TickSizeChangeMessage
  | LastTradePriceMessage
  | BestBidAskMessage
  | NewMarketMessage
  | MarketResolvedMessage;

export type ChannelMessage = MarketChannelMessage | UserChannelMessage;


/// PARSERS ///

export function parseMakerOrder(raw: MakerOrderRaw): MakerOrder {
  return {
    asset_id: raw.asset_id,
    fee_rate_bps: parseFloat(raw.fee_rate_bps),
    maker_address: raw.maker_address,
    matched_amount: raw.matched_amount,
    order_id: raw.order_id,
    outcome: raw.outcome,
    outcome_index: raw.outcome_index,
    owner: raw.owner,
    price: parseFloat(raw.price),
    side: raw.side,
  };
}

export function parseTradeMessage(raw: TradeMessageRaw): TradeMessage {
  return {
    asset_id: raw.asset_id,
    bucket_index: raw.bucket_index,
    event_type: raw.event_type,
    fee_rate_bps: parseFloat(raw.fee_rate_bps),
    id: raw.id,
    last_update: parseFloat(raw.last_update),
    maker_address: raw.maker_address,
    maker_orders: raw.maker_orders.map(parseMakerOrder),
    market: raw.market,
    match_time: parseFloat(raw.match_time),
    outcome: raw.outcome,
    owner: raw.owner,
    price: parseFloat(raw.price),
    side: raw.side,
    size: parseFloat(raw.size),
    status: raw.status,
    taker_order_id: raw.taker_order_id,
    timestamp: parseFloat(raw.timestamp),
    trade_owner: raw.trade_owner,
    trader_side: raw.trader_side,
    transaction_hash: raw.transaction_hash,
    type: raw.type,
  };
}

export function parseOrderMessage(raw: OrderMessageRaw): OrderMessage {
  return {
    associate_trades: raw.associate_trades,
    asset_id: raw.asset_id,
    created_at: parseFloat(raw.created_at),
    event_type: raw.event_type,
    expiration: parseFloat(raw.expiration),
    id: raw.id,
    maker_address: raw.maker_address,
    market: raw.market,
    order_owner: raw.order_owner,
    order_type: raw.order_type,
    original_size: parseFloat(raw.original_size),
    outcome: raw.outcome,
    owner: raw.owner,
    price: parseFloat(raw.price),
    side: raw.side,
    size_matched: parseFloat(raw.size_matched),
    status: raw.status,
    timestamp: parseFloat(raw.timestamp),
    type: raw.type,
  };
}

export function parseOrderSummary(raw: OrderSummaryRaw): OrderSummary {
  return {
    price: parseFloat(raw.price),
    size: parseFloat(raw.size),
  };
}

export function parseBookMessage(raw: BookMessageRaw): BookMessage {
  return {
    asks: raw.asks.map(parseOrderSummary),
    asset_id: raw.asset_id,
    bids: raw.bids.map(parseOrderSummary),
    event_type: raw.event_type,
    hash: raw.hash,
    market: raw.market,
    timestamp: parseFloat(raw.timestamp),
  };
}

export function parsePriceChange(raw: PriceChangeRaw): PriceChange {
  return {
    asset_id: raw.asset_id,
    best_ask: parseFloat(raw.best_ask),
    best_bid: parseFloat(raw.best_bid),
    hash: raw.hash,
    price: parseFloat(raw.price),
    side: raw.side,
    size: parseFloat(raw.size),
  };
}

export function parsePriceChangeMessage(raw: PriceChangeMessageRaw): PriceChangeMessage {
  return {
    event_type: raw.event_type,
    market: raw.market,
    price_changes: raw.price_changes.map(parsePriceChange),
    timestamp: parseFloat(raw.timestamp),
  };
}

export function parseTickSizeChangeMessage(raw: TickSizeChangeMessageRaw): TickSizeChangeMessage {
  return {
    asset_id: raw.asset_id,
    event_type: raw.event_type,
    market: raw.market,
    new_tick_size: parseFloat(raw.new_tick_size),
    old_tick_size: parseFloat(raw.old_tick_size),
    timestamp: parseFloat(raw.timestamp),
  };
}

export function parseLastTradePriceMessage(raw: LastTradePriceMessageRaw): LastTradePriceMessage {
  return {
    asset_id: raw.asset_id,
    event_type: raw.event_type,
    fee_rate_bps: parseFloat(raw.fee_rate_bps),
    market: raw.market,
    price: parseFloat(raw.price),
    side: raw.side,
    size: parseFloat(raw.size),
    timestamp: parseFloat(raw.timestamp),
    transaction_hash: raw.transaction_hash,
  };
}

export function parseBestBidAskMessage(raw: BestBidAskMessageRaw): BestBidAskMessage {
  return {
    asset_id: raw.asset_id,
    best_ask: parseFloat(raw.best_ask),
    best_bid: parseFloat(raw.best_bid),
    event_type: raw.event_type,
    market: raw.market,
    spread: parseFloat(raw.spread),
    timestamp: parseFloat(raw.timestamp),
  };
}

export function parseNewMarketMessage(raw: NewMarketMessageRaw): NewMarketMessage {
  return {
    assets_ids: raw.assets_ids,
    description: raw.description,
    event_message: raw.event_message,
    event_type: raw.event_type,
    id: raw.id,
    market: raw.market,
    outcomes: raw.outcomes,
    question: raw.question,
    slug: raw.slug,
    timestamp: parseFloat(raw.timestamp),
  };
}

export function parseMarketResolvedMessage(raw: MarketResolvedMessageRaw): MarketResolvedMessage {
  return {
    assets_ids: raw.assets_ids,
    description: raw.description,
    event_message: raw.event_message,
    event_type: raw.event_type,
    id: raw.id,
    market: raw.market,
    outcomes: raw.outcomes,
    question: raw.question,
    slug: raw.slug,
    timestamp: parseFloat(raw.timestamp),
    winning_asset_id: raw.winning_asset_id,
    winning_outcome: raw.winning_outcome,
  };
}

export function parseChannelMessage(message: ChannelMessageRaw): ChannelMessage {
  switch (message.event_type) {
    case 'trade':
      return parseTradeMessage(message);
    case 'order':
      return parseOrderMessage(message);
    case 'book':
      return parseBookMessage(message);
    case 'price_change':
      return parsePriceChangeMessage(message);
    case 'tick_size_change':
      return parseTickSizeChangeMessage(message);
    case 'last_trade_price':
      return parseLastTradePriceMessage(message);
    case 'best_bid_ask':
      return parseBestBidAskMessage(message);
    case 'new_market':
      return parseNewMarketMessage(message);
    case 'market_resolved':
      return parseMarketResolvedMessage(message);
  }

  throw new Error(`Unknown event type: ${message.event_type}`);
}
