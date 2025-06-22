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
  
  // Base prices with realistic current market values
  const basePrices = {
    'BTC': 89000,
    'ETH': 3150,
    'SOL': 185,
    'ADA': 0.98,
    'LINK': 22.5,
    'AVAX': 38.6
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
    // Fixed starting balance
    const STARTING_BALANCE = 100.00;
    
    // Initialize default stats
    let stats = {
      totalBalance: STARTING_BALANCE,
      startingBalance: STARTING_BALANCE,
      totalPnL: 0,
      totalPnLPct: 0,
      dailyPnL: 0,
      dailyPnLPct: 0,
      unrealizedPnL: 0,
      unrealizedPnLPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      openTrades: 0,
      todayTrades: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgHoldTime: "0h 0m",
      sharpeRatio: 0
    };

    // Try to get trades from database if available
    if (supabase) {
      try {
        // Get all trades
        const { data: trades, error } = await supabase
          .from('paper_trades')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && trades) {
          // Calculate statistics from trades
          const closedTrades = trades.filter(t => t.status === 'closed');
          const openTrades = trades.filter(t => t.status === 'open');
          
          // Calculate realized P&L
          const realizedPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
          
          // Count winning/losing trades
          const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
          const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
          
          // Calculate averages
          const avgWin = winningTrades.length > 0 
            ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
            : 0;
          const avgLoss = losingTrades.length > 0 
            ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
            : 0;
          
          // Calculate profit factor
          const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
          const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
          const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
          
          // Get today's trades
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTrades = trades.filter(t => new Date(t.created_at) >= today);
          const dailyPnL = todayTrades
            .filter(t => t.status === 'closed')
            .reduce((sum, t) => sum + (t.pnl || 0), 0);
          
          // Find best and worst trades
          const allPnLs = closedTrades.map(t => t.pnl || 0).filter(pnl => pnl !== 0);
          const bestTrade = allPnLs.length > 0 ? Math.max(...allPnLs) : 0;
          const worstTrade = allPnLs.length > 0 ? Math.min(...allPnLs) : 0;
          
          // Update stats
          stats = {
            ...stats,
            totalPnL: realizedPnL,
            totalPnLPct: (realizedPnL / STARTING_BALANCE) * 100,
            dailyPnL,
            dailyPnLPct: (dailyPnL / STARTING_BALANCE) * 100,
            totalTrades: trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
            avgWin,
            avgLoss,
            profitFactor,
            openTrades: openTrades.length,
            todayTrades: todayTrades.length,
            bestTrade,
            worstTrade,
            totalBalance: STARTING_BALANCE + realizedPnL // Balance = starting + realized P&L
          };
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with default stats
      }
    }

    // If no database or no trades, check file-based trades
    if (stats.totalTrades === 0) {
      try {
        // Try to read from trade log file if it exists
        const fs = require('fs').promises;
        const path = require('path');
        const logPath = path.join(process.cwd(), 'logs', 'trades.json');
        
        try {
          const logData = await fs.readFile(logPath, 'utf-8');
          const trades = JSON.parse(logData);
          
          if (Array.isArray(trades) && trades.length > 0) {
            // Update total trades count
            stats.totalTrades = trades.length;
            stats.openTrades = trades.filter(t => t.status === 'open').length;
            
            // Simple P&L calculation from logged trades
            const closedTrades = trades.filter(t => t.status === 'closed');
            if (closedTrades.length > 0) {
              const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
              stats.totalPnL = totalPnL;
              stats.totalBalance = STARTING_BALANCE + totalPnL;
              stats.winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
              stats.losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0).length;
              stats.winRate = (stats.winningTrades / closedTrades.length) * 100;
            }
          }
        } catch (fileError) {
          // No trades file yet, that's OK
        }
      } catch (fsError) {
        // File system not available in edge runtime, that's OK
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching paper trading stats:', error);
    
    // Return default stats on error
    return NextResponse.json({
      success: true,
      data: {
        totalBalance: 100.00,
        startingBalance: 100.00,
        totalPnL: 0,
        totalPnLPct: 0,
        dailyPnL: 0,
        dailyPnLPct: 0,
        unrealizedPnL: 0,
        unrealizedPnLPct: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        openTrades: 0,
        todayTrades: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgHoldTime: "0h 0m",
        sharpeRatio: 0
      }
    });
  }
} 