export const POLYMARKET_DOMAIN = 'polymarket.com';

export type RawApiMarketData = {
  id: string;
  slug: string;
  question: string;
  conditionId: string;
  groupItemTitle?: string;
  groupItemThreshold?: string;
  eventStartTime?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  acceptingOrdersTimestamp?: string;
  clobTokenIds: string;
  outcomes: string;
  outcomePrices: string;

  ready: boolean;
  active: boolean;
  closed: boolean;
  spread?: number;
  acceptingOrders?: boolean;
  umaResolutionStatuses: string;

  volume?: string | number;
  volumeNum?: number;
  liquidity?: string | number;
  liquidityNum?: number;
  volume24hr?: number;
  volume1wk?: number;
  volume1mo?: number;
  volume1yr?: number;
}

export type RawApiTagData = {
  id: string;
  label: string;
  slug: string;
  // these fields exist but not interesting for now
  // forceShow: boolean;
  // publishedAt?: string;
  // createdAt: string;
  // updatedAt: string;
  // requiresTranslation: boolean;
}

export type RawApiEventData = {
  id: string;
  slug: string;
  seriesSlug?: string;
  ticker?: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  startDate?: string;
  endDate?: string;
  creationDate?: string;
  createdAt?: string;
  active: boolean;
  closed: boolean;
  markets: RawApiMarketData[];
  tags?: RawApiTagData[];
  updatedAt: string;

  volume?: string | number;
  liquidity?: string | number;
  volume24hr?: number;
  volume1wk?: number;
  volume1mo?: number;
  volume1yr?: number;
  openInterest?: number;

  umaResolutionStatus?: string;
}

export type EventData = {
  id: string;
  slug: string;
  seriesSlug?: string;
  title: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
  eventStartTimestamp?: number; // TODO: make these non-optional?
  eventEndTimestamp?: number;
  eventCreationTimestamp?: number;
  eventUpdateTimestamp?: number;
  active: boolean;
  closed: boolean;
  markets: MarketData[];
  tags?: RawApiTagData[]; // TODO: for now just raw tags is ok, but would be nice to have canonicalized tags
  umaResolutionStatus: string;

  volume: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  liquidity: number;
  openInterest: number;
}

export type MarketData = {
  id: string;
  slug: string;
  question: string;
  conditionId: string;
  title: string;
  index?: number;
  marketConditionStartTimestamp?: number;
  marketStartTimestamp?: number; // TODO: make these non-optional?
  marketEndTimestamp?: number;
  marketCreatedTimestamp?: number;
  marketUpdateTimestamp?: number;
  tokenIds: string[];
  outcomes: string[];
  outcomePrices: number[];
  ready: boolean;
  active: boolean;
  closed: boolean;
  spread?: number;
  acceptingOrders: boolean;
  acceptingOrdersTimestamp?: number;
  umaResolutionStatuses: string[];

  volume: number;
  liquidity: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
}

export type PriceHistoryItem = {
  t: number;
  p: number;
}

export type TokenPriceHistory = PriceHistoryItem[];

export type MarketPriceHistory = {
  history: TokenPriceHistory[];
}

export type SeriesQueryParams = {
  limit?: number;
  offset?: number;
  orderBy?: string[];
  ascending?: boolean;
  closed?: boolean;
}

export type ListEventsQueryParams = {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  id?: number[];
  tag_id?: number;
  exclude_tag_id?: number[];
  slug?: string[];
  tag_slug?: string;
  related_tags?: boolean;
  active?: boolean;
  archived?: boolean;
  featured?: boolean;
  cyom?: boolean;
  include_chat?: boolean;
  include_template?: boolean;
  recurrence?: string;
  closed?: boolean;
  liquidity_min?: number;
  liquidity_max?: number;
  volume_min?: number;
  volume_max?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
}

export type UserPosition = {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  percentRealizedPnl: number;
  curPrice: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon: string;
  eventId: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string;
  negativeRisk: boolean;
}

export type UserTrade = {
  proxyWallet: string;
  side: string;
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  name: string;
  pseudonym: string;
  bio: string;
  profileImage: string;
  profileImageOptimized: string;
  transactionHash: string;
}

export type RawApiSearchResults = {
  events: RawApiEventData[];
  pagination: {
    hasMore: boolean;
    totalResults: number;
  }
}

export type SearchResults = {
  events: EventData[];
}

export type SignedOrder = {
  salt: string;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  side: number;
  signatureType: number;
  signature: string;
}

export type PostOrderResponse = {
  errorMsg: string;
  orderID: string;
  takingAmount: string;
  makingAmount: string;
  status: string;
  success: boolean;
}

export type UserValue = {
  user: string;
  value: number;
}

export type RawApiSeriesData = {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  seriesType: string;
  recurrence: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  volume24hr: number;
  volume: number;
  liquidity: number;
  commentCount: number;
  requiresTranslation: boolean;
}

export type SeriesData = {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  seriesType: string;
  recurrence: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  seriesCreatedTimestamp: string;
  seriesUpdatedTimestamp: string;
  volume24hr: number;
  volume: number;
  liquidity: number;
  commentCount: number;
  requiresTranslation: boolean;
}


export type RawApiPublicSearchParams = {
  q: string;
  cache?: boolean;
  events_status?: string;
  limit_per_type?: number;
  page?: number;
  events_tag?: string[];
  keep_closed_markets?: number;
  sort?: string;
  ascending?: boolean;
  search_tags?: boolean;
  search_profiles?: boolean;
  recurrence?: string;
  exclude_tag_id?: number[];
  optimized?: boolean;
}

export type RawApiPaginationInfo = {
  page: number;
  limit_per_type: number;
  total: number;
}

export type RawApiPublicSearchResponse = {
  events?: RawApiEventData[];
  // tags?: ..;
  // profiles?: ..;
  pagination: RawApiPaginationInfo;
}

export type SearchParamsSimple = {
  query?: string;
  tags?: string[];
  sort?: string;
  ascending?: boolean;
  // limit?: number; // TODO: add limit instead of numPages...
}
