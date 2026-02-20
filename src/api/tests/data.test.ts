import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import * as dataApi from "../data";
import type {
  RawUserPosition,
  RawUserTrade,
  RawClosedPosition,
  RawActivity,
  RawTraded,
  RawTraderLeaderboardEntry,
  RawBuilderLeaderboardEntry,
  RawBuilderVolumeEntry,
  UserValue,
} from "../types";

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

describe("data API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getRawUserPositionsPage", () => {
    describe("happy path", () => {
      it("should fetch user positions page with valid params", async () => {
        const mockPositions: RawUserPosition[] = [
          {
            proxyWallet: "0x123",
            asset: "0xabc",
            conditionId: "0xdef",
            size: 100,
            avgPrice: 0.5,
            initialValue: 50,
            currentValue: 60,
            cashPnl: 10,
            percentPnl: 20,
            totalBought: 100,
            realizedPnl: 5,
            percentRealizedPnl: 10,
            curPrice: 0.6,
            redeemable: true,
            mergeable: false,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventId: "event-1",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            oppositeOutcome: "NO",
            oppositeAsset: "0xghi",
            endDate: "2024-12-31T00:00:00Z",
            negativeRisk: false,
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockPositions });

        const result = await dataApi.getRawUserPositionsPage({
          user: "0x123",
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockPositions);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/positions", {
          params: { user: "0x123", limit: 10, offset: 0 },
        });
      });

      it("should handle empty positions array", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        const result = await dataApi.getRawUserPositionsPage({
          user: "0x123",
        });

        expect(result).toEqual([]);
      });
    });

    describe("edge cases", () => {
      it("should handle optional params", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        await dataApi.getRawUserPositionsPage({
          user: "0x123",
          market: ["0xabc"],
          sizeThreshold: 0.01,
          redeemable: true,
          mergeable: false,
        });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/positions", {
          params: {
            user: "0x123",
            market: ["0xabc"],
            sizeThreshold: 0.01,
            redeemable: true,
            mergeable: false,
          },
        });
      });
    });

    describe("error cases", () => {
      it("should throw when axios request fails", async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

        await expect(
          dataApi.getRawUserPositionsPage({ user: "0x123" })
        ).rejects.toThrow("Network error");
      });
    });
  });

  describe("getRawUserPositions", () => {
    describe("happy path", () => {
      it("should yield all positions when limit is not specified", async () => {
        const mockPositions: RawUserPosition[] = [
          {
            proxyWallet: "0x123",
            asset: "0xabc",
            conditionId: "0xdef",
            size: 100,
            avgPrice: 0.5,
            initialValue: 50,
            currentValue: 60,
            cashPnl: 10,
            percentPnl: 20,
            totalBought: 100,
            realizedPnl: 5,
            percentRealizedPnl: 10,
            curPrice: 0.6,
            redeemable: true,
            mergeable: false,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventId: "event-1",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            oppositeOutcome: "NO",
            oppositeAsset: "0xghi",
            endDate: "2024-12-31T00:00:00Z",
            negativeRisk: false,
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockPositions })
          .mockResolvedValueOnce({ data: null });

        const positions: RawUserPosition[] = [];
        for await (const position of dataApi.getRawUserPositions({
          user: "0x123",
          batchSize: 500,
        })) {
          positions.push(position);
        }

        expect(positions).toEqual(mockPositions);
      });

      it("should respect limit parameter", async () => {
        const mockPositions: RawUserPosition[] = Array(3).fill(null).map((_, i) => ({
          proxyWallet: "0x123",
          asset: "0xabc",
          conditionId: "0xdef",
          size: 100,
          avgPrice: 0.5,
          initialValue: 50,
          currentValue: 60,
          cashPnl: 10,
          percentPnl: 20,
          totalBought: 100,
          realizedPnl: 5,
          percentRealizedPnl: 10,
          curPrice: 0.6,
          redeemable: true,
          mergeable: false,
          title: "Test Market",
          slug: "test-market",
          icon: "icon.jpg",
          eventId: "event-1",
          eventSlug: "test-event",
          outcome: "YES",
          outcomeIndex: 0,
          oppositeOutcome: "NO",
          oppositeAsset: "0xghi",
          endDate: "2024-12-31T00:00:00Z",
          negativeRisk: false,
        }));

        mockAxiosInstance.get.mockResolvedValue({ data: mockPositions });

        const positions: RawUserPosition[] = [];
        for await (const position of dataApi.getRawUserPositions({
          user: "0x123",
          limit: 2,
          batchSize: 500,
        })) {
          positions.push(position);
          if (positions.length >= 2) break;
        }

        expect(positions.length).toBe(2);
      });
    });

    describe("edge cases", () => {
      it("should stop when batch is empty", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const positions: RawUserPosition[] = [];
        for await (const position of dataApi.getRawUserPositions({
          user: "0x123",
        })) {
          positions.push(position);
        }

        expect(positions).toEqual([]);
      });

      it("should use default batchSize of 500", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const positions: RawUserPosition[] = [];
        for await (const position of dataApi.getRawUserPositions({
          user: "0x123",
        })) {
          positions.push(position);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/positions", {
          params: expect.objectContaining({ limit: 500 }),
        });
      });
    });
  });

  describe("getRawUserTradesPage", () => {
    describe("happy path", () => {
      it("should fetch user trades page", async () => {
        const mockTrades: RawUserTrade[] = [
          {
            proxyWallet: "0x123",
            side: "BUY",
            asset: "0xabc",
            conditionId: "0xdef",
            size: 100,
            price: 0.5,
            timestamp: 1234567890,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            name: "Test User",
            pseudonym: "testuser",
            bio: "Test bio",
            profileImage: "profile.jpg",
            profileImageOptimized: "profile-opt.jpg",
            transactionHash: "0xtx123",
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockTrades });

        const result = await dataApi.getRawUserTradesPage({
          user: "0x123",
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockTrades);
      });
    });
  });

  describe("getRawUserTrades", () => {
    describe("happy path", () => {
      it("should yield trades and deduplicate them", async () => {
        const mockTrades: RawUserTrade[] = [
          {
            proxyWallet: "0x123",
            side: "BUY",
            asset: "0xabc",
            conditionId: "0xdef",
            size: 100,
            price: 0.5,
            timestamp: 1234567890,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            name: "Test User",
            pseudonym: "testuser",
            bio: "Test bio",
            profileImage: "profile.jpg",
            profileImageOptimized: "profile-opt.jpg",
            transactionHash: "0xtx123",
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockTrades })
          .mockResolvedValueOnce({ data: [] });

        const trades: RawUserTrade[] = [];
        for await (const trade of dataApi.getRawUserTrades({
          user: "0x123",
          batchSize: 150,
        })) {
          trades.push(trade);
        }

        expect(trades).toEqual(mockTrades);
      });

      it("should deduplicate trades based on key", async () => {
        const duplicateTrade: RawUserTrade = {
          proxyWallet: "0x123",
          side: "BUY",
          asset: "0xabc",
          conditionId: "0xdef",
          size: 100,
          price: 0.5,
          timestamp: 1234567890,
          title: "Test Market",
          slug: "test-market",
          icon: "icon.jpg",
          eventSlug: "test-event",
          outcome: "YES",
          outcomeIndex: 0,
          name: "Test User",
          pseudonym: "testuser",
          bio: "Test bio",
          profileImage: "profile.jpg",
          profileImageOptimized: "profile-opt.jpg",
          transactionHash: "0xtx123",
        };

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: [duplicateTrade, duplicateTrade] })
          .mockResolvedValueOnce({ data: [] });

        const trades: RawUserTrade[] = [];
        for await (const trade of dataApi.getRawUserTrades({
          user: "0x123",
        })) {
          trades.push(trade);
        }

        expect(trades.length).toBe(1);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 150", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const trades: RawUserTrade[] = [];
        for await (const trade of dataApi.getRawUserTrades({
          user: "0x123",
        })) {
          trades.push(trade);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/trades", {
          params: expect.objectContaining({ limit: 150 }),
        });
      });

      it("should stop when batch is empty", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const trades: RawUserTrade[] = [];
        for await (const trade of dataApi.getRawUserTrades({
          user: "0x123",
        })) {
          trades.push(trade);
        }

        expect(trades).toEqual([]);
      });
    });
  });

  describe("getRawUserPortfolioValue", () => {
    describe("happy path", () => {
      it("should fetch user portfolio value", async () => {
        const mockValue: UserValue[] = [
          { user: "0x123", value: 1000 },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockValue });

        const result = await dataApi.getRawUserPortfolioValue({
          user: "0x123",
          markets: ["0xabc"],
        });

        expect(result).toEqual(mockValue);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/value", {
          params: { user: "0x123", markets: ["0xabc"] },
        });
      });
    });
  });

  describe("getRawUserClosedPositionsPage", () => {
    describe("happy path", () => {
      it("should fetch closed positions page", async () => {
        const mockPositions: RawClosedPosition[] = [
          {
            proxyWallet: "0x123",
            asset: "0xabc",
            conditionId: "0xdef",
            avgPrice: 0.5,
            totalBought: 100,
            realizedPnl: 5,
            curPrice: 0.6,
            timestamp: 1234567890,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            oppositeOutcome: "NO",
            oppositeAsset: "0xghi",
            endDate: "2024-12-31T00:00:00Z",
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockPositions });

        const result = await dataApi.getRawUserClosedPositionsPage({
          user: "0x123",
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockPositions);
      });
    });
  });

  describe("getRawUserClosedPositions", () => {
    describe("happy path", () => {
      it("should yield closed positions", async () => {
        const mockPositions: RawClosedPosition[] = [
          {
            proxyWallet: "0x123",
            asset: "0xabc",
            conditionId: "0xdef",
            avgPrice: 0.5,
            totalBought: 100,
            realizedPnl: 5,
            curPrice: 0.6,
            timestamp: 1234567890,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            outcomeIndex: 0,
            oppositeOutcome: "NO",
            oppositeAsset: "0xghi",
            endDate: "2024-12-31T00:00:00Z",
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockPositions })
          .mockResolvedValueOnce({ data: [] });

        const positions: RawClosedPosition[] = [];
        for await (const position of dataApi.getRawUserClosedPositions({
          user: "0x123",
        })) {
          positions.push(position);
        }

        expect(positions).toEqual(mockPositions);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 50", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const positions: RawClosedPosition[] = [];
        for await (const position of dataApi.getRawUserClosedPositions({
          user: "0x123",
        })) {
          positions.push(position);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          "/closed-positions",
          {
            params: expect.objectContaining({ limit: 50 }),
          }
        );
      });
    });
  });

  describe("getRawUserActivityPage", () => {
    describe("happy path", () => {
      it("should fetch user activity page", async () => {
        const mockActivity: RawActivity[] = [
          {
            proxyWallet: "0x123",
            timestamp: 1234567890,
            conditionId: "0xdef",
            type: "TRADE",
            size: 100,
            usdcSize: 50,
            transactionHash: "0xtx123",
            price: 0.5,
            asset: "0xabc",
            side: "BUY",
            outcomeIndex: 0,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            name: "Test User",
            pseudonym: "testuser",
            bio: "Test bio",
            profileImage: "profile.jpg",
            profileImageOptimized: "profile-opt.jpg",
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockActivity });

        const result = await dataApi.getRawUserActivityPage({
          user: "0x123",
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockActivity);
      });
    });
  });

  describe("getRawUserActivity", () => {
    describe("happy path", () => {
      it("should yield user activity", async () => {
        const mockActivity: RawActivity[] = [
          {
            proxyWallet: "0x123",
            timestamp: 1234567890,
            conditionId: "0xdef",
            type: "TRADE",
            size: 100,
            usdcSize: 50,
            transactionHash: "0xtx123",
            price: 0.5,
            asset: "0xabc",
            side: "BUY",
            outcomeIndex: 0,
            title: "Test Market",
            slug: "test-market",
            icon: "icon.jpg",
            eventSlug: "test-event",
            outcome: "YES",
            name: "Test User",
            pseudonym: "testuser",
            bio: "Test bio",
            profileImage: "profile.jpg",
            profileImageOptimized: "profile-opt.jpg",
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockActivity })
          .mockResolvedValueOnce({ data: [] });

        const activities: RawActivity[] = [];
        for await (const activity of dataApi.getRawUserActivity({
          user: "0x123",
        })) {
          activities.push(activity);
        }

        expect(activities).toEqual(mockActivity);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 500", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const activities: RawActivity[] = [];
        for await (const activity of dataApi.getRawUserActivity({
          user: "0x123",
        })) {
          activities.push(activity);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/activity", {
          params: expect.objectContaining({ limit: 500 }),
        });
      });
    });
  });

  describe("getRawUserTraded", () => {
    describe("happy path", () => {
      it("should fetch user traded amount", async () => {
        const mockTraded: RawTraded = {
          user: "0x123",
          traded: 5000,
        };

        mockAxiosInstance.get.mockResolvedValue({ data: mockTraded });

        const result = await dataApi.getRawUserTraded("0x123");

        expect(result).toEqual(mockTraded);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/traded", {
          params: { user: "0x123" },
        });
      });
    });
  });

  describe("getRawLeaderboardPage", () => {
    describe("happy path", () => {
      it("should fetch leaderboard page", async () => {
        const mockLeaderboard: RawTraderLeaderboardEntry[] = [
          {
            rank: "1",
            proxyWallet: "0x123",
            userName: "testuser",
            vol: 5000,
            pnl: 1000,
            profileImage: "profile.jpg",
            xUsername: "testuser",
            verifiedBadge: false,
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockLeaderboard });

        const result = await dataApi.getRawLeaderboardPage({
          limit: 10,
          offset: 0,
        });

        expect(result).toEqual(mockLeaderboard);
      });
    });
  });

  describe("getRawLeaderboard", () => {
    describe("happy path", () => {
      it("should yield leaderboard entries", async () => {
        const mockLeaderboard: RawTraderLeaderboardEntry[] = [
          {
            rank: "1",
            proxyWallet: "0x123",
            userName: "testuser",
            vol: 5000,
            pnl: 1000,
            profileImage: "profile.jpg",
            xUsername: "testuser",
            verifiedBadge: false,
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockLeaderboard })
          .mockResolvedValueOnce({ data: [] });

        const entries: RawTraderLeaderboardEntry[] = [];
        for await (const entry of dataApi.getRawLeaderboard({
          limit: 10,
        })) {
          entries.push(entry);
        }

        expect(entries).toEqual(mockLeaderboard);
      });
    });

    describe("edge cases", () => {
      it("should use default batchSize of 50", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: null });

        const entries: RawTraderLeaderboardEntry[] = [];
        for await (const entry of dataApi.getRawLeaderboard({})) {
          entries.push(entry);
        }

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/v1/leaderboard", {
          params: expect.objectContaining({ limit: 50 }),
        });
      });
    });
  });

  describe("getRawBuilderLeaderboardPage", () => {
    describe("happy path", () => {
      it("should fetch builder leaderboard page", async () => {
        const mockLeaderboard: RawBuilderLeaderboardEntry[] = [
          {
            rank: "1",
            builder: "0x123",
            volume: 5000,
            activeUsers: 10,
            verified: false,
            builderLogo: "logo.jpg",
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockLeaderboard });

        const result = await dataApi.getRawBuilderLeaderboardPage();

        expect(result).toEqual(mockLeaderboard);
      });
    });
  });

  describe("getRawBuilderLeaderboard", () => {
    describe("happy path", () => {
      it("should yield builder leaderboard entries", async () => {
        const mockLeaderboard: RawBuilderLeaderboardEntry[] = [
          {
            rank: "1",
            builder: "0x123",
            volume: 5000,
            activeUsers: 10,
            verified: false,
            builderLogo: "logo.jpg",
          },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: mockLeaderboard })
          .mockResolvedValueOnce({ data: [] });

        const entries: RawBuilderLeaderboardEntry[] = [];
        for await (const entry of dataApi.getRawBuilderLeaderboard({})) {
          entries.push(entry);
        }

        expect(entries).toEqual(mockLeaderboard);
      });
    });
  });

  describe("getRawBuilderVolume", () => {
    describe("happy path", () => {
      it("should fetch builder volume", async () => {
        const mockVolume: RawBuilderVolumeEntry[] = [
          {
            dt: "2024-01-15T10:30:45Z",
            builder: "0x123",
            builderLogo: "logo.jpg",
            verified: false,
            volume: 5000,
            activeUsers: 10,
            rank: "1",
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: mockVolume });

        const result = await dataApi.getRawBuilderVolume();

        expect(result).toEqual(mockVolume);
      });
    });
  });
});

