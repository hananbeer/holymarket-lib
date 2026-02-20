import { TradeMessage, OrderMessage, BookMessage, PriceChangeMessage, TickSizeChangeMessage, LastTradePriceMessage, BestBidAskMessage, NewMarketMessage, MarketResolvedMessage } from "../../lib/polymarket/realtime/types";

export abstract class RealtimeConsumerBase {
  assetIds: string[];
  endTimestamp: number;

  constructor(assetIds: string[], endTimestamp: number) {
    this.assetIds = assetIds;
    this.endTimestamp = endTimestamp;
  }

  // binance or chainlink callback
  // TODO: imo need to pull here instead of push
  abstract onPriceChange?(price: number): void;

  // polymarket market trades callback
  abstract onMarketBook?(book: BookMessage): void;
  abstract onMarketPriceChange?(price: PriceChangeMessage): void;
  abstract onMarketTickSizeChange?(tickSize: TickSizeChangeMessage): void;
  abstract onMarketLastTradePrice?(lastTradePrice: LastTradePriceMessage): void;
  abstract onMarketBestBidAsk?(bestBidAsk: BestBidAskMessage): void;
  abstract onMarketNewMarket?(newMarket: NewMarketMessage): void;
  abstract onMarketMarketResolved?(marketResolved: MarketResolvedMessage): void;

  // polymarket user trades callback
  abstract onUserTrade?(trade: TradeMessage): void;
  abstract onUserOrder?(trade: OrderMessage): void;
}
