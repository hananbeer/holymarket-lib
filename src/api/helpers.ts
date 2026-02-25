import { ethers } from 'ethers';
import type { RawApiMarketData, RawApiEventData, MarketData, EventData } from './types.js';

export function addrToDisplayName(address: string): string {
  const normalizedAddress = ethers.utils.getAddress(address);
  return normalizedAddress.slice(2, 6) + '_' + normalizedAddress.slice(-4);
}

export function dateToTimestamp(date: string | undefined): number | undefined {
  if (!date) {
    return undefined;
  }

  const normalizedDate = date.replace('+00', '+00:00');
  let parsed: Date = new Date(normalizedDate.replace(/\.(\d{3})\d*Z$/, '.$1Z'));
  if (isNaN(parsed.getTime())) {
    parsed = new Date(normalizedDate);
  }

  if (isNaN(parsed.getTime())) {
    // throw new Error('Invalid date format');
    return undefined;
  }

  return Math.floor(parsed.getTime() / 1000);
}

// export function semiIsoToTimestamp(date: string): number {
//   const normalizedDate = date.replace('+00', '+00:00');
//   const parsed = new Date(normalizedDate);
//   if (isNaN(parsed.getTime())) {
//     throw new Error('Invalid date format');
//   }
//   return Math.floor(parsed.getTime() / 1000);
// }

function safeNumber(n: number | string | undefined): number {
  if (isNaN(Number(n))) {
    return 0;
  }

  return Number(n);
}

export function canonicalMarketData(market: RawApiMarketData): MarketData {
  const canon: Partial<MarketData> = {};

  canon.id = market.id;
  canon.slug = market.slug;
  canon.question = market.question;
  canon.conditionId = market.conditionId;
  canon.title = market.groupItemTitle ?? market.question;

  const index = Number(market.groupItemThreshold);
  canon.index = isNaN(index) ? undefined : index;

  // the marketConditionStartTimestamp is the start of the event period
  // eg. for Bitcoin Up-and-Down 13:00-14:00, this would be 13:00
  // whereas the marketStartTimestamp is the market activation time, eg: 08:14:37 of the day before
  canon.marketConditionStartTimestamp = dateToTimestamp(market.eventStartTime);
  canon.marketStartTimestamp = dateToTimestamp(market.startDate);
  canon.marketEndTimestamp = dateToTimestamp(market.endDate);

  canon.marketCreatedTimestamp = dateToTimestamp(market.createdAt);
  // canon.marketClosedTimestamp = semiIsoToTimestamp(market.closedTime) // polymarket is inconsistent...
  canon.marketUpdateTimestamp = dateToTimestamp(market.updatedAt);
  // canon.umaEndDate = dateToTimestamp(market.umaEndDate) // inconsistent formats

  try {
    canon.outcomes = JSON.parse(market.outcomes);
    canon.outcomePrices = JSON.parse(market.outcomePrices).map(Number);
    canon.tokenIds = JSON.parse(market.clobTokenIds).map(String);
  } catch {
    canon.outcomes = undefined;
    canon.tokenIds = undefined;
    canon.outcomePrices = undefined;
  }

  canon.ready = market.ready;
  canon.active = market.active;
  canon.closed = market.closed;
  canon.spread = market.spread;
  canon.acceptingOrders = market.acceptingOrders ?? false;
  canon.acceptingOrdersTimestamp = dateToTimestamp(market.acceptingOrdersTimestamp);
  canon.umaResolutionStatuses = JSON.parse(market.umaResolutionStatuses);

  canon.volume = market.volumeNum ?? 0;
  canon.volume24hr = market.volume24hr ?? 0;
  canon.volume1wk = market.volume1wk ?? 0;
  canon.volume1mo = market.volume1mo ?? 0;
  canon.volume1yr = market.volume1yr ?? 0;
  canon.liquidity = safeNumber(market.liquidity);

  return canon as MarketData;
}

export function canonicalizeEventData(event: RawApiEventData): EventData {
  const canon: EventData = {
    id: event.id,
    slug: event.slug,
    seriesSlug: event.seriesSlug,
    title: event.title,
    description: event.description,
    imageUrl: event.image,
    iconUrl: event.icon,
    eventStartTimestamp: dateToTimestamp(event?.startDate),
    eventEndTimestamp: dateToTimestamp(event?.endDate),
    eventCreationTimestamp: dateToTimestamp(event?.createdAt ?? event?.creationDate), // not sure why there are two properties and different values as well, prefer createdAt
    eventUpdateTimestamp: dateToTimestamp(event?.updatedAt),
    active: event.active,
    closed: event.closed,
    markets: event.markets?.map(market => canonicalMarketData(market)) ?? [],
    tags: event.tags,

    volume: safeNumber(event.volume),
    volume24hr: event.volume24hr ?? 0,
    volume1wk: event.volume1wk ?? 0,
    volume1mo: event.volume1mo ?? 0,
    volume1yr: event.volume1yr ?? 0,
    liquidity: safeNumber(event.liquidity),
    openInterest: event.openInterest ?? 0,
    umaResolutionStatus: event.umaResolutionStatus ?? '',
  };

  // add volume and openInterest?

  return canon;
}


/**
 * Parse size input and convert to token units
 * Supports:
 * - Number: raw token units
 * - String with '$' prefix: dollar amount (e.g., "$10" -> $10 worth of shares)
 * - String with 'c' suffix: cents (e.g., "50c" -> $0.50 worth of shares)
 */
export function parseOrderSize(sizeInput: number | string, price: number): number {
  if (typeof sizeInput === 'number') {
    return sizeInput;
  }

  const sizeStr = sizeInput.toString().trim();

  if (sizeStr.startsWith('$')) {
    // Dollar amount: convert to shares
    const dollarAmount = parseFloat(sizeStr.slice(1));
    if (isNaN(dollarAmount) || dollarAmount <= 0) {
      throw new Error(`Invalid dollar amount: ${sizeStr}. Must be a positive number`);
    }
    // Calculate shares: dollarAmount / price
    const shares = dollarAmount / price;
    if (shares <= 0) {
      throw new Error(`Calculated size is too small. Increase dollar amount or check price.`);
    }
    return shares;
  }

  if (sizeStr.endsWith('c')) {
    // Cents: convert to dollars first, then to shares
    const cents = parseFloat(sizeStr.slice(0, -1));
    if (isNaN(cents) || cents <= 0) {
      throw new Error(`Invalid cents amount: ${sizeStr}. Must be a positive number`);
    }
    const dollarAmount = cents / 100;
    // Calculate shares: dollarAmount / price
    const shares = dollarAmount / price;
    if (shares <= 0) {
      throw new Error(`Calculated size is too small. Increase cents amount or check price.`);
    }
    return shares;
  }

  // Try parsing as a number (raw token units)
  const parsedSize = parseFloat(sizeStr);
  if (isNaN(parsedSize) || parsedSize <= 0) {
    throw new Error(`Invalid size: ${sizeStr}. Must be a number, dollar amount (e.g., "$10"), or cents (e.g., "50c")`);
  }
  return parsedSize;
}
