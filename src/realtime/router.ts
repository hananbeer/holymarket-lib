import { PolymarketChannelMarket, PolymarketChannelUser } from "./channel";
import { RealtimeConsumerBase } from "./consumer";
import { PolymarketRealtimePriceFeed } from "./pricefeed";
import { ApiKeyCreds } from "@polymarket/clob-client";

export class PolymarketChannelRouter {
  // multiple markets (assets) feeds
  protected marketChannels: PolymarketChannelMarket[] = [];

  // multiple user feeds
  // api key -> user channel
  protected userChannels: Map<string, PolymarketChannelUser> = new Map();

  // only need one price feed channel
  protected priceFeedChannel: PolymarketRealtimePriceFeed;

  // consumers list
  protected consumers: Set<RealtimeConsumerBase> = new Set();

  // assets -> consumer map
  // TODO: this is a bad idea because there can be multiple consumers for the same asset
  protected consumersByAssetId: Record<string, Set<RealtimeConsumerBase>> = {};

  protected onErrorMarket(error: Error) {
    console.error('error', error);
  }

  protected onMarketMessage(message: any) {
    console.log('message', message);
  }

  protected onCloseMarket() {
    console.log('market channel closed');
  }

  protected onCloseUser() {
    console.log('user channel closed');
  }


  protected onErrorUser(error: Error) {
    console.error('error', error);
  }

  protected onUserMessage(message: any) {
    console.log('message', message);
  }

  subscribeAssets(assetIds: string[], consumer: RealtimeConsumerBase) {
    if (this.consumers.has(consumer)) {
      console.warn('consumer already subscribed');
      return;
    }

    this.consumers.add(consumer);
    for (const assetId of assetIds) {
      if (!this.consumersByAssetId[assetId]) {
        this.consumersByAssetId[assetId] = new Set();
        this.addMarketChannel([assetId]);
      }

      this.consumersByAssetId[assetId].add(consumer);
    }
  }

  addMarketChannel(assetIds: string[]) {
    const channel = new PolymarketChannelMarket({
      onMessage: this.onMarketMessage.bind(this),
      onError: this.onErrorMarket.bind(this),
      onClose: this.onCloseMarket.bind(this),
    });

    this.marketChannels.push(channel);
    // TODO: do not do console error here
    channel.connect(assetIds).catch(console.error);
  }

  addUserChannel(creds: ApiKeyCreds) {
    // TODO: need to also route to the correct consumer OF THAT USER
    // so that a different user won't trigger strategy consumer of another user
    // (perhaps a user should be dedicated per market & strategy)
    const channel = new PolymarketChannelUser({
      onMessage: this.onUserMessage.bind(this),
      onError: this.onErrorUser.bind(this),
      onClose: this.onCloseUser.bind(this),
    }, creds);
    const marketIds = [];
    this.userChannels.set(creds.key, channel);
    // TODO: do not do console error here
    channel.connect(marketIds).catch(console.error);
  }

  togglePriceFeed(symbols: string[], enabled: boolean) {
    if (!this.priceFeedChannel) {
      this.priceFeedChannel = new PolymarketRealtimePriceFeed();
      this.priceFeedChannel.connect();
    }

    if (enabled) {
      this.priceFeedChannel.subscribe(symbols);
    } else {
      this.priceFeedChannel.unsubscribe(symbols);
    }
  }
}
