import { v4 as uuid } from "uuid";
import { Signal } from "../strategies/strategyCore";
import { PositionSizeResult } from "./riskManager";
import { tradeLogger } from "./tradeLogger";

// Trade execution interfaces
export interface TradeOrder {
  id: string;
  pair: string;
  side: "long" | "short";
  type: "market" | "limit" | "stop";
  entry: number;
  sl: number;
  tp: number[];
  sizeUsd: number;
  sizeBase: number;
  status: "pending" | "open" | "closed" | "cancelled" | "failed";
  tags: string[];
  timestamp: number;
  fills?: TradeFill[];
  metadata?: any;
}

export interface TradeFill {
  id: string;
  orderId: string;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  timestamp: number;
  fees: number;
  type: "entry" | "tp1" | "tp2" | "tp3" | "sl";
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string;
  error?: string;
  fills?: TradeFill[];
  estimatedSlippage?: number;
}

// Mock database interface (replace with actual Supabase client)
interface DatabaseClient {
  from(table: string): {
    insert(data: any): Promise<{ data: any; error: any }>;
    update(data: any): { eq(column: string, value: any): Promise<{ data: any; error: any }> };
    select(columns?: string): { eq?(column: string, value: any): Promise<{ data: any; error: any }> };
  };
}

// Mock database client - replace with actual Supabase client
const db: DatabaseClient = {
  from: (table: string) => ({
    insert: async (data: any) => ({ data, error: null }),
    update: (data: any) => ({
      eq: async (column: string, value: any) => ({ data, error: null })
    }),
    select: (columns?: string) => ({
      eq: async (column: string, value: any) => ({ data: [], error: null })
    })
  })
};

// Trading mode configuration
export type TradingMode = "paper" | "live" | "simulation";
let currentMode: TradingMode = "paper";

/**
 * Set trading mode
 */
export function setTradingMode(mode: TradingMode): void {
  currentMode = mode;
  console.log(`Trading mode set to: ${mode}`);
}

/**
 * Get current trading mode
 */
export function getTradingMode(): TradingMode {
  return currentMode;
}

/**
 * Execute paper trade - simulated execution with database logging
 */
export async function executePaper(
  signal: Signal, 
  positionSize: PositionSizeResult,
  currentPrice: number
): Promise<ExecutionResult> {
  try {
    const orderId = uuid();
    const timestamp = Date.now();
    
    // Simulate market slippage (0.01-0.05%)
    const slippage = Math.random() * 0.0004 + 0.0001;
    const executionPrice = signal.side === "long" 
      ? currentPrice * (1 + slippage)
      : currentPrice * (1 - slippage);

    // Create trade order
    const order: TradeOrder = {
      id: orderId,
      pair: signal.pair,
      side: signal.side,
      type: "market",
      entry: executionPrice,
      sl: signal.sl,
      tp: signal.tp,
      sizeUsd: positionSize.sizeUsd,
      sizeBase: positionSize.sizeBase,
      status: "open",
      tags: ["range", "fib", "paper"],
      timestamp,
      metadata: {
        confidence: signal.confidence,
        strategy: "range_fibonacci",
        mode: "paper",
        originalSignal: signal
      }
    };

    // Create entry fill
    const entryFill: TradeFill = {
      id: uuid(),
      orderId,
      price: executionPrice,
      quantity: positionSize.sizeBase,
      side: signal.side === "long" ? "buy" : "sell",
      timestamp,
      fees: positionSize.sizeUsd * 0.001, // 0.1% fee
      type: "entry"
    };

    order.fills = [entryFill];

    // Insert into database
    const { error: orderError } = await db.from("trades").insert({
      id: orderId,
      pair: signal.pair,
      side: signal.side,
      entry_price: executionPrice,
      stop_loss: signal.sl,
      take_profit: signal.tp.join(","),
      size_usd: positionSize.sizeUsd,
      size_base: positionSize.sizeBase,
      status: "open",
      tags: order.tags.join(","),
      confidence: signal.confidence,
      strategy: "range_fibonacci",
      mode: "paper",
      created_at: new Date(timestamp).toISOString(),
      metadata: JSON.stringify(order.metadata)
    });

    if (orderError) {
      console.error("Database error:", orderError);
      return {
        success: false,
        error: "Failed to save trade to database"
      };
    }

    // Insert fill record
    await db.from("trade_fills").insert({
      id: entryFill.id,
      order_id: orderId,
      price: entryFill.price,
      quantity: entryFill.quantity,
      side: entryFill.side,
      fees: entryFill.fees,
      fill_type: entryFill.type,
      timestamp: new Date(timestamp).toISOString()
    });

    // Log to trade journal
    await tradeLogger.logPaperTrade({
      pair: signal.pair,
      side: signal.side,
      entry_price: executionPrice,
      size_usd: positionSize.sizeUsd,
      status: 'open',
      strategy: 'range_fibonacci',
      confidence: signal.confidence,
      order_id: orderId
    });

    console.log(`Paper trade executed: ${signal.side} ${signal.pair} at $${executionPrice.toFixed(2)}`);

    return {
      success: true,
      orderId,
      fills: [entryFill],
      estimatedSlippage: slippage
    };

  } catch (error) {
    console.error("Paper execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown execution error"
    };
  }
}

/**
 * Execute live trade (placeholder for future implementation)
 */
export async function executeLive(
  signal: Signal, 
  positionSize: PositionSizeResult
): Promise<ExecutionResult> {
  // TODO: Implement live trading with actual exchange API
  // When implemented, this should:
  // 1. Execute the trade on BloFin
  // 2. Log the trade using tradeLogger.logBloFinTrade()
  
  console.warn("Live trading not implemented yet");
  
  // For now, simulate what would happen when live trading is implemented
  const orderId = uuid();
  
  // This would be the actual trade execution result from BloFin API
  // await tradeLogger.logBloFinTrade({
  //   pair: signal.pair,
  //   side: signal.side,
  //   entry_price: executionPrice,
  //   size_usd: positionSize.sizeUsd,
  //   status: 'open',
  //   strategy: 'range_fibonacci',
  //   confidence: signal.confidence,
  //   order_id: orderId
  // });
  
  return {
    success: false,
    error: "Live trading not implemented"
  };
}

/**
 * Main execution function that routes to appropriate handler
 */
export async function executeSignal(
  signal: Signal,
  positionSize: PositionSizeResult,
  currentPrice: number
): Promise<ExecutionResult> {
  // Validate inputs
  if (!signal || !positionSize || !positionSize.approved) {
    return {
      success: false,
      error: "Invalid signal or position size not approved"
    };
  }

  switch (currentMode) {
    case "paper":
      return executePaper(signal, positionSize, currentPrice);
    case "live":
      return executeLive(signal, positionSize);
    case "simulation":
      return executeSimulation(signal, positionSize, currentPrice);
    default:
      return {
        success: false,
        error: "Unknown trading mode"
      };
  }
}

/**
 * Execute simulation trade (for backtesting)
 */
export async function executeSimulation(
  signal: Signal,
  positionSize: PositionSizeResult,
  currentPrice: number
): Promise<ExecutionResult> {
  // Similar to paper but without database persistence
  const orderId = uuid();
  const slippage = Math.random() * 0.0002 + 0.0001; // Lower slippage for simulation
  const executionPrice = signal.side === "long" 
    ? currentPrice * (1 + slippage)
    : currentPrice * (1 - slippage);

  const entryFill: TradeFill = {
    id: uuid(),
    orderId,
    price: executionPrice,
    quantity: positionSize.sizeBase,
    side: signal.side === "long" ? "buy" : "sell",
    timestamp: Date.now(),
    fees: positionSize.sizeUsd * 0.0005, // Lower fees for simulation
    type: "entry"
  };

  return {
    success: true,
    orderId,
    fills: [entryFill],
    estimatedSlippage: slippage
  };
}

/**
 * Close position (paper trading)
 */
export async function closePosition(
  orderId: string,
  currentPrice: number,
  reason: "tp" | "sl" | "manual" = "manual"
): Promise<ExecutionResult> {
  try {
    // Get existing order from database
    const { data: orders, error } = await db.from("trades").select().eq("id", orderId);
    
    if (error || !orders || orders.length === 0) {
      return {
        success: false,
        error: "Order not found"
      };
    }

    const order = orders[0];
    
    // Calculate P&L
    const entryPrice = order.entry_price;
    const sizeBase = order.size_base;
    const side = order.side;
    
    let pnl: number;
    if (side === "long") {
      pnl = (currentPrice - entryPrice) * sizeBase;
    } else {
      pnl = (entryPrice - currentPrice) * sizeBase;
    }

    // Create exit fill
    const exitFill: TradeFill = {
      id: uuid(),
      orderId,
      price: currentPrice,
      quantity: sizeBase,
      side: side === "long" ? "sell" : "buy",
      timestamp: Date.now(),
      fees: order.size_usd * 0.001,
      type: reason === "tp" ? "tp1" : reason === "sl" ? "sl" : "manual"
    };

    // Update order status
    await db.from("trades").update({
      status: "closed",
      exit_price: currentPrice,
      pnl: pnl,
      closed_at: new Date().toISOString(),
      close_reason: reason
    }).eq("id", orderId);

    // Insert exit fill
    await db.from("trade_fills").insert({
      id: exitFill.id,
      order_id: orderId,
      price: exitFill.price,
      quantity: exitFill.quantity,
      side: exitFill.side,
      fees: exitFill.fees,
      fill_type: exitFill.type,
      timestamp: new Date().toISOString()
    });

    // Update trade journal with closure
    if (currentMode === "paper") {
      await tradeLogger.logPaperTrade({
        pair: order.pair,
        side: order.side,
        entry_price: entryPrice,
        exit_price: currentPrice,
        size_usd: order.size_usd,
        pnl: pnl,
        status: 'closed',
        strategy: 'range_fibonacci',
        confidence: order.metadata?.confidence,
        order_id: orderId,
        closed_at: new Date().toISOString()
      });
    }

    console.log(`Position closed: ${orderId}, P&L: $${pnl.toFixed(2)}`);

    return {
      success: true,
      orderId,
      fills: [exitFill]
    };

  } catch (error) {
    console.error("Close position error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown close error"
    };
  }
}

/**
 * Get open positions
 */
export async function getOpenPositions(): Promise<TradeOrder[]> {
  try {
    const { data: orders, error } = await db.from("trades").select().eq("status", "open");
    
    if (error) {
      console.error("Error fetching open positions:", error);
      return [];
    }

    return orders || [];
  } catch (error) {
    console.error("Error fetching open positions:", error);
    return [];
  }
}

/**
 * Update stop loss for existing position
 */
export async function updateStopLoss(
  orderId: string,
  newStopLoss: number
): Promise<ExecutionResult> {
  try {
    const { error } = await db.from("trades").update({
      stop_loss: newStopLoss,
      updated_at: new Date().toISOString()
    }).eq("id", orderId);

    if (error) {
      return {
        success: false,
        error: "Failed to update stop loss"
      };
    }

    console.log(`Stop loss updated for ${orderId}: $${newStopLoss}`);

    return {
      success: true,
      orderId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown update error"
    };
  }
}

/**
 * Cancel pending order
 */
export async function cancelOrder(orderId: string): Promise<ExecutionResult> {
  try {
    const { error } = await db.from("trades").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString()
    }).eq("id", orderId);

    if (error) {
      return {
        success: false,
        error: "Failed to cancel order"
      };
    }

    console.log(`Order cancelled: ${orderId}`);

    return {
      success: true,
      orderId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cancel error"
    };
  }
} 