# holymarket-lib

A TypeScript library for interacting with Polymarket's API, providing convenient access to events, markets, user data, and real-time price feeds.

## Description

`holymarket-lib` is a comprehensive TypeScript library that simplifies interaction with Polymarket's prediction markets. It provides a clean, type-safe interface for:

- **Events & Markets**: Fetch and search events, markets, and market data
- **User Data**: Query user positions, trades, and portfolio values
- **CLOB Data**: Access order books, price history, and current prices
- **Real-time Feeds**: Subscribe to live price feeds for crypto assets

The library handles data normalization and provides async generators for efficient pagination of large datasets.

## Installation

```bash
npm install holymarket-lib
# or
pnpm add holymarket-lib
# or
yarn add holymarket-lib
```

## Usage

### Basic Setup

```typescript
import holymarket from 'holymarket-lib';

// Access the API module
const { api } = holymarket;
```

### Fetching Events

```typescript
// Get a single event by slug or ID
const event = await api.getEvent('will-bitcoin-reach-100k-in-2024');

// Get all active and open events
for await (const event of api.getAllEventsActiveAndOpen()) {
  console.log(event.title, event.slug);
}

// Search events
for await (const event of api.getSearchEvents({
  query: 'bitcoin',
  tags: ['crypto'],
  limit: 100
})) {
  console.log(event.title);
}

// Get events updated since a timestamp
for await (const event of api.getAllEventsUpdatedSince({
  sinceTimestamp: Math.floor(Date.now() / 1000) - 3600, // last hour
  seriesSlug: 'bitcoin-up-and-down'
})) {
  console.log(event.title);
}
```

### Fetching Markets

```typescript
// Get a market by ID or slug
const market = await api.getMarket('0x123...');
// or
const market = await api.getMarketBySlug('will-bitcoin-reach-100k-yes');

// Get market by ID
const market = await api.getMarketById('0x123...');

// List markets with filters
for await (const market of api.getMarketsList({
  active: true,
  closed: false,
  order: 'volume',
  ascending: false
})) {
  console.log(market.question, market.outcomePrices);
}
```

### User Data

```typescript
// Get user positions
for await (const position of api.getUserPositions({
  address: '0x123...',
  redeemable: true,
  sortBy: 'size',
  sortDirection: 'desc'
})) {
  console.log(position.asset, position.size);
}

// Get user portfolio value
const portfolioValue = await api.getUserPortfolioValue({
  address: '0x123...',
  conditionIds: ['0xabc...'] // optional: filter by specific markets
});

// Get total traded volume for a user
const totalTraded = await api.getUserTraded('0x123...');

// Get user trades
for await (const trade of api.getUserTrades({
  address: '0x123...',
  conditionIds: ['0xabc...'], // optional
  side: 'buy', // or 'sell'
  limit: 100
})) {
  console.log(trade.asset, trade.price, trade.size, trade.timestamp);
}
```

### CLOB (Order Book) Data

(note: minimal implementation as there is `@polymarket/clob-client` library)

```typescript
import { clob } from 'holymarket-lib/api';

// Get current price for a token
const price = await clob.getCurrentPrice({
  token_id: '0x123...',
  side: 'buy' // or 'sell'
});

// Get price history
const history = await clob.getRawMarketHistory({
  tokenId: '0x123...',
  fidelityMin: 60, // seconds
  startTimestamp: Math.floor(Date.now() / 1000) - 86400 // last 24 hours
});

// Get order book
const orderBook = await clob.getOrderBook({
  token_id: '0x123...'
});
```

### Real-time Price Feeds

```typescript
import { realtime } from 'holymarket-lib';

// Subscribe to crypto price feeds
const pricefeed = realtime.pricefeed.createCryptoPriceFeed({
  ticker: 'btc',
  source: 'chainlink' // or 'binance'
});

pricefeed.on('price', (price) => {
  console.log('BTC/USD:', price);
});

pricefeed.on('error', (error) => {
  console.error('Price feed error:', error);
});

// Clean up when done
pricefeed.close();
```

## Build Process

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (or npm/yarn)

### Building the Library

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

The compiled output is placed in the `build/` directory, which is included in the npm package.

### Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests once
pnpm test:run
```

## Contribution Guidelines

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/holymarket-lib.git`
3. Install dependencies: `pnpm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`
5. Submit a PR

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Author

high_byte

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
