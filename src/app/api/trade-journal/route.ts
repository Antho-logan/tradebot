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

interface TradeJournalEntry {
  id: string;
  type: 'manual' | 'paper';
  pair: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price?: number;
  size_usd: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  closed_at?: string;
  notes?: string;
  confidence?: number;
  strategy?: string;
  source: 'manual' | 'paper_trading';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeManual = searchParams.get('include_manual') !== 'false';
    const includePaper = searchParams.get('include_paper') !== 'false';

    let allEntries: TradeJournalEntry[] = [];

    // Fetch paper trades if enabled
    if (includePaper) {
      if (supabase) {
        try {
          const { data: paperTrades, error } = await supabase
            .from('paper_trades')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (!error && paperTrades) {
            const paperEntries: TradeJournalEntry[] = paperTrades.map((trade: PaperTrade) => ({
              id: `paper_${trade.id}`,
              type: 'paper',
              pair: trade.pair,
              side: trade.side,
              entry_price: trade.entry_price,
              exit_price: trade.exit_price,
              size_usd: trade.size_usd,
              pnl: trade.pnl,
              status: trade.status,
              created_at: trade.created_at,
              closed_at: trade.closed_at,
              confidence: trade.confidence,
              strategy: trade.strategy,
              source: 'paper_trading',
              notes: `Automated ${trade.strategy} strategy trade with ${Math.round(trade.confidence * 100)}% confidence`
            }));
            allEntries.push(...paperEntries);
          }
        } catch (error) {
          console.error('Error fetching paper trades:', error);
        }
      }
    }

    // Fetch manual journal entries if enabled
    if (includeManual && supabase) {
      try {
        const { data: manualEntries, error } = await supabase
          .from('trade_journal')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && manualEntries) {
          const journalEntries: TradeJournalEntry[] = manualEntries.map((entry: any) => ({
            ...entry,
            type: 'manual',
            source: 'manual'
          }));
          allEntries.push(...journalEntries);
        }
      } catch (error) {
        console.error('Error fetching manual journal entries:', error);
      }
    }

    // Sort all entries by creation date (newest first)
    allEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Limit results
    allEntries = allEntries.slice(0, limit);

    // If no database connection, return mock data for demonstration
    if (!supabase) {
      console.log('Supabase not configured, returning mock journal data');
      
      const mockEntries: TradeJournalEntry[] = [
        {
          id: 'manual-1',
          type: 'manual',
          pair: 'BTC/USDT',
          side: 'long',
          entry_price: 43250.00,
          exit_price: 44100.00,
          size_usd: 500.00,
          pnl: 9.83,
          status: 'closed',
          created_at: '2024-01-15T10:30:00Z',
          closed_at: '2024-01-15T14:20:00Z',
          source: 'manual',
          notes: 'Manual trade based on technical analysis'
        },
        {
          id: 'paper-1',
          type: 'paper',
          pair: 'ETH/USDT',
          side: 'short',
          entry_price: 2580.50,
          size_usd: 300.00,
          status: 'open',
          created_at: '2024-01-16T09:15:00Z',
          source: 'paper_trading',
          strategy: 'range_fibonacci',
          confidence: 0.75,
          notes: 'Automated range_fibonacci strategy trade with 75% confidence'
        },
        {
          id: 'paper-2',
          type: 'paper',
          pair: 'SOL/USDT',
          side: 'long',
          entry_price: 98.20,
          exit_price: 101.50,
          size_usd: 200.00,
          pnl: 6.71,
          status: 'closed',
          created_at: '2024-01-16T11:45:00Z',
          closed_at: '2024-01-16T15:30:00Z',
          source: 'paper_trading',
          strategy: 'range_fibonacci',
          confidence: 0.82,
          notes: 'Automated range_fibonacci strategy trade with 82% confidence'
        },
        {
          id: 'blofin-1',
          type: 'paper', // Using paper type for now since we don't have live trading yet
          pair: 'BTC/USDT',
          side: 'long',
          entry_price: 43800.00,
          size_usd: 100.00,
          status: 'open',
          created_at: '2024-01-16T16:20:00Z',
          source: 'paper_trading', // Would be 'blofin_live' when live trading is implemented
          strategy: 'range_fibonacci',
          confidence: 0.68,
          notes: 'Automated range_fibonacci strategy trade with 68% confidence (Paper Trading)'
        }
      ];

      // Filter by source if requested
      let filteredEntries = mockEntries;
      if (!includeManual) {
        filteredEntries = filteredEntries.filter(e => e.source !== 'manual');
      }
      if (!includePaper) {
        filteredEntries = filteredEntries.filter(e => e.source !== 'paper_trading');
      }

      return NextResponse.json({
        success: true,
        data: filteredEntries.slice(0, limit),
        count: filteredEntries.length,
        breakdown: {
          paper_trades: filteredEntries.filter(e => e.source === 'paper_trading').length,
          manual_entries: filteredEntries.filter(e => e.source === 'manual').length,
          blofin_trades: filteredEntries.filter(e => e.source === 'blofin_live').length
        },
        message: 'Mock data - real trades will appear here once bot starts trading'
      });
    }

    return NextResponse.json({
      success: true,
      data: allEntries,
      count: allEntries.length,
      breakdown: {
        paper_trades: allEntries.filter(e => e.source === 'paper_trading').length,
        manual_entries: allEntries.filter(e => e.source === 'manual').length
      }
    });

  } catch (error) {
    console.error('Error fetching trade journal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trade journal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['pair', 'side', 'entry_price', 'size_usd'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert manual trade journal entry
    const { data, error } = await supabase
      .from('trade_journal')
      .insert([{
        pair: body.pair,
        side: body.side,
        entry_price: body.entry_price,
        exit_price: body.exit_price,
        size_usd: body.size_usd,
        pnl: body.pnl,
        status: body.status || 'open',
        notes: body.notes,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create journal entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error creating trade journal entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create trade journal entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('id');
    const source = searchParams.get('source'); // 'paper_trading', 'manual', etc.

    if (!tradeId) {
      return NextResponse.json(
        { success: false, error: 'Trade ID is required' },
        { status: 400 }
      );
    }

    // Handle paper trading deletions
    if (source === 'paper_trading' || tradeId.startsWith('paper_')) {
      if (!supabase) {
        return NextResponse.json(
          { success: false, error: 'Database not configured for paper trade deletion' },
          { status: 503 }
        );
      }

      // Extract the actual paper trade ID (remove 'paper_' prefix if present)
      const actualId = tradeId.startsWith('paper_') ? tradeId.replace('paper_', '') : tradeId;

      const { error } = await supabase
        .from('paper_trades')
        .delete()
        .eq('id', actualId);

      if (error) {
        console.error('Error deleting paper trade:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete paper trade' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Paper trade deleted successfully'
      });
    }

    // Handle manual trade deletions
    if (source === 'manual') {
      if (!supabase) {
        return NextResponse.json(
          { success: false, error: 'Database not configured for manual trade deletion' },
          { status: 503 }
        );
      }

      const { error } = await supabase
        .from('trade_journal')
        .delete()
        .eq('id', tradeId);

      if (error) {
        console.error('Error deleting manual trade:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete manual trade' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Manual trade deleted successfully'
      });
    }

    // If no specific source, try to delete from both tables
    if (supabase) {
      // Try paper trades first
      const { error: paperError } = await supabase
        .from('paper_trades')
        .delete()
        .eq('id', tradeId.replace('paper_', ''));

      if (!paperError) {
        return NextResponse.json({
          success: true,
          message: 'Trade deleted successfully from paper trades'
        });
      }

      // Try manual trades
      const { error: manualError } = await supabase
        .from('trade_journal')
        .delete()
        .eq('id', tradeId);

      if (!manualError) {
        return NextResponse.json({
          success: true,
          message: 'Trade deleted successfully from manual trades'
        });
      }

      return NextResponse.json(
        { success: false, error: 'Trade not found in any table' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );

  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete trade',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}