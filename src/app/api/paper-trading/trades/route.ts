import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { realTradingBot } from '../../../../../services/realTradingBot';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // 'open', 'closed', 'cancelled'

    // Get real trades from the trading bot
    const portfolio = realTradingBot.getPortfolio();
    const botStatus = realTradingBot.getStatus();

    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured, returning real bot trades');
      
      // Get real open positions from the bot
      let realTrades = portfolio.openPositions.map(position => ({
        id: position.id,
        pair: position.pair,
        side: position.side,
        entry_price: position.entry,
        exit_price: null,
        size_usd: position.sizeUsd,
        pnl: null, // Will be calculated in real-time
        status: 'open',
        created_at: new Date(position.timestamp).toISOString(),
        closed_at: null,
        strategy: position.metadata?.strategy || 'range_fibonacci',
        confidence: position.metadata?.confidence || 0.75
      }));

      // Add some example closed trades if no real trades exist yet
      if (realTrades.length === 0) {
        // Don't add fake demo trades - let the system work with real data
        realTrades = [];
      }

      // Filter by status if requested
      let filteredTrades = realTrades;
      if (status) {
        filteredTrades = realTrades.filter(trade => trade.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredTrades.slice(0, limit),
        count: filteredTrades.length,
        botStatus: {
          isRunning: botStatus.isRunning,
          mode: botStatus.config.mode,
          pairs: botStatus.config.pairs
        }
      });
    }

    // If Supabase is configured, get database trades and combine with real bot trades
    let query = supabase
      .from('paper_trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: dbTrades, error } = await query;

    if (error) {
      console.error('Error fetching paper trades from database:', error);
      
      // Fall back to real bot trades only
      const realTrades = portfolio.openPositions.map(position => ({
        id: position.id,
        pair: position.pair,
        side: position.side,
        entry_price: position.entry,
        exit_price: null,
        size_usd: position.sizeUsd,
        pnl: null,
        status: 'open',
        created_at: new Date(position.timestamp).toISOString(),
        closed_at: null,
        strategy: position.metadata?.strategy || 'range_fibonacci',
        confidence: position.metadata?.confidence || 0.75
      }));

      return NextResponse.json({
        success: true,
        data: realTrades.slice(0, limit),
        count: realTrades.length,
        source: 'real_bot_only'
      });
    }

    // Combine database trades with real bot open positions
    const realOpenPositions = portfolio.openPositions.map(position => ({
      id: position.id,
      pair: position.pair,
      side: position.side,
      entry_price: position.entry,
      exit_price: null,
      size_usd: position.sizeUsd,
      pnl: null,
      status: 'open',
      created_at: new Date(position.timestamp).toISOString(),
      closed_at: null,
      strategy: position.metadata?.strategy || 'range_fibonacci',
      confidence: position.metadata?.confidence || 0.75
    }));

    // Merge database trades with real open positions
    // Remove any database open trades that might be outdated
    const dbClosedTrades = dbTrades?.filter(trade => trade.status !== 'open') || [];
    const allTrades = [...realOpenPositions, ...dbClosedTrades];

    // Sort by created_at descending
    allTrades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Filter by status if requested
    let filteredTrades = allTrades;
    if (status) {
      filteredTrades = allTrades.filter(trade => trade.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredTrades.slice(0, limit),
      count: filteredTrades.length,
      botStatus: {
        isRunning: botStatus.isRunning,
        mode: botStatus.config.mode,
        pairs: botStatus.config.pairs
      },
      source: 'combined'
    });

  } catch (error) {
    console.error('Error fetching paper trades:', error);
    
    // Emergency fallback - return empty array with bot status
    try {
      const botStatus = realTradingBot.getStatus();
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        botStatus: {
          isRunning: botStatus.isRunning,
          mode: botStatus.config.mode,
          pairs: botStatus.config.pairs
        },
        source: 'fallback'
      });
    } catch (botError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch paper trades',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
} 