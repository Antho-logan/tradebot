import { generateSignal, Signal, Candle } from '../strategies/strategyCore';
import { calculatePositionSize, PositionSizeResult } from './riskManager';
import { executePaper, executeLive, closePosition, getOpenPositions, TradeOrder } from './tradeSender';
import { tradeLogger } from './tradeLogger';

// Portfolio state interface
export interface PortfolioState {
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
  unrealizedPnL: number;
  dailyPnL: number;
  totalTrades: number;
  winRate: number;
  openPositions: TradeOrder[];
}

// Bot configuration
export interface BotConfig {
  enabled: boolean;
  mode: 'paper' | 'live';
  pairs: string[];
  maxPositions: number;
  riskPerTrade: number;
  checkInterval: number; // milliseconds
  startingBalance: number;
}

// Default bot configuration
const defaultConfig: BotConfig = {
  enabled: false,
  mode: 'paper',
  pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  maxPositions: 5,
  riskPerTrade: 0.02, // 2% risk per trade
  checkInterval: 60000, // Check every minute
  startingBalance: 1000
};

class RealTradingBot {
  private config: BotConfig;
  private portfolio: PortfolioState;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastSignalCheck: { [pair: string]: number } = {};

  constructor(config: Partial<BotConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.portfolio = this.initializePortfolio();
  }

  private initializePortfolio(): PortfolioState {
    return {
      balance: this.config.startingBalance,
      equity: this.config.startingBalance,
      freeMargin: this.config.startingBalance,
      usedMargin: 0,
      unrealizedPnL: 0,
      dailyPnL: 0,
      totalTrades: 0,
      winRate: 0,
      openPositions: []
    };
  }

  /**
   * Start the trading bot
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Trading bot is already running');
      return;
    }

    console.log(`🚀 Starting Real Trading Bot in ${this.config.mode.toUpperCase()} mode`);
    console.log(`📊 Monitoring pairs: ${this.config.pairs.join(', ')}`);
    console.log(`💰 Starting balance: $${this.config.startingBalance}`);
    console.log(`⚡ Check interval: ${this.config.checkInterval / 1000}s`);

    this.isRunning = true;
    this.config.enabled = true;

    // Start the main trading loop
    this.intervalId = setInterval(() => {
      this.runTradingCycle().catch(error => {
        console.error('Trading cycle error:', error);
      });
    }, this.config.checkInterval);

    // Run initial cycle
    await this.runTradingCycle();
  }

  /**
   * Stop the trading bot
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('Trading bot is not running');
      return;
    }

    console.log('🛑 Stopping Real Trading Bot');
    this.isRunning = false;
    this.config.enabled = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Main trading cycle - runs every interval
   */
  private async runTradingCycle(): Promise<void> {
    try {
      console.log('🔄 Running trading cycle...');

      // Update portfolio state
      await this.updatePortfolio();

      // Check for new signals on each pair
      for (const pair of this.config.pairs) {
        await this.checkPairForSignals(pair);
      }

      // Check for position exits
      await this.checkPositionExits();

      console.log(`📈 Portfolio: $${this.portfolio.equity.toFixed(2)} | Open: ${this.portfolio.openPositions.length} | P&L: $${this.portfolio.unrealizedPnL.toFixed(2)}`);

    } catch (error) {
      console.error('Trading cycle error:', error);
    }
  }

  /**
   * Check a specific pair for trading signals
   */
  private async checkPairForSignals(pair: string): Promise<void> {
    try {
      // Don't check too frequently for the same pair
      const now = Date.now();
      const lastCheck = this.lastSignalCheck[pair] || 0;
      if (now - lastCheck < 30000) return; // 30 second cooldown

      // Check if we can open more positions
      if (this.portfolio.openPositions.length >= this.config.maxPositions) {
        return;
      }

      // Check if we already have a position on this pair
      const existingPosition = this.portfolio.openPositions.find(pos => pos.pair === pair);
      if (existingPosition) {
        return;
      }

      // Get market data for signal generation
      const candles4h = await this.getMarketData(pair, '4h', 50);
      const candles15m = await this.getMarketData(pair, '15m', 100);

      if (!candles4h.length || !candles15m.length) {
        console.log(`⚠️ No market data available for ${pair}`);
        return;
      }

      // Generate signal using your strategy
      const signal = generateSignal(pair, candles4h, candles15m);
      
      if (!signal) {
        this.lastSignalCheck[pair] = now;
        return;
      }

      console.log(`🎯 Signal generated for ${pair}: ${signal.side.toUpperCase()} at $${signal.entry.toFixed(2)} (confidence: ${(signal.confidence * 100).toFixed(1)}%)`);

      // Calculate position size
      const positionSize = calculatePositionSize(
        this.portfolio,
        signal.riskPct || this.config.riskPerTrade,
        signal.entry,
        signal.sl
      );

      if (!positionSize.canTrade) {
        console.log(`❌ Cannot trade ${pair}: ${positionSize.reason}`);
        return;
      }

      // Execute the trade
      const currentPrice = candles15m[candles15m.length - 1].close;
      const result = this.config.mode === 'paper' 
        ? await executePaper(signal, positionSize, currentPrice)
        : await executeLive(signal, positionSize);

      if (result.success) {
        console.log(`✅ Trade executed: ${signal.side.toUpperCase()} ${pair} - Size: $${positionSize.sizeUsd.toFixed(2)}`);
        
        // Update portfolio
        await this.updatePortfolio();
      } else {
        console.log(`❌ Trade failed for ${pair}: ${result.error}`);
      }

      this.lastSignalCheck[pair] = now;

    } catch (error) {
      console.error(`Error checking signals for ${pair}:`, error);
    }
  }

  /**
   * Check for position exits (TP/SL hits)
   */
  private async checkPositionExits(): Promise<void> {
    for (const position of this.portfolio.openPositions) {
      try {
        // Get current price
        const candles = await this.getMarketData(position.pair, '1m', 1);
        if (!candles.length) continue;

        const currentPrice = candles[0].close;

        // Check stop loss
        const shouldHitSL = position.side === 'long' 
          ? currentPrice <= position.sl
          : currentPrice >= position.sl;

        if (shouldHitSL) {
          console.log(`🛑 Stop Loss hit for ${position.pair} at $${currentPrice.toFixed(2)}`);
          await closePosition(position.id, currentPrice, 'sl');
          continue;
        }

        // Check take profit levels
        for (let i = 0; i < position.tp.length; i++) {
          const tpLevel = position.tp[i];
          const shouldHitTP = position.side === 'long'
            ? currentPrice >= tpLevel
            : currentPrice <= tpLevel;

          if (shouldHitTP) {
            console.log(`🎯 Take Profit ${i + 1} hit for ${position.pair} at $${currentPrice.toFixed(2)}`);
            
            // Close partial position (33% each TP level)
            const partialSize = position.sizeUsd * 0.33;
            await closePosition(position.id, currentPrice, 'tp1');
            break;
          }
        }

      } catch (error) {
        console.error(`Error checking exits for ${position.pair}:`, error);
      }
    }
  }

  /**
   * Update portfolio state with current positions and P&L
   */
  private async updatePortfolio(): Promise<void> {
    try {
      // Get current open positions
      const openPositions = await getOpenPositions();
      this.portfolio.openPositions = openPositions;

      // Calculate unrealized P&L
      let totalUnrealizedPnL = 0;
      let totalUsedMargin = 0;

      for (const position of openPositions) {
        // Get current price
        const candles = await this.getMarketData(position.pair, '1m', 1);
        if (!candles.length) continue;

        const currentPrice = candles[0].close;
        const entryPrice = position.entry;
        const sizeUsd = position.sizeUsd;

        // Calculate P&L
        let pnl = 0;
        if (position.side === 'long') {
          pnl = ((currentPrice - entryPrice) / entryPrice) * sizeUsd;
        } else {
          pnl = ((entryPrice - currentPrice) / entryPrice) * sizeUsd;
        }

        totalUnrealizedPnL += pnl;
        totalUsedMargin += sizeUsd;
      }

      // Update portfolio state
      this.portfolio.unrealizedPnL = totalUnrealizedPnL;
      this.portfolio.usedMargin = totalUsedMargin;
      this.portfolio.freeMargin = this.portfolio.balance - totalUsedMargin;
      this.portfolio.equity = this.portfolio.balance + totalUnrealizedPnL;

    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  }

  /**
   * Get market data for a specific pair and timeframe
   */
  private async getMarketData(pair: string, timeframe: string, limit: number): Promise<Candle[]> {
    try {
      // This would normally fetch from your data provider (Bybit, Binance, etc.)
      // For now, we'll simulate realistic market data
      return this.generateRealisticCandles(pair, timeframe, limit);
    } catch (error) {
      console.error(`Error fetching market data for ${pair}:`, error);
      return [];
    }
  }

  /**
   * Generate realistic candle data for testing
   * In production, replace this with real market data API calls
   */
  private generateRealisticCandles(pair: string, timeframe: string, limit: number): Candle[] {
    const candles: Candle[] = [];
    const now = Date.now();
    const timeframeMs = this.getTimeframeMs(timeframe);
    
    // Base prices for different pairs
    const basePrices: { [key: string]: number } = {
      'BTC/USDT': 105000,
      'ETH/USDT': 2500,
      'SOL/USDT': 150,
      'AVAX/USDT': 21
    };

    let basePrice = basePrices[pair] || 100;
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * timeframeMs);
      
      // Generate realistic price movement
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      const open = basePrice;
      const close = open * (1 + change);
      
      // Generate high/low with realistic wicks
      const wickSize = Math.random() * 0.01; // 1% max wick
      const high = Math.max(open, close) * (1 + wickSize);
      const low = Math.min(open, close) * (1 - wickSize);
      
      // Generate volume
      const volume = Math.random() * 1000000 + 500000;
      
      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      basePrice = close; // Next candle starts where this one ended
    }
    
    return candles;
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || 60 * 1000;
  }

  /**
   * Get current bot status
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      portfolio: this.portfolio,
      lastChecks: this.lastSignalCheck
    };
  }

  /**
   * Update bot configuration
   */
  public updateConfig(newConfig: Partial<BotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Bot configuration updated:', this.config);
  }

  /**
   * Get portfolio state
   */
  public getPortfolio(): PortfolioState {
    return this.portfolio;
  }

  /**
   * Force a trading cycle (for testing)
   */
  public async forceCycle(): Promise<void> {
    await this.runTradingCycle();
  }
}

// Export singleton instance
export const realTradingBot = new RealTradingBot();
export default realTradingBot; 