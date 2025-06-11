import yaml from "yaml";
import fs from "fs";
import path from "path";

// Types for candle data and indicators
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FVG {
  direction: "long" | "short";
  high: number;
  low: number;
  timestamp: number;
  filled: boolean;
}

export interface OrderBlock {
  direction: "long" | "short";
  high: number;
  low: number;
  timestamp: number;
  volume: number;
}

export interface Signal {
  pair: string;
  side: "long" | "short";
  entry: number;
  tp: number[];
  sl: number;
  riskPct: number;
  confidence: number;
  timestamp: number;
  metadata: {
    rangeHigh: number;
    rangeLow: number;
    boxHeight: number;
    cvdDelta: number;
    fvgConfirmed: boolean;
    orderBlockConfirmed: boolean;
  };
}

// Load strategy configuration
let cfg: any;
try {
  const configPath = path.join(process.cwd(), "config", "strategy_range_fib.yaml");
  cfg = yaml.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
  console.error("Failed to load strategy config:", error);
  // Fallback configuration
  cfg = {
    pairs: { major: ["BTC/USDT", "ETH/USDT"] },
    risk: { per_trade_fraction: 0.02 },
    stop_loss: { initial_buffer_pct: 2.5 },
    order_flow_filter: { lookback_bars: 10, min_delta: 1000 },
    take_profit: {
      major_pairs: { levels: [0.5, 0.618, 0.65] },
      minor_pairs: { levels: [0.705, 0.75, 0.786] }
    }
  };
}

/**
 * Detect Fair Value Gaps in candle data
 */
export function detectFVG(candles: Candle[]): FVG[] {
  const fvgs: FVG[] = [];
  
  for (let i = 2; i < candles.length; i++) {
    const prev = candles[i - 2];
    const current = candles[i - 1];
    const next = candles[i];
    
    // Bullish FVG: gap between prev.high and next.low
    if (prev.high < next.low && current.close > current.open) {
      fvgs.push({
        direction: "long",
        high: next.low,
        low: prev.high,
        timestamp: current.timestamp,
        filled: false
      });
    }
    
    // Bearish FVG: gap between prev.low and next.high
    if (prev.low > next.high && current.close < current.open) {
      fvgs.push({
        direction: "short",
        high: prev.low,
        low: next.high,
        timestamp: current.timestamp,
        filled: false
      });
    }
  }
  
  return fvgs;
}

/**
 * Detect Order Blocks in candle data
 */
export function detectOrderBlocks(candles: Candle[]): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
  
  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    
    // High volume requirement
    if (candle.volume < avgVolume * 1.5) continue;
    
    // Bullish order block: strong buying after decline
    if (candle.close > candle.open && 
        prevCandle.close < prevCandle.open &&
        candle.close > prevCandle.high) {
      orderBlocks.push({
        direction: "long",
        high: candle.high,
        low: candle.low,
        timestamp: candle.timestamp,
        volume: candle.volume
      });
    }
    
    // Bearish order block: strong selling after rally
    if (candle.close < candle.open && 
        prevCandle.close > prevCandle.open &&
        candle.close < prevCandle.low) {
      orderBlocks.push({
        direction: "short",
        high: candle.high,
        low: candle.low,
        timestamp: candle.timestamp,
        volume: candle.volume
      });
    }
  }
  
  return orderBlocks;
}

/**
 * Calculate Cumulative Volume Delta
 */
export function calcCVD(candles: Candle[]): number[] {
  const cvd: number[] = [];
  let cumulative = 0;
  
  for (const candle of candles) {
    // Simplified CVD calculation
    const delta = candle.close > candle.open ? candle.volume : -candle.volume;
    cumulative += delta;
    cvd.push(cumulative);
  }
  
  return cvd;
}

/**
 * Validate market conditions for trading
 */
function validateMarketConditions(candles: Candle[]): boolean {
  if (candles.length < 20) return false;
  
  // Calculate volatility
  const prices = candles.map(c => c.close);
  const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
  const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * Math.sqrt(24);
  
  return volatility >= cfg.market_conditions?.min_volatility && 
         volatility <= cfg.market_conditions?.max_volatility;
}

/**
 * Generate trading signal based on range fibonacci strategy
 */
export function generateSignal(pair: string, candles4h: Candle[], candles15m: Candle[]): Signal | null {
  try {
    // Validate inputs
    if (!candles4h.length || !candles15m.length) return null;
    if (candles4h.length < 20 || candles15m.length < 50) return null;
    
    // Check market conditions
    if (!validateMarketConditions(candles15m)) return null;
    
    const isBtc = cfg.pairs.major.includes(pair);
    const timestamp = Date.now();

    /* 1️⃣ Determine range high/low on 4-hour data */
    const rangeLow = Math.min(...candles4h.map(c => c.low));
    const rangeHigh = Math.max(...candles4h.map(c => c.high));
    const boxHeight = rangeHigh - rangeLow;
    
    // Validate range size
    if (boxHeight <= 0) return null;

    /* 2️⃣ Latest 15-m candle must tap either edge (±0.25%) */
    const last = candles15m[candles15m.length - 1];
    const tolerance = boxHeight * (cfg.indicators?.range_detection?.tolerance_pct || 0.25) / 100;
    const tappedBottom = Math.abs(last.low - rangeLow) <= tolerance;
    const tappedTop = Math.abs(last.high - rangeHigh) <= tolerance;
    
    if (!tappedBottom && !tappedTop) return null;

    /* 3️⃣ Indicator confirmations on 15-m */
    const fvgs = detectFVG(candles15m);
    const orderBlocks = detectOrderBlocks(candles15m);
    
    const latestFVG = fvgs[fvgs.length - 1];
    const latestOB = orderBlocks[orderBlocks.length - 1];
    
    const direction: "long" | "short" = tappedBottom ? "long" : "short";
    
    const fvgConfirmed = latestFVG && latestFVG.direction === direction;
    const orderBlockConfirmed = latestOB && latestOB.direction === direction;
    
    if (!fvgConfirmed || !orderBlockConfirmed) return null;

    /* 4️⃣ Order-flow filter (CVD slope) */
    const lookbackBars = cfg.order_flow_filter?.lookback_bars || 10;
    const minDelta = cfg.order_flow_filter?.min_delta || 1000;
    
    const cvdData = calcCVD(candles15m.slice(-lookbackBars));
    const cvdDelta = cvdData[cvdData.length - 1] - cvdData[0];
    
    if (direction === "long" && cvdDelta < minDelta) return null;
    if (direction === "short" && cvdDelta > -minDelta) return null;

    /* 5️⃣ Build TP ladder */
    const entryPrice = tappedBottom ? rangeLow : rangeHigh;
    const tpConfig = isBtc ? cfg.take_profit.major_pairs : cfg.take_profit.minor_pairs;
    const levels = tpConfig?.levels || [0.5, 0.618, 0.65];
    
    let tpLevels: number[] = [];
    
    if (direction === "long") {
      tpLevels = levels.map((level: number) => rangeLow + level * boxHeight);
    } else {
      tpLevels = levels.map((level: number) => rangeHigh - level * boxHeight);
    }

    /* 6️⃣ Stop Loss */
    const bufferPct = cfg.stop_loss?.initial_buffer_pct || 2.5;
    const sl = direction === "long"
      ? rangeLow - (boxHeight * bufferPct / 100)
      : rangeHigh + (boxHeight * bufferPct / 100);

    // Calculate confidence score
    const confidence = calculateConfidence({
      fvgConfirmed,
      orderBlockConfirmed,
      cvdDelta: Math.abs(cvdDelta),
      minDelta,
      volatility: boxHeight / rangeLow // relative volatility
    });

    return {
      pair,
      side: direction,
      entry: entryPrice,
      tp: tpLevels,
      sl,
      riskPct: cfg.risk?.per_trade_fraction || 0.02,
      confidence,
      timestamp,
      metadata: {
        rangeHigh,
        rangeLow,
        boxHeight,
        cvdDelta,
        fvgConfirmed,
        orderBlockConfirmed
      }
    };

  } catch (error) {
    console.error("Error generating signal:", error);
    return null;
  }
}

/**
 * Calculate signal confidence score (0-1)
 */
function calculateConfidence(params: {
  fvgConfirmed: boolean;
  orderBlockConfirmed: boolean;
  cvdDelta: number;
  minDelta: number;
  volatility: number;
}): number {
  let score = 0;
  
  // Base confirmations
  if (params.fvgConfirmed) score += 0.3;
  if (params.orderBlockConfirmed) score += 0.3;
  
  // CVD strength
  const cvdStrength = Math.min(params.cvdDelta / params.minDelta, 3) / 3;
  score += cvdStrength * 0.25;
  
  // Volatility factor (moderate volatility preferred)
  const volScore = params.volatility > 0.02 && params.volatility < 0.08 ? 0.15 : 0.05;
  score += volScore;
  
  return Math.min(score, 1);
}

/**
 * Validate signal before execution
 */
export function validateSignal(signal: Signal): boolean {
  // Basic validation
  if (!signal.pair || !signal.side || signal.entry <= 0) return false;
  if (signal.tp.length === 0 || signal.sl <= 0) return false;
  if (signal.riskPct <= 0 || signal.riskPct > 0.1) return false;
  
  // Price validation
  if (signal.side === "long") {
    if (signal.sl >= signal.entry) return false;
    if (signal.tp.some(tp => tp <= signal.entry)) return false;
  } else {
    if (signal.sl <= signal.entry) return false;
    if (signal.tp.some(tp => tp >= signal.entry)) return false;
  }
  
  // Confidence threshold
  if (signal.confidence < 0.6) return false;
  
  return true;
} 