import WebSocket from "ws";
import { ApiKeyCreds } from "@polymarket/clob-client";
import { MarketSubscriptionMessage, UserSubscriptionMessage, ChannelMessageRaw, ChannelMessage, parseChannelMessage } from "./types";

export const MARKET_CHANNEL = "market";
export const USER_CHANNEL = "user";
export const WSS_URL = "wss://ws-subscriptions-clob.polymarket.com";
export const PING_INTERVAL_MS = 10000; // 10 seconds

export interface ChannelConfig {
  onMessage: (message: ChannelMessageRaw | ChannelMessage) => void;
  onError?: (error: Error) => void;
  onClose?: (code: number) => void;
  raw?: boolean;
}

export abstract class PolymarketChannelBase {
  protected ws: WebSocket | null = null;
  protected messageCallback: (message: ChannelMessageRaw | ChannelMessage) => void;
  protected errorCallback?: (error: Error) => void;
  protected closeCallback?: (code: number) => void;
  protected raw?: boolean;

  private pingIntervalId: NodeJS.Timeout | null = null;

  protected abstract getChannelType(): string;

  constructor(config: ChannelConfig) {
    this.messageCallback = config.onMessage;
    this.errorCallback = config.onError;
    this.closeCallback = config.onClose;
    this.raw = config.raw ?? false;
  }

  protected setupWebSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.ws) {
        reject(new Error('WebSocket already connected'));
      }

      const url = `${WSS_URL}/ws/${this.getChannelType()}`;
      const ws = new WebSocket(url);

      // single-shot error handler (to reject instead of errorCallback)
      ws.onerror = (event: WebSocket.ErrorEvent) => {
        const error = new Error(event?.error?.message);
        (error as any).cause = event.error;
        reject(error);
      };

      // single-shot close handler (to reject instead of closeCallback)
      ws.onclose = (event: WebSocket.CloseEvent) => {
        reject(new Error(`channel closed unexpectedly: ${event.code} ${event.reason.toString()}`));
      };

      ws.on("open", () => {
        this.ws = ws;

        // setup these handlers only after open
        ws.onclose = (event: WebSocket.CloseEvent) => {
          this.stopPing();
          console.warn('_ channel closed', event.code, event.reason.toString());
          // TODO: check if this is needed (I think when !wasClean then onerror will be triggered anyhow)
          // if (!event.wasClean) {
          //   this.errorCallback?.(new Error(`channel closed unexpectedly: ${event.code} ${event.reason.toString()}`));
          // }

          this.closeCallback?.(event.code ?? 0);
        };

        ws.onerror = (event: WebSocket.ErrorEvent) => {
          this.stopPing();
          console.error('_ channel error', event.error);
          const error = new Error(event.error.message);
          (error as any).cause = event.error;
          this.errorCallback?.(error);
        };

        this.startPing();
        resolve();
      });

      ws.on("message", (data: WebSocket.Data) => {
        const message = data.toString();
        if (message === "PONG") {
          return;
        }

        try {
          const parsed = JSON.parse(message);
          if (Array.isArray(parsed)) {
            for (const item of parsed as ChannelMessageRaw[]) {
              this.messageCallback(this.raw ? item : parseChannelMessage(item));
            }
          } else {
            this.messageCallback(this.raw ? parsed : parseChannelMessage(parsed));
          }
        } catch (error) {
          // TODO: log errors here
          // console.warn("Received non-JSON message:", message);
          const err = new Error((error as Error).message);
          (err as any).cause = error;
          this.errorCallback?.(err);
        }
      });
    });
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  startPing() {
    this.pingIntervalId = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("PING");
      }
    }, PING_INTERVAL_MS);
  }

  stopPing() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export class PolymarketChannelMarket extends PolymarketChannelBase {
  getChannelType(): string {
    return MARKET_CHANNEL;
  }

  async connect(assetIds?: string[], customFeatureEnabled: boolean = false): Promise<void> {
    return super.setupWebSocket().then(() => {
      this.ws!.send(JSON.stringify({
        type: MARKET_CHANNEL.toUpperCase(),
      }));
      if (assetIds && assetIds.length > 0) {
        this.subscribe(assetIds, customFeatureEnabled);
      }
    });
  }

  subscribe(assetIds: string[], customFeatureEnabled: boolean = false) {
    const message: MarketSubscriptionMessage = {
      assets_ids: assetIds,
      operation: "subscribe",
      custom_feature_enabled: customFeatureEnabled,
    };
    this.ws!.send(JSON.stringify(message));
  }

  unsubscribe(assetIds: string[]) {
    const message: MarketSubscriptionMessage = {
      assets_ids: assetIds,
      operation: "unsubscribe",
    };
    this.ws!.send(JSON.stringify(message));
  }
}

export class PolymarketChannelUser extends PolymarketChannelBase {
  private creds: ApiKeyCreds;

  constructor(channelConfig: ChannelConfig, creds: ApiKeyCreds) {
    super(channelConfig);
    this.creds = creds;
  }

  getChannelType(): string {
    return USER_CHANNEL;
  }

  async connect(marketIds?: string[], customFeatureEnabled: boolean = false): Promise<void> {
    return super.setupWebSocket().then(() => {
      this.ws!.send(JSON.stringify({
        type: USER_CHANNEL.toUpperCase(),
        auth: {
          apiKey: this.creds.key, // it expects "apiKey" instead of "key", so annoying
          secret: this.creds.secret,
          passphrase: this.creds.passphrase,
        }
      }));

      if (marketIds && marketIds.length > 0) {
        this.subscribe(marketIds, customFeatureEnabled);
      }
    });
  }

  subscribe(marketIds: string[], customFeatureEnabled: boolean = false) {
    const message: UserSubscriptionMessage = {
      markets: marketIds,
      operation: "subscribe",
      custom_feature_enabled: customFeatureEnabled,
    };
    this.ws!.send(JSON.stringify(message));
  }

  unsubscribe(marketIds: string[]) {
    const message: UserSubscriptionMessage = {
      markets: marketIds,
      operation: "unsubscribe",
    };
    this.ws!.send(JSON.stringify(message));
  }
}

