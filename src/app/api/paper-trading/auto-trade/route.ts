import { NextRequest, NextResponse } from 'next/server';
import { generateSignal, Candle } from '../../../../../strategies/strategyCore';
import { tradeLogger } from '../../../../../services/tradeLogger';
import ccxt from 'ccxt';
import { paperTradingService } from '../../../../../services/paperTradingService';

interface AutoTradeConfig {
  enabled: boolean;
  pairs: string[];
  maxPositions: number;
  riskPerTrade: number;
  minConfidence: number;
}

// In-memory state for auto-trading (in production, use Redis or database)
let autoTradeState = {
  isRunning: false,
  config: {
    enabled: false,
    pairs: ['BTC/USDT:USDT', 'ETH/USDT:USDT'],
    maxPositions: 3,
    riskPerTrade: 0.02, // 2% per trade
    minConfidence: 0.65
  } as AutoTradeConfig,
  lastCheck: 0,
  totalTrades: 0,
  successfulTrades: 0
};

// Get real market data from Blowfin
async function fetchRealtimeCandles(pair: string, timeframe: string = '15m', limit: number = 100): Promise<Candle[]> {
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
    console.error(`Error fetching candles for ${pair}:`, error);
    return [];
  }
}

// Check for trading opportunities
async function scanForSignals(): Promise<{ pair: string; signal: any }[]> {
  const opportunities = [];
  
  for (const pair of autoTradeState.config.pairs) {
    try {
      // Fetch market data
      const candles15m = await fetchRealtimeCandles(pair, '15m', 100);
      const candles4h = await fetchRealtimeCandles(pair, '4h', 50);
      
      if (candles15m.length < 50 || candles4h.length < 20) {
        console.log(`Insufficient data for ${pair}`);
        continue;
      }

      // Generate signal
      const signal = generateSignal(pair, candles4h, candles15m);
      
      if (signal && signal.confidence >= autoTradeState.config.minConfidence) {
        opportunities.push({ pair, signal });
        console.log(`Signal found for ${pair}: ${signal.side} with ${signal.confidence} confidence`);
      }
    } catch (error) {
      console.error(`Error scanning ${pair}:`, error);
    }
  }
  
  return opportunities;
}

// Execute a paper trade
async function executePaperTrade(pair: string, signal: any): Promise<boolean> {
  try {
    const sizeUsd = 10000 * autoTradeState.config.riskPerTrade; // $10k * risk%
    
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
      source: 'paper_trading',
      notes: `Auto-generated trade with ${signal.confidence} confidence using real Blowfin data`
    });

    autoTradeState.totalTrades++;
    console.log(`Executed auto paper trade: ${pair} ${signal.side} $${sizeUsd}`);
    
    return true;
  } catch (error) {
    console.error('Error executing paper trade:', error);
    return false;
  }
}

// Main auto-trading loop
async function runAutoTrading(): Promise<void> {
  if (!autoTradeState.config.enabled) return;
  
  try {
    console.log('Scanning for trading opportunities...');
    
    // Get current open positions count (simplified - in production, query database)
    const openPositions = 0; // This would come from your database
    
    if (openPositions >= autoTradeState.config.maxPositions) {
      console.log('Max positions reached, skipping scan');
      return;
    }
    
    // Scan for signals
    const opportunities = await scanForSignals();
    
    if (opportunities.length === 0) {
      console.log('No trading opportunities found');
      return;
    }
    
    // Execute trades for valid opportunities
    for (const opportunity of opportunities) {
      if (openPositions >= autoTradeState.config.maxPositions) break;
      
      const success = await executePaperTrade(opportunity.pair, opportunity.signal);
      if (success) {
        autoTradeState.successfulTrades++;
      }
    }
    
    autoTradeState.lastCheck = Date.now();
    
  } catch (error) {
    console.error('Auto-trading error:', error);
  }
}

// GET: Get auto-trading status
export async function GET(request: NextRequest) {
  try {
    const status = paperTradingService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting auto-trading status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get auto-trading status'
    }, { status: 500 });
  }
}

// POST: Start/stop auto-trading or update config
export async function POST(request: NextRequest) {
  try {
    const { action, config } = await request.json();
    
    if (action === 'start') {
      await paperTradingService.start();
      
      return NextResponse.json({
        success: true,
        message: 'Auto-trading started successfully (24/7 mode)',
        data: paperTradingService.getStatus()
      });
      
    } else if (action === 'stop') {
      await paperTradingService.stop();
      
      return NextResponse.json({
        success: true,
        message: 'Auto-trading stopped successfully',
        data: paperTradingService.getStatus()
      });
      
    } else if (action === 'update_config' && config) {
      paperTradingService.updateConfig(config);
      
      return NextResponse.json({
        success: true,
        message: 'Auto-trading configuration updated',
        data: paperTradingService.getStatus()
      });
      
    } else if (action === 'scan_now') {
      // Manual scan trigger - not implemented in background service
      // For manual scans, use the execute endpoint instead
      return NextResponse.json({
        success: false,
        message: 'Manual scans not supported in 24/7 mode. Use execute endpoint for manual trades.'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Auto-trading API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process auto-trading request',
      details: error.message
    }, { status: 500 });
  }
} 