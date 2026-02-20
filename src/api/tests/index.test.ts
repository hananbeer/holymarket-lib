import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import * as indexApi from "../index";
import type {
  EventData,
  MarketData,
  PublicProfileData,
  RawApiEventData,
  RawApiMarketData,
  RawApiPublicProfileData,
} from "../types";

vi.mock("axios", () => {
  const mockAxiosInstanceGamma = {
    get: vi.fn(),
  };
  const mockAxiosInstanceData = {
    get: vi.fn(),
  };
  return {
    default: {
      create: vi.fn((config: any) => {
        if (config?.baseURL?.includes("gamma-api")) {
          return mockAxiosInstanceGamma;
        }
        if (config?.baseURL?.includes("data-api")) {
          return mockAxiosInstanceData;
        }
        return mockAxiosInstanceGamma;
      }),
    },
    __mockInstanceGamma: mockAxiosInstanceGamma,
    __mockInstanceData: mockAxiosInstanceData,
  };
});

const mockedAxios = vi.mocked(axios);
const mockAxiosInstanceGamma = (mockedAxios.create as any).__mockInstanceGamma || mockedAxios.create({ baseURL: "https://gamma-api.polymarket.com" });
const mockAxiosInstanceData = (mockedAxios.create as any).__mockInstanceData || mockedAxios.create({ baseURL: "https://data-api.polymarket.com" });

describe("index API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getEvent", () => {
    describe("happy path", () => {
      it("should fetch and canonicalize event by slug", async () => {
        const mockRawEvent: RawApiEventData = {
          id: "event-123",
          slug: "test-event",
          title: "Test Event",
          description: "A test event",
          image: "https://example.com/image.jpg",
          icon: "https://example.com/icon.jpg",
          active: true,
          closed: false,
          markets: [],
          updatedAt: "2024-01-15T11:30:45Z",
        };

        mockAxiosInstanceGamma.get.mockResolvedValue({ data: mockRawEvent });

        const result = await indexApi.getEvent("test-event");

        expect(result.id).toBe("event-123");
        expect(result.slug).toBe("test-event");
        expect(result.title).toBe("Test Event");
        expect(mockAxiosInstanceGamma.get).toHaveBeenCalledWith(
          "/events/slug/test-event",
          { params: undefined }
        );
      });
    });
  });

  describe("getMarketById", () => {
    describe("happy path", () => {
      it("should fetch and canonicalize market by id", async () => {
        const mockRawMarket: RawApiMarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          createdAt: "2024-01-15T10:30:45Z",
          updatedAt: "2024-01-15T11:30:45Z",
          clobTokenIds: '["0xabc", "0xdef"]',
          outcomes: '["YES", "NO"]',
          outcomePrices: '[0.5, 0.5]',
          ready: true,
          active: true,
          closed: false,
          umaResolutionStatuses: '{"status": "pending"}',
        };

        const mockCanonicalMarket: MarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          title: "Will it rain?",
          outcomes: ["YES", "NO"],
          outcomePrices: [0.5, 0.5],
          tokenIds: ["0xabc", "0xdef"],
          ready: true,
          active: true,
          closed: false,
          acceptingOrders: false,
          umaResolutionStatuses: { status: "pending" },
          marketCreatedTimestamp: 1705314645,
          marketUpdateTimestamp: 1705318245,
          volume: 0,
          volume24hr: 0,
          volume1wk: 0,
          volume1mo: 0,
          volume1yr: 0,
          liquidity: 0,
        };

        mockAxiosInstanceGamma.get.mockResolvedValue({ data: mockRawMarket });

        const result = await indexApi.getMarketById("market-123");

        expect(result.id).toBe("market-123");
        expect(result.slug).toBe("test-market");
        expect(mockAxiosInstanceGamma.get).toHaveBeenCalledWith("/markets/market-123", {
          params: undefined,
        });
      });
    });
  });

  describe("getMarketBySlug", () => {
    describe("happy path", () => {
      it("should fetch and canonicalize market by slug", async () => {
        const mockRawMarket: RawApiMarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          createdAt: "2024-01-15T10:30:45Z",
          updatedAt: "2024-01-15T11:30:45Z",
          clobTokenIds: '["0xabc", "0xdef"]',
          outcomes: '["YES", "NO"]',
          outcomePrices: '[0.5, 0.5]',
          ready: true,
          active: true,
          closed: false,
          umaResolutionStatuses: '{"status": "pending"}',
        };

        const mockCanonicalMarket: MarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          title: "Will it rain?",
          outcomes: ["YES", "NO"],
          outcomePrices: [0.5, 0.5],
          tokenIds: ["0xabc", "0xdef"],
          ready: true,
          active: true,
          closed: false,
          acceptingOrders: false,
          umaResolutionStatuses: { status: "pending" },
          marketCreatedTimestamp: 1705314645,
          marketUpdateTimestamp: 1705318245,
          volume: 0,
          volume24hr: 0,
          volume1wk: 0,
          volume1mo: 0,
          volume1yr: 0,
          liquidity: 0,
        };

        mockAxiosInstanceGamma.get.mockResolvedValue({ data: mockRawMarket });

        const result = await indexApi.getMarketBySlug("test-market");

        expect(result.id).toBe("market-123");
        expect(result.slug).toBe("test-market");
        expect(mockAxiosInstanceGamma.get).toHaveBeenCalledWith("/markets/slug/test-market", {
          params: undefined,
        });
      });
    });
  });

  describe("getMarket", () => {
    describe("happy path", () => {
      it("should fetch and canonicalize market by slug or id", async () => {
        const mockRawMarket: RawApiMarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          createdAt: "2024-01-15T10:30:45Z",
          updatedAt: "2024-01-15T11:30:45Z",
          clobTokenIds: '["0xabc", "0xdef"]',
          outcomes: '["YES", "NO"]',
          outcomePrices: '[0.5, 0.5]',
          ready: true,
          active: true,
          closed: false,
          umaResolutionStatuses: '{"status": "pending"}',
        };

        const mockCanonicalMarket: MarketData = {
          id: "market-123",
          slug: "test-market",
          question: "Will it rain?",
          conditionId: "0x123",
          title: "Will it rain?",
          outcomes: ["YES", "NO"],
          outcomePrices: [0.5, 0.5],
          tokenIds: ["0xabc", "0xdef"],
          ready: true,
          active: true,
          closed: false,
          acceptingOrders: false,
          umaResolutionStatuses: { status: "pending" },
          marketCreatedTimestamp: 1705314645,
          marketUpdateTimestamp: 1705318245,
          volume: 0,
          volume24hr: 0,
          volume1wk: 0,
          volume1mo: 0,
          volume1yr: 0,
          liquidity: 0,
        };

        mockAxiosInstanceGamma.get.mockResolvedValue({ data: mockRawMarket });

        const result = await indexApi.getMarket("test-market");

        expect(result.id).toBe("market-123");
        expect(result.slug).toBe("test-market");
        expect(mockAxiosInstanceGamma.get).toHaveBeenCalledWith("/markets/slug/test-market", {
          params: undefined,
        });
      });
    });
  });

  describe("getPublicProfileByAddress", () => {
    describe("happy path", () => {
      it("should fetch public profile by address", async () => {
        const mockProfile: RawApiPublicProfileData = {
          proxyWallet: "0x123",
          name: "Test User",
          pseudonym: "testuser",
          bio: "Test bio",
          profileImage: "profile.jpg",
          displayUsernamePublic: true,
          verifiedBadge: false,
        };

        mockAxiosInstanceGamma.get.mockResolvedValue({ data: mockProfile });

        const result = await indexApi.getPublicProfileByAddress("0x123");

        expect(result.proxyWallet).toBe("0x123");
        expect(result.name).toBe("Test User");
        expect(mockAxiosInstanceGamma.get).toHaveBeenCalledWith("/public-profile", {
          params: { address: "0x123" },
        });
      });
    });
  });

  describe("getUserPortfolioValue", () => {
    describe("happy path", () => {
      it("should return portfolio value", async () => {
        mockAxiosInstanceData.get.mockResolvedValue({
          data: [{ user: "0x123", value: 1000 }],
        });

        const result = await indexApi.getUserPortfolioValue({
          address: "0x123",
          conditionIds: ["0xabc"],
        });

        expect(result).toBe(1000);
        expect(mockAxiosInstanceData.get).toHaveBeenCalledWith("/value", {
          params: {
            user: "0x123",
            markets: ["0xabc"],
          },
        });
      });
    });

    describe("edge cases", () => {
      it("should return undefined when response is empty", async () => {
        mockAxiosInstanceData.get.mockResolvedValue({ data: [] });

        const result = await indexApi.getUserPortfolioValue({
          address: "0x123",
          conditionIds: ["0xabc"],
        });

        expect(result).toBeUndefined();
      });

      it("should return undefined when response is undefined", async () => {
        mockAxiosInstanceData.get.mockResolvedValue({ data: undefined });

        const result = await indexApi.getUserPortfolioValue({
          address: "0x123",
          conditionIds: ["0xabc"],
        });

        expect(result).toBeUndefined();
      });
    });
  });

  describe("getUserTraded", () => {
    describe("happy path", () => {
      it("should return traded amount", async () => {
        mockAxiosInstanceData.get.mockResolvedValue({
          data: {
            user: "0x123",
            traded: 5000,
          },
        });

        const result = await indexApi.getUserTraded("0x123");

        expect(result).toBe(5000);
        expect(mockAxiosInstanceData.get).toHaveBeenCalledWith("/traded", {
          params: { user: "0x123" },
        });
      });
    });
  });

});

