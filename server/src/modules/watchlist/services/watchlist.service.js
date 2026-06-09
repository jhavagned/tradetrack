// /server/src/modules/watchlist/services/watchlist.service.js

const WatchlistRepository = require("../repositories/watchlist.repository");
const createLogger = require("../../../utils/logger");

const logger = createLogger("watchlist.service");

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

/**
 * Futures proxy labels
 * Maps ETF symbols to their futures equivalents for display
 */
const FUTURES_PROXIES = {
  QQQ: "NQ",
  SPY: "ES",
  IWM: "RTY",
  DIA: "YM",
};

/**
 * Default watchlist symbols for new users
 */
const DEFAULT_SYMBOLS = [
  "QQQ",
  "SPY",
  "IWM",
  "DIA",
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "META",
  "TSLA",
];

/**
 * Quote Cache
 *
 * Caches quotes at the symbol level for 60 seconds.
 * Shared across all users — reduces Finnhub API calls
 * for commonly watched symbols (QQQ, SPY, NVDA etc.)
 *
 * Key:   symbol string
 * Value: { data: quote, fetchedAt: timestamp }
 *
 * Cache lives as long as the server process runs.
 * A server restart clears it — acceptable for this use case.
 */
const quoteCache = {};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Fetch a quote for a single symbol from Finnhub
 * Returns cached result if fetched within the last 60 seconds
 *
 * @param {string} symbol
 * @returns {Object} { symbol, label, price, change, changePercent, previousClose }
 */
const fetchQuote = async (symbol) => {
  const cached = quoteCache[symbol];
  const now = Date.now();

  // Return cached quote if still fresh
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    logger.debug("Returning cached quote", { symbol });
    return cached.data;
  }

  const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
  const res = await fetch(url);

  // Rate limited — return stale cache if available, otherwise throw
  if (res.status === 429) {
    if (cached) {
      logger.warn("Rate limited by Finnhub — returning stale cache", {
        symbol,
      });
      return cached.data;
    }

    const err = new Error("Rate limit reached. Please try again in a moment.");
    err.code = "RATE_LIMIT";
    err.status = 429;
    throw err;
  }

  const data = await res.json();

  const quote = {
    symbol,
    label: FUTURES_PROXIES[symbol] || null,
    price: data.c || null,
    change: data.d || null,
    changePercent: data.dp || null,
    previousClose: data.pc || null,
  };

  // Store in cache
  quoteCache[symbol] = {
    data: quote,
    fetchedAt: now,
  };

  logger.debug("Quote fetched and cached", { symbol });

  return quote;
};

const WatchlistService = {
  /**
   * Get watchlist items for a user
   * Seeds default watchlist if user has none
   *
   * @param {string} userId
   * @returns {Array} watchlist items
   */
  getWatchlist: async (userId) => {
    logger.debug("Getting watchlist", { userId });

    const items = await WatchlistRepository.findAll(userId);

    // Seed default watchlist for new users
    if (items.length === 0) {
      logger.debug("Seeding default watchlist", { userId });

      for (let i = 0; i < DEFAULT_SYMBOLS.length; i++) {
        await WatchlistRepository.addItem(userId, DEFAULT_SYMBOLS[i], i);
      }

      return WatchlistRepository.findAll(userId);
    }

    return items;
  },

  /**
   * Add a ticker to the watchlist
   *
   * BUSINESS RULES:
   * - Symbol must not already exist in the watchlist
   * - Maximum 30 items per watchlist
   *
   * @param {string} userId
   * @param {string} symbol
   * @returns {Object} the new watchlist item
   */
  addItem: async (userId, symbol) => {
    logger.debug("Adding item to watchlist", { userId, symbol });

    const exists = await WatchlistRepository.symbolExists(userId, symbol);

    if (exists) {
      const err = new Error(`${symbol} is already in your watchlist`);
      err.code = "DUPLICATE_ERROR";
      err.status = 409;
      throw err;
    }

    const count = await WatchlistRepository.countItems(userId);

    if (count >= 30) {
      const err = new Error("Watchlist limit reached. Maximum 30 items.");
      err.code = "VALIDATION_ERROR";
      err.status = 400;
      throw err;
    }

    return WatchlistRepository.addItem(userId, symbol, count);
  },

  /**
   * Remove a ticker from the watchlist
   *
   * @param {string} itemId
   * @param {string} userId
   * @returns {void}
   */
  removeItem: async (itemId, userId) => {
    logger.debug("Removing item from watchlist", { itemId, userId });

    await WatchlistRepository.removeItem(itemId, userId);

    logger.info("Watchlist item removed", { itemId });
  },

  /**
   * Fetch live quotes for all watchlist symbols
   * Uses symbol-level cache to reduce Finnhub API calls
   *
   * @param {string} userId
   * @returns {Array} quotes with price data
   */
  getQuotes: async (userId) => {
    logger.debug("Fetching quotes for watchlist", { userId });

    const items = await WatchlistRepository.findAll(userId);

    if (items.length === 0) return [];

    // Fetch all quotes in parallel
    const quotes = await Promise.all(
      items.map((item) => fetchQuote(item.symbol)),
    );

    logger.debug("Quotes fetched", { count: quotes.length });

    return quotes;
  },
};

module.exports = WatchlistService;
