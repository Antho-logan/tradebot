import { tradeLogger } from './tradeLogger';
import { executeSignal, setTradingMode, getTradingMode } from './tradeSender';
import { calculatePositionSize } from './riskManager';
import { generateSignal } from '../strategies/strategyCore';

export interface BotConfig {
  enabled: boolean;
  mode: 'paper' | 'live' | 'simulation';
  pairs: string[];
  maxConcurrentTrades: number;
  riskPerTrade: number;
  checkInterval: number; // milliseconds
}

export class TradingBot {
  private static instance: TradingBot;
  private config: BotConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private activeTrades: Set<string> = new Set();

  private constructor() {
    this.config = {
      enabled: false,
      mode: 'paper',
      pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT'],
      maxConcurrentTrades: 3,
      riskPerTrade: 0.02, // 2% per trade
      checkInterval: 30000 // 30 seconds
    };
  }

  public static getInstance(): TradingBot {
    if (!TradingBot.instance) {
      TradingBot.instance = new TradingBot();
    }
    return TradingBot.instance;
  }

  /**
   * Start the trading bot
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Bot is already running');
      return;
    }

    console.log(`Starting trading bot in ${this.config.mode} mode...`);
    this.isRunning = true;
    setTradingMode(this.config.mode);

    // Start the main trading loop
    this.intervalId = setInterval(() => {
      this.runTradingCycle();
    }, this.config.checkInterval);

    console.log(`Bot started successfully. Checking for signals every ${this.config.checkInterval / 1000} seconds.`);
  }

  /**
   * Stop the trading bot
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('Bot is not running');
      return;
    }

    console.log('Stopping trading bot...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Bot stopped successfully');
  }

  /**
   * Update bot configuration
   */
  public updateConfig(newConfig: Partial<BotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isRunning && newConfig.mode) {
      setTradingMode(newConfig.mode);
    }

    console.log('Bot configuration updated:', this.config);
  }

  /**
   * Get current bot status
   */
  public getStatus(): {
    isRunning: boolean;
    config: BotConfig;
    activeTrades: number;
    uptime: string;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      activeTrades: this.activeTrades.size,
      uptime: this.isRunning ? 'Running' : 'Stopped'
    };
  }

  /**
   * Main trading cycle - runs every interval
   */
  private async runTradingCycle(): Promise<void> {
    try {
      if (!this.config.enabled) {
        return;
      }

      // Check if we can take more trades
      if (this.activeTrades.size >= this.config.maxConcurrentTrades) {
        console.log(`Max concurrent trades reached (${this.config.maxConcurrentTrades})`);
        return;
      }

      // Check each trading pair for signals
      for (const pair of this.config.pairs) {
        if (this.activeTrades.size >= this.config.maxConcurrentTrades) {
          break;
        }

        await this.checkPairForSignals(pair);
      }

    } catch (error) {
      console.error('Error in trading cycle:', error);
    }
  }

  /**
   * Check a specific pair for trading signals
   */
  private async checkPairForSignals(pair: string): Promise<void> {
    try {
      // Skip if we already have a trade on this pair
      if (this.activeTrades.has(pair)) {
        return;
      }

      // Generate mock price data for signal generation
      const mockCandles4h = this.generateMockCandles(pair);
      const mockCandles15m = this.generateMockCandles(pair);
      
      // Generate trading signal
      const signal = generateSignal(pair, mockCandles4h, mockCandles15m);
      
      if (!signal || signal.confidence < 0.6) {
        // No signal or confidence too low
        return;
      }

      console.log(`Signal generated for ${pair}: ${signal.side} with ${Math.round(signal.confidence * 100)}% confidence`);

      // Calculate position size
      const currentPrice = mockCandles15m[mockCandles15m.length - 1].close;
      const mockPortfolio = {
        totalEquity: 10000,
        availableBalance: 8000,
        unrealizedPnL: 0,
        dailyPnL: 0,
        openPositions: this.activeTrades.size,
        todayLossPct: 0,
        maxDrawdown: 0,
        riskUtilization: 0.02
      };
      
      const positionSize = calculatePositionSize(
        signal,
        mockPortfolio,
        currentPrice
      );

      if (!positionSize.approved) {
        console.log(`Position size not approved for ${pair}: ${positionSize.reason}`);
        return;
      }

      // Execute the trade
      const result = await executeSignal(signal, positionSize, currentPrice);

      if (result.success) {
        this.activeTrades.add(pair);
        console.log(`Trade executed successfully for ${pair}: ${result.orderId}`);

        // Schedule trade closure (for demo purposes)
        setTimeout(() => {
          this.closeTrade(pair, result.orderId!);
        }, Math.random() * 300000 + 60000); // Close between 1-6 minutes

      } else {
        console.error(`Failed to execute trade for ${pair}: ${result.error}`);
      }

    } catch (error) {
      console.error(`Error checking signals for ${pair}:`, error);
    }
  }

  /**
   * Close a trade (for demo purposes)
   */
  private async closeTrade(pair: string, orderId: string): Promise<void> {
    try {
      // Simulate price movement
      const priceChange = (Math.random() - 0.5) * 0.04; // ±2% price movement
      const mockCurrentPrice = 50000 * (1 + priceChange); // Mock current price

      // For demo, we'll just remove from active trades and log closure
      this.activeTrades.delete(pair);
      
      console.log(`Trade closed for ${pair}: ${orderId} with ${priceChange > 0 ? 'profit' : 'loss'}`);

    } catch (error) {
      console.error(`Error closing trade for ${pair}:`, error);
    }
  }

  /**
   * Generate mock candle data for signal generation
   */
  private generateMockCandles(pair: string): any[] {
    const basePrice = pair.includes('BTC') ? 43000 : 
                     pair.includes('ETH') ? 2500 : 
                     pair.includes('SOL') ? 100 : 50;

    const candles = [];
    let currentPrice = basePrice;

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      const open = currentPrice;
      const close = currentPrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.random() * 1000000;

      candles.push({
        timestamp: Date.now() - (100 - i) * 60000, // 1 minute intervals
        open,
        high,
        low,
        close,
        volume
      });

      currentPrice = close;
    }

    return candles;
  }

  /**
   * Create a demo trade for testing
   */
  public async createDemoTrade(): Promise<void> {
    try {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const side = Math.random() > 0.5 ? 'long' : 'short';
      const price = pair.includes('BTC') ? 43000 + Math.random() * 2000 : 
                   pair.includes('ETH') ? 2500 + Math.random() * 200 : 
                   100 + Math.random() * 20;

      if (this.config.mode === 'paper') {
        await tradeLogger.logPaperTrade({
          pair,
          side: side as 'long' | 'short',
          entry_price: price,
          size_usd: 100 + Math.random() * 400,
          status: 'open',
          strategy: 'range_fibonacci',
          confidence: 0.6 + Math.random() * 0.3,
          order_id: `demo_${Date.now()}`
        });
      } else if (this.config.mode === 'live') {
        await tradeLogger.logBloFinTrade({
          pair,
          side: side as 'long' | 'short',
          entry_price: price,
          size_usd: 50 + Math.random() * 200,
          status: 'open',
          strategy: 'range_fibonacci',
          confidence: 0.65 + Math.random() * 0.25,
          order_id: `live_${Date.now()}`
        });
      }

      console.log(`Demo ${this.config.mode} trade created: ${side} ${pair} at $${price.toFixed(2)}`);
    } catch (error) {
      console.error('Error creating demo trade:', error);
    }
  }
}

// Export singleton instance
export const tradingBot = TradingBot.getInstance(); 