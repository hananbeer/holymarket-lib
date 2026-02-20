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

export type RawMarketPriceHistory = {
  history: TokenPriceHistory[];
}

export type RawSeriesQueryParams = {
  limit?: number;
  offset?: number;
  orderBy?: string[];
  ascending?: boolean;
  closed?: boolean;
}

export type RawListEventsQueryParams = {
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

export type RawListMarketsQueryParams = {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  id?: number[];
  slug?: string[];
  clob_token_ids?: string[];
  condition_ids?: string[];
  market_maker_address?: string[];
  liquidity_num_min?: number;
  liquidity_num_max?: number;
  volume_num_min?: number;
  volume_num_max?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  tag_id?: number;
  related_tags?: boolean;
  cyom?: boolean;
  uma_resolution_status?: string;
  game_id?: string;
  sports_market_types?: string[];
  rewards_min_size?: number;
  question_ids?: string[];
  include_tag?: boolean;
  closed?: boolean;
}

export type RawUserPosition = {
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

export type RawUserTrade = {
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
  hasMore: boolean;
  totalResults: number;
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
  limit?: number; // TODO: add limit instead of numPages...
}

export type EventDataWithoutMarkets = Omit<EventData, 'markets'>;

export type RawMarketHistoryQueryParams = {
  tokenId: string;
  fidelityMin?: number;
  startTimestamp?: number;
}

export type RawUserTradesQueryParams = {
  user?: string; // Address (optional)
  market?: string[]; // Condition IDs (Hash64), mutually exclusive with eventId
  eventId?: number[]; // Event IDs (integers), mutually exclusive with market
  limit?: number; // Default: 100, Max: 10000
  offset?: number; // Default: 0, Max: 10000
  takerOnly?: boolean; // Default: true
  filterType?: 'CASH' | 'TOKENS'; // Must be provided together with filterAmount
  filterAmount?: number; // Min: 0, must be provided together with filterType
  side?: 'BUY' | 'SELL';
}

export type RawUserPortfolioValueQueryParams = {
  user: string;
  markets?: string[];
}

export type UserPortfolioValueQueryParams = {
  address: string;
  conditionIds?: string[];
}

export type UserCashBalanceQueryParams = {
  address: string;
  rpcUrl?: string;
}

export type PositionsSortingOption = 'CURRENT' | 'INITIAL' | 'TOKENS' | 'CASHPNL' | 'PERCENTPNL' | 'TITLE' | 'RESOLVING' | 'PRICE' | 'AVGPRICE';
export type SortDirection = 'ASC' | 'DESC';

export type RawUserPositionsQueryParams = {
  user: string; // Address (required)
  market?: string[]; // Condition IDs (Hash64)
  eventId?: string[]; // Event IDs
  sizeThreshold?: number; // Default: 1
  redeemable?: boolean; // Default: false
  mergeable?: boolean; // Default: false
  limit?: number; // Default: 100, Max: 500
  offset?: number; // Default: 0, Max: 10000
  sortBy?: PositionsSortingOption; // Default: TOKENS
  sortDirection?: SortDirection; // Default: DESC
  title?: string; // Max length: 100
}

export type UserPositionsQueryParams = {
  address: string;
  conditionIds?: string[];
  eventId?: string[];
  sizeThreshold?: number;
  redeemable?: boolean;
  mergeable?: boolean;
  batchSize?: number;
  sortBy?: PositionsSortingOption;
  sortDirection?: SortDirection;
  title?: string;
}

export type RawClosedPosition = {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  avgPrice: number;
  totalBought: number;
  realizedPnl: number;
  curPrice: number;
  timestamp: number;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string;
}

export type ClosedPositionsSortingOption = 'REALIZEDPNL' | 'TITLE' | 'PRICE' | 'AVGPRICE' | 'TIMESTAMP';

export type RawUserClosedPositionsQueryParams = {
  user: string; // Address (required)
  market?: string[]; // Condition IDs (Hash64)
  title?: string; // Max length: 100
  eventId?: number[]; // Event IDs (integers)
  limit?: number; // Default: 10, Min: 0, Max: 50
  offset?: number; // Default: 0, Min: 0, Max: 100000
  sortBy?: ClosedPositionsSortingOption; // Default: REALIZEDPNL
  sortDirection?: SortDirection; // Default: DESC
}

export type ActivityType = 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION' | 'MAKER_REBATE';

export type ActivitySortingOption = 'TIMESTAMP' | 'TOKENS' | 'CASH';

export type RawActivity = {
  proxyWallet: string;
  timestamp: number;
  conditionId: string;
  type: ActivityType;
  size: number;
  usdcSize: number;
  transactionHash: string;
  price: number;
  asset: string;
  side?: 'BUY' | 'SELL';
  outcomeIndex: number;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  name: string;
  pseudonym: string;
  bio: string;
  profileImage: string;
  profileImageOptimized: string;
}

export type RawUserActivityQueryParams = {
  user: string; // Address (required)
  limit?: number; // Default: 100, Min: 0, Max: 500
  offset?: number; // Default: 0, Min: 0, Max: 10000
  market?: string[]; // Condition IDs (Hash64), mutually exclusive with eventId
  eventId?: number[]; // Event IDs (integers), mutually exclusive with market
  type?: ActivityType[]; // Activity types
  start?: number; // Start timestamp (min: 0)
  end?: number; // End timestamp (min: 0)
  sortBy?: ActivitySortingOption; // Default: TIMESTAMP
  sortDirection?: SortDirection; // Default: DESC
  side?: 'BUY' | 'SELL';
}

export type RawApiPublicProfileUser = {
  id: string;
  creator: boolean;
  mod: boolean;
}

export type RawApiPublicProfileData = {
  createdAt?: string;
  proxyWallet?: string;
  profileImage?: string;
  displayUsernamePublic?: boolean;
  bio?: string;
  pseudonym?: string;
  name?: string;
  users?: RawApiPublicProfileUser[];
  xUsername?: string;
  verifiedBadge?: boolean;
}

export type PublicProfileData = RawApiPublicProfileData;

export type RawTraded = {
  user: string;
  traded: number;
}

export type LeaderboardCategory = 'OVERALL' | 'POLITICS' | 'SPORTS' | 'CRYPTO' | 'CULTURE' | 'MENTIONS' | 'WEATHER' | 'ECONOMICS' | 'TECH' | 'FINANCE';

export type LeaderboardTimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'ALL';

export type LeaderboardOrderBy = 'PNL' | 'VOL';

export type RawTraderLeaderboardEntry = {
  rank: string;
  proxyWallet: string;
  userName: string;
  vol: number;
  pnl: number;
  profileImage: string;
  xUsername: string;
  verifiedBadge: boolean;
}

export type RawLeaderboardQueryParams = {
  category?: LeaderboardCategory; // Default: OVERALL
  timePeriod?: LeaderboardTimePeriod; // Default: DAY
  orderBy?: LeaderboardOrderBy; // Default: PNL
  limit?: number; // Default: 25, Min: 1, Max: 50
  offset?: number; // Default: 0, Min: 0, Max: 1000
  user?: string; // Address (optional)
  userName?: string; // Username (optional)
}

export type RawBuilderLeaderboardEntry = {
  rank: string;
  builder: string;
  volume: number;
  activeUsers: number;
  verified: boolean;
  builderLogo: string;
}

export type RawBuilderLeaderboardQueryParams = {
  timePeriod?: LeaderboardTimePeriod; // Default: DAY
  limit?: number; // Default: 25, Min: 0, Max: 50
  offset?: number; // Default: 0, Min: 0, Max: 1000
}

export type RawBuilderVolumeEntry = {
  dt: string; // ISO 8601 date-time
  builder: string;
  builderLogo: string;
  verified: boolean;
  volume: number;
  activeUsers: number;
  rank: string;
}

export type RawBuilderVolumeQueryParams = {
  timePeriod?: LeaderboardTimePeriod; // Default: DAY
}
