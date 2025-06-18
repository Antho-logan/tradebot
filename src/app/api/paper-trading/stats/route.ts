import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { realTradingBot } from '../../../../../services/realTradingBot';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface PaperTrade {
  id: string;
  pair: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price?: number;
  size_usd: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  closed_at?: string;
  confidence: number;
  strategy: string;
}

// Helper function to get current market prices with realistic simulation
async function getCurrentPrices(): Promise<Record<string, number>> {
  // Generate realistic price movements based on time
  const now = Date.now();
  const timeVariation = Math.sin(now / 60000) * 0.02; // 2% variation over time
  const randomVariation = (Math.random() - 0.5) * 0.01; // ±0.5% random variation
  
  const baseVariation = timeVariation + randomVariation;
  
  // Base prices with realistic movements
  const basePrices = {
    'BTC': 104000,
    'ETH': 2475,
    'SOL': 148,
    'ADA': 0.65,
    'LINK': 13.5,
    'AVAX': 19.6
  };
  
  // Apply variations to simulate real market movements
  const currentPrices: Record<string, number> = {};
  Object.entries(basePrices).forEach(([symbol, basePrice]) => {
    // Each coin has slightly different movement patterns
    const coinVariation = baseVariation + (Math.sin((now + symbol.charCodeAt(0) * 1000) / 30000) * 0.015);
    currentPrices[symbol] = basePrice * (1 + coinVariation);
  });
  

  return currentPrices;
}

// Helper function to calculate unrealized P&L for open trades
function calculateUnrealizedPnL(openTrades: PaperTrade[], currentPrices: Record<string, number>): number {
  return openTrades.reduce((totalUnrealized, trade) => {
    const symbol = trade.pair.replace('/USDT', '').replace('/USD', '').replace('USDT', '').replace('USD', '');
    const currentPrice = currentPrices[symbol];
    
    if (!currentPrice) {
      return totalUnrealized;
    }
    
    const entryPrice = trade.entry_price;
    const sizeUsd = trade.size_usd;
    
    let unrealizedPnL = 0;
    if (trade.side === 'long') {
      // Long position: profit when price goes up
      unrealizedPnL = ((currentPrice - entryPrice) / entryPrice) * sizeUsd;
    } else {
      // Short position: profit when price goes down
      unrealizedPnL = ((entryPrice - currentPrice) / entryPrice) * sizeUsd;
    }
    
    return totalUnrealized + unrealizedPnL;
  }, 0);
}

export async function GET(request: NextRequest) {
  try {
    // Get real portfolio data from the trading bot
    const portfolio = realTradingBot.getPortfolio();
    const botStatus = realTradingBot.getStatus();

    // Check if Supabase is configured for historical data
    if (!supabase) {
      console.log('Supabase not configured, returning real bot data with simulated history');
      
      // Return real portfolio data with some calculated metrics
      const totalBalance = portfolio.balance + portfolio.unrealizedPnL;
      const dailyPnLPct = portfolio.balance > 0 ? (portfolio.dailyPnL / portfolio.balance) * 100 : 0;
      const unrealizedPnLPct = portfolio.balance > 0 ? (portfolio.unrealizedPnL / portfolio.balance) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          // Real portfolio data
          balance: portfolio.balance,
          totalBalance: totalBalance,
          unrealizedPnL: portfolio.unrealizedPnL,
          unrealizedPnLPct: unrealizedPnLPct,
          dailyPnL: portfolio.dailyPnL,
          dailyPnLPct: dailyPnLPct,
          
          // Position data
          openTrades: portfolio.openPositions.length,
          totalTrades: portfolio.totalTrades,
          winRate: portfolio.winRate,
          
          // Margin data
          freeMargin: portfolio.freeMargin,
          usedMargin: portfolio.usedMargin,
          marginLevel: portfolio.freeMargin > 0 ? (portfolio.equity / portfolio.usedMargin) * 100 : 0,
          
          // Bot status
          botRunning: botStatus.isRunning,
          botMode: botStatus.config.mode,
          monitoredPairs: botStatus.config.pairs,
          
          // Additional metrics
          equity: portfolio.equity,
          equityPct: portfolio.balance > 0 ? (portfolio.equity / portfolio.balance) * 100 : 100,
          
          // Timestamp
          timestamp: Date.now()
        }
      });
    }

    // If Supabase is configured, get historical data and combine with real portfolio
    const { data: trades, error } = await supabase
      .from('paper_trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades from database:', error);
      // Fall back to real bot data
      return NextResponse.json({
        success: true,
        data: {
          balance: portfolio.balance,
          totalBalance: portfolio.balance + portfolio.unrealizedPnL,
          unrealizedPnL: portfolio.unrealizedPnL,
          unrealizedPnLPct: portfolio.balance > 0 ? (portfolio.unrealizedPnL / portfolio.balance) * 100 : 0,
          dailyPnL: portfolio.dailyPnL,
          dailyPnLPct: portfolio.balance > 0 ? (portfolio.dailyPnL / portfolio.balance) * 100 : 0,
          openTrades: portfolio.openPositions.length,
          totalTrades: portfolio.totalTrades,
          winRate: portfolio.winRate,
          botRunning: botStatus.isRunning,
          timestamp: Date.now()
        }
      });
    }

    // Calculate statistics from database trades
    const openTrades = trades?.filter(t => t.status === 'open') || [];
    const closedTrades = trades?.filter(t => t.status === 'closed') || [];
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Combine database stats with real portfolio data
    const combinedStats = {
      balance: portfolio.balance,
      totalBalance: portfolio.balance + portfolio.unrealizedPnL + totalPnL,
      unrealizedPnL: portfolio.unrealizedPnL,
      unrealizedPnLPct: portfolio.balance > 0 ? (portfolio.unrealizedPnL / portfolio.balance) * 100 : 0,
      dailyPnL: portfolio.dailyPnL,
      dailyPnLPct: portfolio.balance > 0 ? (portfolio.dailyPnL / portfolio.balance) * 100 : 0,
      openTrades: Math.max(openTrades.length, portfolio.openPositions.length),
      totalTrades: Math.max(trades?.length || 0, portfolio.totalTrades),
      winRate: Math.max(winRate, portfolio.winRate),
      realizedPnL: totalPnL,
      freeMargin: portfolio.freeMargin,
      usedMargin: portfolio.usedMargin,
      equity: portfolio.equity + totalPnL,
      botRunning: botStatus.isRunning,
      botMode: botStatus.config.mode,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: combinedStats
    });

  } catch (error) {
    console.error('Error fetching paper trading stats:', error);
    
    // Emergency fallback - return basic real bot data
    try {
      const portfolio = realTradingBot.getPortfolio();
      return NextResponse.json({
        success: true,
        data: {
          balance: portfolio.balance,
          totalBalance: portfolio.balance + portfolio.unrealizedPnL,
          unrealizedPnL: portfolio.unrealizedPnL,
          unrealizedPnLPct: 0,
          dailyPnL: portfolio.dailyPnL,
          dailyPnLPct: 0,
          openTrades: portfolio.openPositions.length,
          totalTrades: portfolio.totalTrades,
          winRate: portfolio.winRate,
          botRunning: false,
          timestamp: Date.now()
        }
      });
    } catch (botError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch paper trading stats',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
} 