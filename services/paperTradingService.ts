import { generateSignal, Candle } from '../strategies/strategyCore';
import { tradeLogger } from './tradeLogger';
import ccxt from 'ccxt';

interface AutoTradeConfig {
  enabled: boolean;
  pairs: string[];
  maxPositions: number;
  riskPerTrade: number;
  minConfidence: number;
  checkInterval: number; // milliseconds
}

class PaperTradingService {
  private config: AutoTradeConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private stats = {
    lastCheck: 0,
    totalTrades: 0,
    successfulTrades: 0,
    openPositions: 0
  };

  constructor() {
    this.config = {
      enabled: false,
      pairs: ['BTC/USDT:USDT', 'ETH/USDT:USDT', 'SOL/USDT:USDT', 'ADA/USDT:USDT', 'LINK/USDT:USDT', 'AVAX/USDT:USDT'],
      maxPositions: 5,
      riskPerTrade: 0.01, // 1% of $100 = $1 per trade
      minConfidence: 0.50,
      checkInterval: 60 * 1000 // Check every minute instead of 5 minutes
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[PaperTradingService] Already running');
      return;
    }

    console.log('[PaperTradingService] Starting 24/7 paper trading service...');
    this.isRunning = true;
    this.config.enabled = true;

    // Run immediately
    await this.runTradingCycle();

    // Set up interval for continuous trading
    this.intervalId = setInterval(async () => {
      if (this.config.enabled) {
        await this.runTradingCycle();
      }
    }, this.config.checkInterval);

    console.log('[PaperTradingService] Service started successfully');
  }

  async stop(): Promise<void> {
    console.log('[PaperTradingService] Stopping service...');
    this.isRunning = false;
    this.config.enabled = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('[PaperTradingService] Service stopped');
  }

  private async runTradingCycle(): Promise<void> {
    console.log('[PaperTradingService] Running trading cycle...');
    
    try {
      // Check if we can open more positions
      if (this.stats.openPositions >= this.config.maxPositions) {
        console.log('[PaperTradingService] Max positions reached, skipping cycle');
        return;
      }

      // Scan all pairs for opportunities
      const opportunities = await this.scanForSignals();

      if (opportunities.length === 0) {
        console.log('[PaperTradingService] No trading opportunities found');
      } else {
        // Execute trades for valid opportunities
        for (const opportunity of opportunities) {
          if (this.stats.openPositions >= this.config.maxPositions) break;
          
          const success = await this.executePaperTrade(opportunity.pair, opportunity.signal);
          if (success) {
            this.stats.openPositions++;
            this.stats.successfulTrades++;
          }
        }
      }

      this.stats.lastCheck = Date.now();
      this.stats.totalTrades = opportunities.length;

    } catch (error) {
      console.error('[PaperTradingService] Trading cycle error:', error);
    }
  }

  private async fetchRealtimeCandles(pair: string, timeframe: string = '15m', limit: number = 100): Promise<Candle[]> {
    try {
      const exchange = new ccxt.blofin({
        apiKey: process.env.BLOWFIN_API_KEY,
        secret: process.env.BLOWFIN_API_SECRET,
        password: process.env.BLOWFIN_PASSPHRASE,
        sandbox: false,
        enableRateLimit: true,
      });

      const ohlcv = await exchange.fetchOHLCV(pair, timeframe, undefined, limit);
      
      return ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      }));
    } catch (error) {
      console.error(`[PaperTradingService] Error fetching candles for ${pair}:`, error);
      return [];
    }
  }

  private async scanForSignals(): Promise<{ pair: string; signal: any }[]> {
    const opportunities = [];
    
    for (const pair of this.config.pairs) {
      try {
        // Fetch market data
        const candles15m = await this.fetchRealtimeCandles(pair, '15m', 100);
        const candles4h = await this.fetchRealtimeCandles(pair, '4h', 50);
        
        if (candles15m.length < 50 || candles4h.length < 20) {
          continue;
        }

        // Generate signal
        const signal = generateSignal(pair, candles4h, candles15m);
        
        if (signal && signal.confidence >= this.config.minConfidence) {
          opportunities.push({ pair, signal });
          console.log(`[PaperTradingService] Signal found for ${pair}: ${signal.side} with ${signal.confidence} confidence`);
        }
      } catch (error) {
        console.error(`[PaperTradingService] Error scanning ${pair}:`, error);
      }
    }
    
    return opportunities;
  }

  private async executePaperTrade(pair: string, signal: any): Promise<boolean> {
    try {
      const sizeUsd = 100 * this.config.riskPerTrade; // $100 * 1% = $1 per trade
      
      const trade = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pair: signal.pair,
        side: signal.side,
        entry_price: signal.entry,
        size_usd: sizeUsd,
        status: 'open' as const,
        created_at: new Date().toISOString(),
        strategy: 'range_fibonacci_auto',
        confidence: signal.confidence,
        stop_loss: signal.sl,
        take_profit_levels: signal.tp
      };

      // Log the trade
      await tradeLogger.logTrade({
        ...trade,
        source: 'paper_trading_service',
        notes: `24/7 Auto-trade: ${signal.side} ${pair} with ${signal.confidence.toFixed(2)} confidence`
      });

      console.log(`[PaperTradingService] Executed trade: ${pair} ${signal.side} $${sizeUsd}`);
      
      return true;
    } catch (error) {
      console.error('[PaperTradingService] Error executing trade:', error);
      return false;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      stats: {
        ...this.stats,
        successRate: this.stats.totalTrades > 0 
          ? (this.stats.successfulTrades / this.stats.totalTrades) * 100 
          : 0
      }
    };
  }

  updateConfig(newConfig: Partial<AutoTradeConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('[PaperTradingService] Config updated:', this.config);
  }
}

// Create singleton instance
export const paperTradingService = new PaperTradingService();

// Auto-start the service if AUTO_TRADE_ENABLED env var is set
if (process.env.AUTO_TRADE_ENABLED === 'true') {
  paperTradingService.start().catch(console.error);
} 