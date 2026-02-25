import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import * as gammaApi from "../gamma.js";
import type {
  RawApiEventData,
  RawApiSeriesData,
  RawApiMarketData,
  RawApiPublicProfileData,
  RawApiPublicSearchResponse,
} from "../types.js";

vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    __mockInstance: mockAxiosInstance,
  };
});

const mockedAxios = vi.mocked(axios);
const mockAxiosInstance = (mockedAxios.create as any).__mockInstance || mockedAxios.create();

describe("gamma API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getRawEventBySlug", () => {
    describe("happy path", () => {
      it("should fetch event by slug", async () => {
        const mockEvent: RawApiEventData = {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvent });

        const result = await gammaApi.getRawEventBySlug("test-event");

        expect(result).toEqual(mockEvent);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/events/slug/test-event",
          { params: undefined }
        );
      });
    });

    describe("error cases", () => {
      it("should throw when axios request fails", async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

        await expect(
          gammaApi.getRawEventBySlug("test-event")
        ).rejects.toThrow("Network error");
      });
    });
  });

  describe("getRawEventById", () => {
    describe("happy path", () => {
      it("should fetch event by id", async () => {
        const mockEvent: RawApiEventData = {
          id: "123",
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvent });

        const result = await gammaApi.getRawEventById("123");

        expect(result).toEqual(mockEvent);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/events/123", {
          params: undefined,
        });
      });
    });
  });

  describe("getRawEvent", () => {
    describe("happy path", () => {
      it("should fetch event by id when input is numeric", async () => {
        const mockEvent: RawApiEventData = {
          id: "123",
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvent });

        const result = await gammaApi.getRawEvent("123");

        expect(result).toEqual(mockEvent);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/events/123", {
          params: undefined,
        });
      });

      it("should fetch event by slug when input is not numeric", async () => {
        const mockEvent: RawApiEventData = {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvent });

        const result = await gammaApi.getRawEvent("test-event");

        expect(result).toEqual(mockEvent);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/events/slug/test-event",
          { params: undefined }
        );
      });
    });

    describe("edge cases", () => {
      it("should handle numeric string as id", async () => {
        const mockEvent: RawApiEventData = {
          id: "456",
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvent });

        const result = await gammaApi.getRawEvent("456");

        expect(result).toEqual(mockEvent);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/events/456", {
          params: undefined,
        });
      });
    });
  });

  describe("getRawSearchEventsPage", () => {
    describe("happy path", () => {
      it("should fetch search events page", async () => {
        const mockResponse: RawApiPublicSearchResponse = {
          events: [
            {
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
            },
          ],
          pagination: {
            hasMore: false,
            totalResults: 1,
          },
        };

        mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

        const result = await gammaApi.getRawSearchEventsPage({
          q: "test",
          page: 0,
        });

        expect(result).toEqual(mockResponse);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/public-search", {
          params: { q: "test", page: 0 },
        });
      });
    });
  });

  describe("getRawEventsListPage", () => {
    describe("happy path", () => {
      it("should fetch events list page", async () => {
        const mockEvents: RawApiEventData[] = [
          {
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
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvents });

        const result = await gammaApi.getRawEventsListPage({
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockEvents);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/events", {
          params: { limit: 10, offset: 0 },
        });
      });
    });
  });

  describe("getRawEventsList", () => {
    describe("happy path", () => {
      it("should yield events and deduplicate them", async () => {
        const mockEvents: RawApiEventData[] = [
          {
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
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockEvents })
          .mockResolvedValueOnce({ data: [] });

        const events: RawApiEventData[] = [];
        for await (const event of gammaApi.getRawEventsList({
          limit: 10,
        })) {
          events.push(event);
        }

        expect(events).toEqual(mockEvents);
      });

      it("should deduplicate events by id", async () => {
        const duplicateEvent: RawApiEventData = {
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

        mockAxiosInstance.get
          .mockResolvedValueOnce({
            data: [duplicateEvent, duplicateEvent],
          })
          .mockResolvedValueOnce({ data: [] });

        const events: RawApiEventData[] = [];
        for await (const event of gammaApi.getRawEventsList({})) {
          events.push(event);
        }

        expect(events.length).toBe(1);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 500", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        const events: RawApiEventData[] = [];
        for await (const event of gammaApi.getRawEventsList({})) {
          events.push(event);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/events", {
          params: expect.objectContaining({ limit: 500 }),
        });
      });

      it("should stop when batch is empty", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        const events: RawApiEventData[] = [];
        for await (const event of gammaApi.getRawEventsList({})) {
          events.push(event);
        }

        expect(events).toEqual([]);
      });

      it("should respect limit parameter", async () => {
        const mockEvents: RawApiEventData[] = Array(3)
          .fill(null)
          .map((_, i) => ({
            id: `event-${i}`,
            slug: `test-event-${i}`,
            title: "Test Event",
            description: "A test event",
            image: "https://example.com/image.jpg",
            icon: "https://example.com/icon.jpg",
            active: true,
            closed: false,
            markets: [],
            updatedAt: "2024-01-15T11:30:45Z",
          }));

        mockAxiosInstance.get.mockResolvedValue({ data: mockEvents });

        const events: RawApiEventData[] = [];
        for await (const event of gammaApi.getRawEventsList({
          limit: 2,
        })) {
          events.push(event);
        }

        expect(events.length).toBe(2);
      });
    });
  });

  describe("getRawSeriesPage", () => {
    describe("happy path", () => {
      it("should fetch series page", async () => {
        const mockSeries: RawApiSeriesData[] = [
          {
            id: "series-123",
            ticker: "TEST",
            slug: "test-series",
            title: "Test Series",
            seriesType: "daily",
            recurrence: "daily",
            active: true,
            closed: false,
            archived: false,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T11:30:45Z",
            volume24hr: 1000,
            volume: 5000,
            liquidity: 2000,
            commentCount: 10,
            requiresTranslation: false,
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockSeries });

        const result = await gammaApi.getRawSeriesPage({
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockSeries);
      });
    });
  });

  describe("getRawSeriesById", () => {
    describe("happy path", () => {
      it("should fetch series by id", async () => {
        const mockSeries: RawApiSeriesData = {
          id: "series-123",
          ticker: "TEST",
          slug: "test-series",
          title: "Test Series",
          seriesType: "daily",
          recurrence: "daily",
          active: true,
          closed: false,
          archived: false,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T11:30:45Z",
          volume24hr: 1000,
          volume: 5000,
          liquidity: 2000,
          commentCount: 10,
          requiresTranslation: false,
        };

        mockAxiosInstance.get.mockResolvedValue({ data: mockSeries });

        const result = await gammaApi.getRawSeriesById("series-123");

        expect(result).toEqual(mockSeries);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/series/series-123",
          { params: undefined }
        );
      });
    });
  });

  describe("getRawMarketsListPage", () => {
    describe("happy path", () => {
      it("should fetch markets list page", async () => {
        const mockMarkets: RawApiMarketData[] = [
          {
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
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarkets });

        const result = await gammaApi.getRawMarketsListPage({
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockMarkets);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/markets", {
          params: { limit: 10, offset: 0 },
        });
      });

      it("should handle no params", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        await gammaApi.getRawMarketsListPage();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/markets", {
          params: undefined,
        });
      });
    });
  });

  describe("getRawMarketsList", () => {
    describe("happy path", () => {
      it("should yield markets and deduplicate them", async () => {
        const mockMarkets: RawApiMarketData[] = [
          {
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
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockMarkets })
          .mockResolvedValueOnce({ data: [] });

        const markets: RawApiMarketData[] = [];
        for await (const market of gammaApi.getRawMarketsList({})) {
          markets.push(market);
        }

        expect(markets).toEqual(mockMarkets);
      });

      it("should deduplicate markets by id", async () => {
        const duplicateMarket: RawApiMarketData = {
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

        mockAxiosInstance.get
          .mockResolvedValueOnce({
            data: [duplicateMarket, duplicateMarket],
          })
          .mockResolvedValueOnce({ data: [] });

        const markets: RawApiMarketData[] = [];
        for await (const market of gammaApi.getRawMarketsList({})) {
          markets.push(market);
        }

        expect(markets.length).toBe(1);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 500", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        const markets: RawApiMarketData[] = [];
        for await (const market of gammaApi.getRawMarketsList({})) {
          markets.push(market);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/markets", {
          params: expect.objectContaining({ limit: 500 }),
        });
      });

      it("should respect limit parameter", async () => {
        const mockMarkets: RawApiMarketData[] = Array(3)
          .fill(null)
          .map((_, i) => ({
            id: `market-${i}`,
            slug: `test-market-${i}`,
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
          }));

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarkets });

        const markets: RawApiMarketData[] = [];
        for await (const market of gammaApi.getRawMarketsList({
          limit: 2,
        })) {
          markets.push(market);
        }

        expect(markets.length).toBe(2);
      });
    });
  });

  describe("getRawMarketById", () => {
    describe("happy path", () => {
      it("should fetch market by id", async () => {
        const mockMarket: RawApiMarketData = {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarket });

        const result = await gammaApi.getRawMarketById("market-123");

        expect(result).toEqual(mockMarket);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/markets/market-123",
          { params: undefined }
        );
      });
    });
  });

  describe("getRawMarketBySlug", () => {
    describe("happy path", () => {
      it("should fetch market by slug", async () => {
        const mockMarket: RawApiMarketData = {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarket });

        const result = await gammaApi.getRawMarketBySlug("test-market");

        expect(result).toEqual(mockMarket);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/markets/slug/test-market",
          { params: undefined }
        );
      });
    });
  });

  describe("getRawMarket", () => {
    describe("happy path", () => {
      it("should fetch market by id when input is numeric", async () => {
        const mockMarket: RawApiMarketData = {
          id: "123",
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarket });

        const result = await gammaApi.getRawMarket("123");

        expect(result).toEqual(mockMarket);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/markets/123", {
          params: undefined,
        });
      });

      it("should fetch market by slug when input is not numeric", async () => {
        const mockMarket: RawApiMarketData = {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockMarket });

        const result = await gammaApi.getRawMarket("test-market");

        expect(result).toEqual(mockMarket);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/markets/slug/test-market",
          { params: undefined }
        );
      });
    });
  });

  describe("getRawPublicProfileByAddress", () => {
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

        mockAxiosInstance.get.mockResolvedValue({ data: mockProfile });

        const result = await gammaApi.getRawPublicProfileByAddress("0x123");

        expect(result).toEqual(mockProfile);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/public-profile", {
          params: { address: "0x123" },
        });
      });
    });

    describe("edge cases", () => {
      it("should handle profile with minimal data", async () => {
        const mockProfile: RawApiPublicProfileData = {
          proxyWallet: "0x123",
        };

        mockAxiosInstance.get.mockResolvedValue({ data: mockProfile });

        const result = await gammaApi.getRawPublicProfileByAddress("0x123");

        expect(result).toEqual(mockProfile);
      });
    });
  });
});

