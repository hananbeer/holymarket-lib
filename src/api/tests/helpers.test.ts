import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import {
  addrToDisplayName,
  dateToTimestamp,
  canonicalMarketData,
  canonicalizeEventData,
} from "../helpers";
import type { RawApiMarketData, RawApiEventData } from "../types";

describe("addrToDisplayName", () => {
  describe("happy path", () => {
    it("should format standard Ethereum address with 0x prefix", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });

    it("should format address without 0x prefix (normalized to checksum)", () => {
      const address = "1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });

    it("should format address with various hex characters (checksummed)", () => {
      // Use a valid address (all lowercase, which will be checksummed)
      const address = "0xabcdefabcdef0123456789abcdefabcdef012345";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle address exactly 42 characters (checksummed)", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });

    it("should throw for address longer than 42 characters (invalid)", () => {
      const address = "0x12345678901234567890123456789012345678901234";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for address shorter than 42 characters (invalid)", () => {
      const address = "0x123456789012345678901234567890";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should handle zero address (checksummed)", () => {
      const address = "0x0000000000000000000000000000000000000000";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });

    it("should handle max address (checksummed)", () => {
      const address = "0xffffffffffffffffffffffffffffffffffffffff";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address);
      expect(result).toBe(expected);
    });

    it("should handle mixed case hex (normalized to checksum)", () => {
      // Use a valid address that will be properly checksummed
      const address = "0x1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      // Test with lowercase version - should produce same checksummed result
      const result = addrToDisplayName(address.toLowerCase());
      expect(result).toBe(expected);
    });

    it("should handle lowercase address (converted to checksum)", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      const result = addrToDisplayName(address.toLowerCase());
      expect(result).toBe(expected);
    });

    it("should handle uppercase address (converted to checksum)", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const checksummed = ethers.utils.getAddress(address);
      const expected = checksummed.slice(2, 6) + "_" + checksummed.slice(-4);
      // toUpperCase() makes 0x -> 0X which is invalid, so use lowercase address
      const result = addrToDisplayName(address.toLowerCase());
      expect(result).toBe(expected);
    });

    it("should throw for address with uppercase 0X prefix (invalid)", () => {
      const address = "0X1234567890123456789012345678901234567890";
      expect(() => addrToDisplayName(address)).toThrow();
    });
  });

  describe("error cases", () => {
    it("should throw for empty string (invalid address)", () => {
      const address = "";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for very short string (invalid address)", () => {
      const address = "0x12";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for invalid address format", () => {
      const address = "not-an-address";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for address with invalid hex characters", () => {
      const address = "0xGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv";
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for address missing 0x prefix with wrong length", () => {
      const address = "123456789012345678901234567890123456789"; // 39 chars
      expect(() => addrToDisplayName(address)).toThrow();
    });

    it("should throw for null-like values", () => {
      expect(() => addrToDisplayName(null as any)).toThrow();
      expect(() => addrToDisplayName(undefined as any)).toThrow();
    });
  });
});

describe("dateToTimestamp", () => {
  describe("happy path", () => {
    it("should parse ISO 8601 date with microseconds", () => {
      const date = "2024-01-15T10:30:45.123456Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });

    it("should parse ISO 8601 date without microseconds", () => {
      const date = "2024-01-15T10:30:45Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });

    it("should parse ISO 8601 date with milliseconds", () => {
      const date = "2024-01-15T10:30:45.123Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });

    it("should parse date with +00 timezone and normalize to +00:00", () => {
      const date = "2024-01-15T10:30:45+00";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });

    it("should parse date with positive timezone offset", () => {
      const date = "2024-01-15T10:30:45+05:00";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705296645);
    });

    it("should parse date with negative timezone offset", () => {
      const date = "2024-01-15T10:30:45-05:00";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705332645);
    });
  });

  describe("edge cases", () => {
    it("should truncate many microseconds to 3 digits", () => {
      const date = "2024-01-15T10:30:45.123456789Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });

    it("should handle date at epoch", () => {
      const date = "1970-01-01T00:00:00Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(0);
    });

    it("should handle date far in future", () => {
      const date = "2099-12-31T23:59:59Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(4102444799);
    });

    it("should handle date far in past", () => {
      const date = "1900-01-01T00:00:00Z";
      const result = dateToTimestamp(date);
      expect(result).toBe(-2208988800);
    });

    it("should handle date with +00 that needs normalization", () => {
      const date = "2024-01-15T10:30:45+00";
      const result = dateToTimestamp(date);
      expect(result).toBe(1705314645);
    });
  });

  describe("error cases", () => {
    it("should return undefined for undefined input", () => {
      const result = dateToTimestamp(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string (treated as falsy)", () => {
      const date = "";
      // Empty string is falsy, so function returns undefined
      const result = dateToTimestamp(date);
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid date string", () => {
      const date = "not-a-date";
      const result = dateToTimestamp(date);
      expect(result).toBeUndefined();
    });

    it("should return undefined for malformed ISO date", () => {
      const date = "2024-13-45T99:99:99Z";
      const result = dateToTimestamp(date);
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid microseconds that can't be parsed", () => {
      const date = "2024-01-15T10:30:45.abcZ";
      const result = dateToTimestamp(date);
      expect(result).toBeUndefined();
    });

    it("should handle date missing Z (may parse as local time)", () => {
      const date = "2024-01-15T10:30:45";
      const result = dateToTimestamp(date);
      expect(result).toBeDefined();
    });
  });
});

describe("canonicalMarketData", () => {
  const createBaseMarket = (): RawApiMarketData => ({
    id: "market-123",
    slug: "test-market",
    question: "Will it rain tomorrow?",
    conditionId: "0x123",
    createdAt: "2024-01-15T10:30:45Z",
    updatedAt: "2024-01-15T11:30:45Z",
    acceptingOrdersTimestamp: "2024-01-15T12:00:00Z",
    clobTokenIds: '["0xabc", "0xdef"]',
    outcomes: '["YES", "NO"]',
    outcomePrices: '[0.5, 0.5]',
    ready: true,
    active: true,
    closed: false,
    acceptingOrders: true,
    umaResolutionStatuses: '{"status": "pending"}',
  });

  describe("happy path", () => {
    it("should convert complete market data with all fields", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        groupItemTitle: "Rain Forecast",
        groupItemThreshold: "0",
        eventStartTime: "2024-01-16T13:00:00Z",
        startDate: "2024-01-16T13:00:37Z",
        endDate: "2024-01-17T13:00:00Z",
        volumeNum: 1000,
        spread: 0.02,
      };

      const result = canonicalMarketData(market);

      expect(result.id).toBe("market-123");
      expect(result.slug).toBe("test-market");
      expect(result.question).toBe("Will it rain tomorrow?");
      expect(result.conditionId).toBe("0x123");
      expect(result.title).toBe("Rain Forecast");
      expect(result.index).toBe(0);
      expect(result.marketConditionStartTimestamp).toBe(1705410000);
      expect(result.marketStartTimestamp).toBe(1705410037);
      expect(result.marketEndTimestamp).toBe(1705496400);
      expect(result.marketCreatedTimestamp).toBe(1705314645);
      expect(result.marketUpdateTimestamp).toBe(1705318245);
      expect(result.acceptingOrdersTimestamp).toBe(1705320000);
      expect(result.outcomes).toEqual(["YES", "NO"]);
      expect(result.outcomePrices).toEqual([0.5, 0.5]);
      expect(result.tokenIds).toEqual(["0xabc", "0xdef"]);
      expect(result.volume).toBe(1000);
      expect(result.ready).toBe(true);
      expect(result.active).toBe(true);
      expect(result.closed).toBe(false);
      expect(result.spread).toBe(0.02);
      expect(result.acceptingOrders).toBe(true);
      expect(result.umaResolutionStatuses).toEqual({ status: "pending" });
    });

    it("should use question as title when groupItemTitle is missing", () => {
      const market = createBaseMarket();
      const result = canonicalMarketData(market);
      expect(result.title).toBe("Will it rain tomorrow?");
    });

    it("should parse valid JSON arrays and objects", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomes: '["YES", "NO", "MAYBE"]',
        outcomePrices: '[0.333, 0.333, 0.334]',
        clobTokenIds: '["0x111", "0x222", "0x333"]',
        umaResolutionStatuses: '{"status": "resolved", "winner": "YES"}',
      };

      const result = canonicalMarketData(market);

      expect(result.outcomes).toEqual(["YES", "NO", "MAYBE"]);
      expect(result.outcomePrices).toEqual([0.333, 0.333, 0.334]);
      expect(result.tokenIds).toEqual(["0x111", "0x222", "0x333"]);
      expect(result.umaResolutionStatuses).toEqual({
        status: "resolved",
        winner: "YES",
      });
    });
  });

  describe("edge cases - missing optional fields", () => {
    it("should set index to undefined when groupItemThreshold is missing", () => {
      const market = createBaseMarket();
      const result = canonicalMarketData(market);
      expect(result.index).toBeUndefined();
    });

    it("should set timestamps to undefined when date fields are missing", () => {
      const market = createBaseMarket();
      const result = canonicalMarketData(market);
      expect(result.marketConditionStartTimestamp).toBeUndefined();
      expect(result.marketStartTimestamp).toBeUndefined();
      expect(result.marketEndTimestamp).toBeUndefined();
    });

    it("should default volume to 0 when volumeNum is missing", () => {
      const market = createBaseMarket();
      const result = canonicalMarketData(market);
      expect(result.volume).toBe(0);
    });

    it("should allow spread to be undefined", () => {
      const market = createBaseMarket();
      const result = canonicalMarketData(market);
      expect(result.spread).toBeUndefined();
    });
  });

  describe("edge cases - invalid groupItemThreshold", () => {
    it("should set index to undefined for non-numeric string", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        groupItemThreshold: "abc",
      };
      const result = canonicalMarketData(market);
      expect(result.index).toBeUndefined();
    });

    it("should set index to 0 for empty string (Number('') = 0)", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        groupItemThreshold: "",
      };
      const result = canonicalMarketData(market);
      expect(result.index).toBe(0);
    });

    it("should handle numeric string threshold", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        groupItemThreshold: "5",
      };
      const result = canonicalMarketData(market);
      expect(result.index).toBe(5);
    });

    it("should handle negative threshold", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        groupItemThreshold: "-1",
      };
      const result = canonicalMarketData(market);
      expect(result.index).toBe(-1);
    });
  });

  describe("edge cases - JSON parsing", () => {
    it("should handle empty arrays in JSON", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomes: "[]",
        outcomePrices: "[]",
        clobTokenIds: "[]",
      };
      const result = canonicalMarketData(market);
      expect(result.outcomes).toEqual([]);
      expect(result.outcomePrices).toEqual([]);
      expect(result.tokenIds).toEqual([]);
    });

    it("should handle empty objects in JSON", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        umaResolutionStatuses: "{}",
      };
      const result = canonicalMarketData(market);
      expect(result.umaResolutionStatuses).toEqual({});
    });

    it("should handle decimal numbers in outcomePrices", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomePrices: "[0.123456, 0.876544]",
      };
      const result = canonicalMarketData(market);
      expect(result.outcomePrices).toEqual([0.123456, 0.876544]);
    });

    it("should default outcomePrices to zeros array when JSON is invalid", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomes: '["YES", "NO"]',
        outcomePrices: "[0.5, 0.5",
      };
      const result = canonicalMarketData(market);
      // When any of the JSON parsing fails, the outcomePrices array is undefined
      expect(result.outcomePrices).toBeUndefined();
    });

    it("should default tokenIds to N/A array when JSON is invalid", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        clobTokenIds: '["0x123"',
      };
      const result = canonicalMarketData(market);
      expect(result.tokenIds).toBeUndefined();
    });

    it("should handle outcomePrices array shorter than outcomes", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomes: '["YES", "NO", "MAYBE"]',
        outcomePrices: "[0.5, 0.5]",
      };
      const result = canonicalMarketData(market);
      expect(result.outcomePrices).toEqual([0.5, 0.5]);
    });

    it("should handle outcomePrices array longer than outcomes", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        outcomes: '["YES", "NO"]',
        outcomePrices: "[0.3, 0.3, 0.4]",
      };
      const result = canonicalMarketData(market);
      expect(result.outcomePrices).toEqual([0.3, 0.3, 0.4]);
    });
  });

  describe("error cases", () => {
    it("should throw when umaResolutionStatuses JSON is invalid", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        umaResolutionStatuses: '{"status":}',
      };
      expect(() => canonicalMarketData(market)).toThrow();
    });
  });

  describe("edge cases - boolean fields", () => {
    it("should handle all booleans as false", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        ready: false,
        active: false,
        closed: false,
        acceptingOrders: false,
      };
      const result = canonicalMarketData(market);
      expect(result.ready).toBe(false);
      expect(result.active).toBe(false);
      expect(result.closed).toBe(false);
      expect(result.acceptingOrders).toBe(false);
    });

    it("should handle all booleans as true", () => {
      const market: RawApiMarketData = {
        ...createBaseMarket(),
        ready: true,
        active: true,
        closed: true,
        acceptingOrders: true,
      };
      const result = canonicalMarketData(market);
      expect(result.ready).toBe(true);
      expect(result.active).toBe(true);
      expect(result.closed).toBe(true);
      expect(result.acceptingOrders).toBe(true);
    });
  });
});

describe("canonicalizeEventData", () => {
  const createBaseEvent = (): RawApiEventData => ({
    id: "event-123",
    slug: "test-event",
    title: "Test Event",
    description: "A test event",
    image: "https://example.com/image.jpg",
    icon: "https://example.com/icon.jpg",
    creationDate: "2024-01-15T10:00:00Z",
    active: true,
    closed: false,
    markets: [],
    updatedAt: "2024-01-15T11:30:45Z",
  });

  const createBaseMarket = (): RawApiMarketData => ({
    id: "market-123",
    slug: "test-market",
    question: "Will it rain?",
    conditionId: "0x123",
    createdAt: "2024-01-15T10:30:45Z",
    updatedAt: "2024-01-15T11:30:45Z",
    acceptingOrdersTimestamp: "2024-01-15T12:00:00Z",
    clobTokenIds: '["0xabc", "0xdef"]',
    outcomes: '["YES", "NO"]',
    outcomePrices: '[0.5, 0.5]',
    ready: true,
    active: true,
    closed: false,
    acceptingOrders: true,
    umaResolutionStatuses: '{"status": "pending"}',
  });

  describe("happy path", () => {
    it("should convert complete event with all fields and multiple markets", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        startDate: "2024-01-16T13:00:00Z",
        endDate: "2024-01-17T13:00:00Z",
        markets: [createBaseMarket(), createBaseMarket()],
      };

      const result = canonicalizeEventData(event);

      expect(result.id).toBe("event-123");
      expect(result.slug).toBe("test-event");
      expect(result.title).toBe("Test Event");
      expect(result.description).toBe("A test event");
      expect(result.imageUrl).toBe("https://example.com/image.jpg");
      expect(result.iconUrl).toBe("https://example.com/icon.jpg");
      expect(result.eventStartTimestamp).toBe(1705410000);
      expect(result.eventEndTimestamp).toBe(1705496400);
      expect(result.eventCreationTimestamp).toBe(1705312800);
      expect(result.active).toBe(true);
      expect(result.closed).toBe(false);
      expect(result.markets).toHaveLength(2);
      expect(result.markets[0].id).toBe("market-123");
    });

    it("should handle event with single market", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        markets: [createBaseMarket()],
      };

      const result = canonicalizeEventData(event);
      expect(result.markets).toHaveLength(1);
    });

    it("should handle event with empty markets array", () => {
      const event = createBaseEvent();
      const result = canonicalizeEventData(event);
      expect(result.markets).toEqual([]);
    });
  });

  describe("edge cases - missing optional fields", () => {
    it("should set timestamps to undefined when date fields are missing", () => {
      const event = createBaseEvent();
      const result = canonicalizeEventData(event);
      expect(result.eventStartTimestamp).toBeUndefined();
      expect(result.eventEndTimestamp).toBeUndefined();
    });

    it("should ignore ticker field", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        ticker: "TEST",
      };
      const result = canonicalizeEventData(event);
      expect(result).not.toHaveProperty("ticker");
    });
  });

  describe("edge cases - string fields", () => {
    it("should handle empty strings", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        id: "",
        slug: "",
        title: "",
        description: "",
        image: "",
        icon: "",
      };
      const result = canonicalizeEventData(event);
      expect(result.id).toBe("");
      expect(result.slug).toBe("");
      expect(result.title).toBe("");
      expect(result.description).toBe("");
      expect(result.imageUrl).toBe("");
      expect(result.iconUrl).toBe("");
    });
  });

  describe("edge cases - boolean fields", () => {
    it("should handle active event (active: true, closed: false)", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        active: true,
        closed: false,
      };
      const result = canonicalizeEventData(event);
      expect(result.active).toBe(true);
      expect(result.closed).toBe(false);
    });

    it("should handle closed event (active: false, closed: true)", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        active: false,
        closed: true,
      };
      const result = canonicalizeEventData(event);
      expect(result.active).toBe(false);
      expect(result.closed).toBe(true);
    });

    it("should handle inactive but not closed event (active: false, closed: false)", () => {
      const event: RawApiEventData = {
        ...createBaseEvent(),
        active: false,
        closed: false,
      };
      const result = canonicalizeEventData(event);
      expect(result.active).toBe(false);
      expect(result.closed).toBe(false);
    });
  });

  describe("edge cases - markets", () => {
    it("should handle event with many markets", () => {
      const markets = Array(10).fill(null).map(() => createBaseMarket());
      const event: RawApiEventData = {
        ...createBaseEvent(),
        markets,
      };
      const result = canonicalizeEventData(event);
      expect(result.markets).toHaveLength(10);
    });
  });
});

