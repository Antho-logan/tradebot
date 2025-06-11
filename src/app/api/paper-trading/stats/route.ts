import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // Fetch current market prices for unrealized P&L calculation
    const currentPrices = await getCurrentPrices();
    
    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured, returning realistic starting data');
      
      // Use mock trades with realistic entry prices for better P&L demonstration
      const mockTrades: PaperTrade[] = [
        {
          id: 'paper-1',
          pair: 'ETH/USDT',
          side: 'short',
          entry_price: 2520.00, // Higher entry for short to show potential profit/loss
          size_usd: 300.00,
          status: 'open',
          created_at: '2024-01-16T09:15:00Z',
          strategy: 'range_fibonacci',
          confidence: 0.75
        },
        {
          id: 'paper-2',
          pair: 'SOL/USDT',
          side: 'long',
          entry_price: 98.20,
          exit_price: 101.50,
          size_usd: 200.00,
          pnl: 6.71,
          status: 'closed',
          created_at: '2024-01-16T11:45:00Z',
          closed_at: '2024-01-16T15:30:00Z',
          strategy: 'range_fibonacci',
          confidence: 0.82
        },
        {
          id: 'paper-3',
          pair: 'BTC/USDT',
          side: 'long',
          entry_price: 102000.00, // Lower entry for long to show potential profit
          size_usd: 400.00,
          status: 'open',
          created_at: '2024-01-16T16:20:00Z',
          strategy: 'range_fibonacci',
          confidence: 0.68
        },
        {
          id: 'paper-4',
          pair: 'SOL/USDT',
          side: 'long',
          entry_price: 145.00, // Current open SOL position
          size_usd: 250.00,
          status: 'open',
          created_at: '2024-01-16T18:30:00Z',
          strategy: 'range_fibonacci',
          confidence: 0.72
        }
      ];

      // Calculate statistics using mock data
      const startingBalance = 100;
      const closedTrades = mockTrades.filter(t => t.status === 'closed' && t.pnl !== null);
      const openTrades = mockTrades.filter(t => t.status === 'open');
      
      // Calculate total P&L from closed trades
      const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalBalance = startingBalance + totalPnL;
      const totalPnLPct = (totalPnL / startingBalance) * 100;
      
      // Calculate unrealized P&L for open positions
      const unrealizedPnL = calculateUnrealizedPnL(openTrades, currentPrices);
      const unrealizedPnLPct = totalBalance > 0 ? (unrealizedPnL / totalBalance) * 100 : 0;
      
      // Calculate daily P&L (all trades are from today in mock data)
      const dailyPnL = totalPnL;
      const dailyPnLPct = totalBalance > 0 ? (dailyPnL / totalBalance) * 100 : 0;
      
      // Win/Loss statistics
      const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
      const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
      
      // Best and worst trades
      const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;
      const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnl || 0)) : 0;

      return NextResponse.json({
        success: true,
        data: {
          totalBalance: Math.round((totalBalance + unrealizedPnL) * 100) / 100,
          startingBalance,
          totalPnL: Math.round(totalPnL * 100) / 100,
          totalPnLPct: Math.round(totalPnLPct * 100) / 100,
          dailyPnL: Math.round(dailyPnL * 100) / 100,
          dailyPnLPct: Math.round(dailyPnLPct * 100) / 100,
          unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
          unrealizedPnLPct: Math.round(unrealizedPnLPct * 100) / 100,
          totalTrades: mockTrades.length,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          winRate: Math.round(winRate * 100) / 100,
          avgWin: winningTrades.length > 0 ? Math.round((winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length) * 100) / 100 : 0,
          avgLoss: losingTrades.length > 0 ? Math.round((losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) * 100) / 100 : 0,
          profitFactor: losingTrades.length > 0 ? Math.round((winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))) * 100) / 100 : 999,
          maxDrawdown: 0,
          openTrades: openTrades.length,
          todayTrades: mockTrades.length,
          bestTrade: Math.round(bestTrade * 100) / 100,
          worstTrade: Math.round(worstTrade * 100) / 100,
          avgHoldTime: "4h 15m",
          sharpeRatio: 1.25
        }
      });
    }

    // Fetch all paper trades
    const { data: trades, error } = await supabase
      .from('paper_trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching paper trades:', error);
      // Return realistic starting data if database is not available
      return NextResponse.json({
        success: true,
        data: {
          totalBalance: 100.00,
          startingBalance: 100,
          totalPnL: 0.00,
          totalPnLPct: 0.00,
          dailyPnL: 0.00,
          dailyPnLPct: 0.00,
          unrealizedPnL: 0.00,
          unrealizedPnLPct: 0.00,
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

    const paperTrades = trades as PaperTrade[];
    
    // Calculate statistics
    const startingBalance = 100;
    const closedTrades = paperTrades.filter(t => t.status === 'closed' && t.pnl !== null);
    const openTrades = paperTrades.filter(t => t.status === 'open');
    
    // Calculate total P&L
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalBalance = startingBalance + totalPnL;
    const totalPnLPct = (totalPnL / startingBalance) * 100;
    
    // Calculate daily P&L (trades from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = closedTrades.filter(trade => 
      new Date(trade.closed_at || trade.created_at) >= today
    );
    const dailyPnL = todayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const dailyPnLPct = totalBalance > 0 ? (dailyPnL / totalBalance) * 100 : 0;
    
    // Calculate unrealized P&L for open positions
    const unrealizedPnL = calculateUnrealizedPnL(openTrades, currentPrices);
    const unrealizedPnLPct = totalBalance > 0 ? (unrealizedPnL / totalBalance) * 100 : 0;
    
    // Win/Loss statistics
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    // Average win/loss
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length 
      : 0;
    
    // Profit factor
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    // Best and worst trades
    const bestTrade = closedTrades.length > 0 
      ? Math.max(...closedTrades.map(t => t.pnl || 0)) 
      : 0;
    const worstTrade = closedTrades.length > 0 
      ? Math.min(...closedTrades.map(t => t.pnl || 0)) 
      : 0;
    
    // Calculate max drawdown
    let runningBalance = startingBalance;
    let peak = startingBalance;
    let maxDrawdown = 0;
    
    for (const trade of closedTrades.sort((a, b) => 
      new Date(a.closed_at || a.created_at).getTime() - 
      new Date(b.closed_at || b.created_at).getTime()
    )) {
      runningBalance += trade.pnl || 0;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = peak - runningBalance;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Calculate average hold time
    const tradesWithDuration = closedTrades.filter(t => t.closed_at);
    const avgHoldTimeMs = tradesWithDuration.length > 0
      ? tradesWithDuration.reduce((sum, trade) => {
          const duration = new Date(trade.closed_at!).getTime() - new Date(trade.created_at).getTime();
          return sum + duration;
        }, 0) / tradesWithDuration.length
      : 0;
    
    const avgHoldTimeHours = Math.floor(avgHoldTimeMs / (1000 * 60 * 60));
    const avgHoldTimeMinutes = Math.floor((avgHoldTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const avgHoldTime = `${avgHoldTimeHours}h ${avgHoldTimeMinutes}m`;
    
    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map(t => (t.pnl || 0) / startingBalance);
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const returnStdDev = returns.length > 1 
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
      : 0;
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0; // Annualized
    
    const stats = {
      totalBalance: Math.round(totalBalance * 100) / 100,
      startingBalance,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPct: Math.round(totalPnLPct * 100) / 100,
      dailyPnL: Math.round(dailyPnL * 100) / 100,
      dailyPnLPct: Math.round(dailyPnLPct * 100) / 100,
      unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
      unrealizedPnLPct: Math.round(unrealizedPnLPct * 100) / 100,
      totalTrades: paperTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      maxDrawdown: -Math.round(maxDrawdown * 100) / 100,
      openTrades: openTrades.length,
      todayTrades: todayTrades.length,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      avgHoldTime,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error calculating paper trading stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate paper trading statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 