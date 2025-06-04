/**
 * Default configuration for TradeGPT bot.
 * Exchange can be overridden later via localStorage or environment.
 */
export const botSettings = {
  /**
   * Primary exchange slug used by ccxt-pro.
   * Default = "blofin", but UI or env can switch to "binance", "bybit", etc.
   */
  exchange: "blofin",

  /** Top-20 high-volume USDT pairs (placeholders, tweak any time). */
  coinUniverse: [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT",
    "ADAUSDT","DOGEUSDT","LINKUSDT","DOTUSDT","AVAXUSDT",
    "TONUSDT","SHIBUSDT","MATICUSDT","PEPEUSDT","LTCUSDT",
    "TRXUSDT","BCHUSDT","ICPUSDT","UNIUSDT","ATOMUSDT"
  ],

  /** Candle time-frames we'll analyse. */
  timeframes: ["4h","12h","22h","1d","3d"],

  /** Risk parameters (fractions of total equity). */
  risk: {
    perTradeFraction: 0.01,        // 1 % risk per trade
    dailyLossCapFraction: 0.05     // 5 % max loss per day
  }
} as const; 