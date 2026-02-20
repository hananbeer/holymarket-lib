// API exports
export {
  getEvent,
  getEventsList,
  getAllEventsActiveAndOpen,
  getAllEventsUpdatedSince,
  getSearchEvents,
  getMarketById,
  getMarketBySlug,
  getMarket,
  getMarketsList,
  getPublicProfileByAddress,
  getUserPositions,
  getUserPortfolioValue,
  getUserTraded,
  getUserTrades,
} from './api';

// API types
export type {
  EventData,
  MarketData,
  PublicProfileData,
  RawUserPosition,
  UserTrade,
  UserTradesQueryParams,
  UserPositionsQueryParams,
  UserPortfolioValueQueryParams,
  SearchParamsSimple,
  RawListEventsQueryParams,
  RawListMarketsQueryParams,
} from './api/types';

// Realtime exports
export {
  PolymarketChannelMarket,
  PolymarketChannelUser,
  PolymarketChannelBase,
  MARKET_CHANNEL,
  USER_CHANNEL,
  WSS_URL,
  PING_INTERVAL_MS,
} from './realtime/channel';

export type {
  ChannelConfig,
} from './realtime/channel';

export {
  PolymarketRealtimePriceFeed,
  getPriceFeed,
  tickerToSymbol,
  SYMBOL_CHAINLINK_BTC_USD,
  SYMBOL_CHAINLINK_ETH_USD,
  SYMBOL_CHAINLINK_SOL_USD,
  SYMBOL_CHAINLINK_XRP_USD,
  SYMBOL_BINANCE_BTC_USDT,
  SYMBOL_BINANCE_ETH_USDT,
  SYMBOL_BINANCE_SOL_USDT,
  SYMBOL_BINANCE_XRP_USDT,
} from './realtime/pricefeed';

export type {
  CryptoTicker,
  CryptoAsset,
  CryptoSymbol,
  PricePayload,
  PriceMessage,
} from './realtime/pricefeed';

// Realtime types
export type {
  ChannelMessage,
  ChannelMessageRaw,
  MarketChannelMessage,
  UserChannelMessage,
  TradeMessage,
  OrderMessage,
  BookMessage,
  PriceChangeMessage,
  TickSizeChangeMessage,
  LastTradePriceMessage,
  BestBidAskMessage,
  NewMarketMessage,
  MarketResolvedMessage,
  OrderType,
  Side,
  OrderStatus,
  TradeStatus,
  TraderSide,
  OrderAction,
} from './realtime/types';
