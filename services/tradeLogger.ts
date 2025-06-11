import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface TradeLogEntry {
  pair: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price?: number;
  size_usd: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
  source: 'paper_trading' | 'blofin_live' | 'manual';
  strategy?: string;
  confidence?: number;
  notes?: string;
  exchange?: string;
  order_id?: string;
  created_at?: string;
  closed_at?: string;
}

export class TradeLogger {
  private static instance: TradeLogger;
  
  public static getInstance(): TradeLogger {
    if (!TradeLogger.instance) {
      TradeLogger.instance = new TradeLogger();
    }
    return TradeLogger.instance;
  }

  /**
   * Log a paper trading trade
   */
  async logPaperTrade(trade: {
    pair: string;
    side: 'long' | 'short';
    entry_price: number;
    exit_price?: number;
    size_usd: number;
    pnl?: number;
    status: 'open' | 'closed' | 'cancelled';
    strategy?: string;
    confidence?: number;
    order_id?: string;
    closed_at?: string;
  }): Promise<boolean> {
    try {
      const logEntry: TradeLogEntry = {
        ...trade,
        source: 'paper_trading',
        exchange: 'Paper Trading',
        notes: `Automated ${trade.strategy || 'unknown'} strategy trade${trade.confidence ? ` with ${Math.round(trade.confidence * 100)}% confidence` : ''}`,
        created_at: new Date().toISOString()
      };

      return await this.logTrade(logEntry);
    } catch (error) {
      console.error('Error logging paper trade:', error);
      return false;
    }
  }

  /**
   * Log a real BloFin trade
   */
  async logBloFinTrade(trade: {
    pair: string;
    side: 'long' | 'short';
    entry_price: number;
    exit_price?: number;
    size_usd: number;
    pnl?: number;
    status: 'open' | 'closed' | 'cancelled';
    strategy?: string;
    confidence?: number;
    order_id?: string;
    closed_at?: string;
  }): Promise<boolean> {
    try {
      const logEntry: TradeLogEntry = {
        ...trade,
        source: 'blofin_live',
        exchange: 'BloFin',
        notes: `Live ${trade.strategy || 'unknown'} strategy trade on BloFin${trade.confidence ? ` with ${Math.round(trade.confidence * 100)}% confidence` : ''}${trade.order_id ? ` (Order: ${trade.order_id})` : ''}`,
        created_at: new Date().toISOString()
      };

      return await this.logTrade(logEntry);
    } catch (error) {
      console.error('Error logging BloFin trade:', error);
      return false;
    }
  }

  /**
   * Update an existing trade (when it closes)
   */
  async updateTrade(tradeId: string, updates: {
    exit_price?: number;
    pnl?: number;
    status?: 'closed' | 'cancelled';
    closed_at?: string;
  }): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, cannot update trade');
        return false;
      }

      const { error } = await supabase
        .from('trade_journal')
        .update({
          ...updates,
          closed_at: updates.closed_at || new Date().toISOString()
        })
        .eq('id', tradeId);

      if (error) {
        console.error('Error updating trade:', error);
        return false;
      }

      console.log(`Trade ${tradeId} updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating trade:', error);
      return false;
    }
  }

  /**
   * Core method to log any trade to the database
   */
  private async logTrade(trade: TradeLogEntry): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, logging to console instead');
        console.log('Trade Log:', trade);
        return false;
      }

      const { data, error } = await supabase
        .from('trade_journal')
        .insert([{
          pair: trade.pair,
          side: trade.side,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price,
          size_usd: trade.size_usd,
          pnl: trade.pnl,
          status: trade.status,
          source: trade.source,
          strategy: trade.strategy,
          confidence: trade.confidence,
          notes: trade.notes,
          created_at: trade.created_at,
          closed_at: trade.closed_at
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting trade log:', error);
        return false;
      }

      console.log(`Trade logged successfully: ${trade.source} - ${trade.pair} ${trade.side} at $${trade.entry_price}`);
      return true;
    } catch (error) {
      console.error('Error logging trade:', error);
      return false;
    }
  }

  /**
   * Get trade statistics for a specific source
   */
  async getTradeStats(source?: 'paper_trading' | 'blofin_live'): Promise<{
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    totalPnL: number;
    winRate: number;
  }> {
    try {
      if (!supabase) {
        return {
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          totalPnL: 0,
          winRate: 0
        };
      }

      let query = supabase.from('trade_journal').select('*');
      
      if (source) {
        query = query.eq('source', source);
      }

      const { data: trades, error } = await query;

      if (error || !trades) {
        console.error('Error fetching trade stats:', error);
        return {
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          totalPnL: 0,
          winRate: 0
        };
      }

      const closedTrades = trades.filter(t => t.status === 'closed');
      const openTrades = trades.filter(t => t.status === 'open');
      const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
      const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

      return {
        totalTrades: trades.length,
        openTrades: openTrades.length,
        closedTrades: closedTrades.length,
        totalPnL,
        winRate
      };
    } catch (error) {
      console.error('Error calculating trade stats:', error);
      return {
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        totalPnL: 0,
        winRate: 0
      };
    }
  }
}

// Export singleton instance
export const tradeLogger = TradeLogger.getInstance(); 