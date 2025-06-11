import { Signal } from "../strategies/strategyCore";

// Risk management configuration interface
export interface RiskConfig {
  dailyLossCapFraction: number;
  maxConcurrentTrades: number;
  maxPositionSizeUsd: number;
  maxRiskPerTrade: number;
  emergencyStopLoss: number;
  correlationLimit: number;
}

// Portfolio state interface
export interface PortfolioState {
  totalEquity: number;
  availableBalance: number;
  unrealizedPnL: number;
  dailyPnL: number;
  openPositions: number;
  todayLossPct: number;
  maxDrawdown: number;
  riskUtilization: number;
}

// Position sizing result
export interface PositionSizeResult {
  sizeUsd: number;
  sizeBase: number;
  riskAmount: number;
  leverageUsed: number;
  approved: boolean;
  reason?: string;
}

// Default risk configuration
const DEFAULT_RISK_CONFIG: RiskConfig = {
  dailyLossCapFraction: 0.05,    // 5% daily loss limit
  maxConcurrentTrades: 3,        // Maximum 3 concurrent positions
  maxPositionSizeUsd: 10000,     // $10k max position size
  maxRiskPerTrade: 0.02,         // 2% max risk per trade
  emergencyStopLoss: 0.10,       // 10% emergency stop
  correlationLimit: 0.7          // 70% correlation limit
};

let riskConfig: RiskConfig = DEFAULT_RISK_CONFIG;

/**
 * Update risk configuration
 */
export function updateRiskConfig(config: Partial<RiskConfig>): void {
  riskConfig = { ...riskConfig, ...config };
}

/**
 * Get current risk configuration
 */
export function getRiskConfig(): RiskConfig {
  return { ...riskConfig };
}

/**
 * Calculate position size in USD based on risk parameters
 */
export function positionSizeUsd(
  equityUsd: number, 
  riskPct: number, 
  entry: number, 
  sl: number
): number {
  if (equityUsd <= 0 || riskPct <= 0 || entry <= 0 || sl <= 0) {
    return 0;
  }

  const riskAmount = equityUsd * Math.min(riskPct, riskConfig.maxRiskPerTrade);
  const stopDistance = Math.abs(entry - sl);
  
  if (stopDistance === 0) return 0;
  
  const positionSize = riskAmount / stopDistance;
  
  // Apply maximum position size limit
  return Math.min(positionSize, riskConfig.maxPositionSizeUsd);
}

/**
 * Calculate detailed position sizing with validation
 */
export function calculatePositionSize(
  signal: Signal,
  portfolio: PortfolioState,
  currentPrice: number
): PositionSizeResult {
  try {
    // Basic validation
    if (!signal || !portfolio || currentPrice <= 0) {
      return {
        sizeUsd: 0,
        sizeBase: 0,
        riskAmount: 0,
        leverageUsed: 1,
        approved: false,
        reason: "Invalid input parameters"
      };
    }

    // Check if trading is allowed
    if (!shouldTrade(portfolio.todayLossPct)) {
      return {
        sizeUsd: 0,
        sizeBase: 0,
        riskAmount: 0,
        leverageUsed: 1,
        approved: false,
        reason: "Daily loss limit exceeded"
      };
    }

    // Check concurrent trades limit
    if (portfolio.openPositions >= riskConfig.maxConcurrentTrades) {
      return {
        sizeUsd: 0,
        sizeBase: 0,
        riskAmount: 0,
        leverageUsed: 1,
        approved: false,
        reason: "Maximum concurrent trades reached"
      };
    }

    // Calculate base position size
    const riskAmount = portfolio.totalEquity * signal.riskPct;
    const stopDistance = Math.abs(signal.entry - signal.sl);
    
    if (stopDistance === 0) {
      return {
        sizeUsd: 0,
        sizeBase: 0,
        riskAmount: 0,
        leverageUsed: 1,
        approved: false,
        reason: "Invalid stop loss distance"
      };
    }

    let sizeUsd = riskAmount / (stopDistance / signal.entry);
    
    // Apply position size limits
    sizeUsd = Math.min(sizeUsd, riskConfig.maxPositionSizeUsd);
    sizeUsd = Math.min(sizeUsd, portfolio.availableBalance * 0.8); // Use max 80% of available balance
    
    // Calculate base currency size
    const sizeBase = sizeUsd / currentPrice;
    
    // Calculate leverage (if applicable)
    const leverageUsed = sizeUsd / Math.min(sizeUsd, portfolio.availableBalance);
    
    // Final validation
    if (sizeUsd < 10) { // Minimum $10 position
      return {
        sizeUsd: 0,
        sizeBase: 0,
        riskAmount: 0,
        leverageUsed: 1,
        approved: false,
        reason: "Position size too small"
      };
    }

    return {
      sizeUsd,
      sizeBase,
      riskAmount,
      leverageUsed,
      approved: true
    };

  } catch (error) {
    console.error("Error calculating position size:", error);
    return {
      sizeUsd: 0,
      sizeBase: 0,
      riskAmount: 0,
      leverageUsed: 1,
      approved: false,
      reason: "Calculation error"
    };
  }
}

/**
 * Check if trading should be allowed based on current losses
 */
export function shouldTrade(todayLossPct: number): boolean {
  return Math.abs(todayLossPct) < riskConfig.dailyLossCapFraction;
}

/**
 * Validate signal against risk parameters
 */
export function validateSignalRisk(signal: Signal, portfolio: PortfolioState): {
  approved: boolean;
  reason?: string;
  adjustedRisk?: number;
} {
  // Check signal risk percentage
  if (signal.riskPct > riskConfig.maxRiskPerTrade) {
    return {
      approved: false,
      reason: `Risk per trade (${signal.riskPct * 100}%) exceeds maximum (${riskConfig.maxRiskPerTrade * 100}%)`
    };
  }

  // Check portfolio drawdown
  if (portfolio.maxDrawdown > riskConfig.emergencyStopLoss) {
    return {
      approved: false,
      reason: "Portfolio drawdown exceeds emergency stop loss"
    };
  }

  // Check risk utilization
  const projectedRisk = portfolio.riskUtilization + signal.riskPct;
  if (projectedRisk > 0.1) { // Max 10% total risk
    const adjustedRisk = Math.max(0.1 - portfolio.riskUtilization, 0.005); // Min 0.5% risk
    return {
      approved: true,
      adjustedRisk,
      reason: "Risk adjusted due to portfolio utilization"
    };
  }

  return { approved: true };
}

/**
 * Calculate portfolio risk metrics
 */
export function calculateRiskMetrics(portfolio: PortfolioState): {
  sharpeRatio: number;
  maxDrawdownPct: number;
  riskAdjustedReturn: number;
  volatility: number;
  var95: number; // Value at Risk 95%
} {
  // Simplified risk metrics calculation
  // In production, these would use historical data
  
  const dailyReturn = portfolio.dailyPnL / portfolio.totalEquity;
  const volatility = Math.abs(dailyReturn) * Math.sqrt(252); // Annualized
  
  return {
    sharpeRatio: dailyReturn > 0 ? dailyReturn / (volatility || 0.01) : 0,
    maxDrawdownPct: portfolio.maxDrawdown,
    riskAdjustedReturn: dailyReturn / (volatility || 0.01),
    volatility,
    var95: portfolio.totalEquity * 0.05 // Simplified 5% VaR
  };
}

/**
 * Emergency risk controls
 */
export function checkEmergencyControls(portfolio: PortfolioState): {
  shouldStop: boolean;
  reason?: string;
  actions: string[];
} {
  const actions: string[] = [];
  
  // Check daily loss limit
  if (Math.abs(portfolio.todayLossPct) >= riskConfig.dailyLossCapFraction) {
    actions.push("Stop all new trades");
    return {
      shouldStop: true,
      reason: "Daily loss limit exceeded",
      actions
    };
  }

  // Check maximum drawdown
  if (portfolio.maxDrawdown >= riskConfig.emergencyStopLoss) {
    actions.push("Close all positions", "Stop trading");
    return {
      shouldStop: true,
      reason: "Emergency drawdown limit reached",
      actions
    };
  }

  // Check available balance
  if (portfolio.availableBalance < portfolio.totalEquity * 0.1) {
    actions.push("Reduce position sizes", "Monitor margin closely");
  }

  // Check unrealized losses
  if (portfolio.unrealizedPnL < -portfolio.totalEquity * 0.05) {
    actions.push("Review open positions", "Consider partial closures");
  }

  return {
    shouldStop: false,
    actions
  };
}

/**
 * Get risk summary for dashboard
 */
export function getRiskSummary(portfolio: PortfolioState): {
  status: "safe" | "warning" | "danger";
  riskScore: number; // 0-100
  alerts: string[];
  recommendations: string[];
} {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Calculate risk score components
  const drawdownScore = Math.min(portfolio.maxDrawdown / riskConfig.emergencyStopLoss, 1) * 40;
  const utilizationScore = portfolio.riskUtilization * 30;
  const dailyLossScore = Math.abs(portfolio.todayLossPct) / riskConfig.dailyLossCapFraction * 30;

  riskScore = drawdownScore + utilizationScore + dailyLossScore;

  // Generate alerts and recommendations
  if (portfolio.maxDrawdown > riskConfig.emergencyStopLoss * 0.7) {
    alerts.push("High drawdown detected");
    recommendations.push("Consider reducing position sizes");
  }

  if (portfolio.openPositions >= riskConfig.maxConcurrentTrades) {
    alerts.push("Maximum concurrent trades reached");
  }

  if (Math.abs(portfolio.todayLossPct) > riskConfig.dailyLossCapFraction * 0.8) {
    alerts.push("Approaching daily loss limit");
    recommendations.push("Be cautious with new trades");
  }

  // Determine status
  let status: "safe" | "warning" | "danger" = "safe";
  if (riskScore > 70) status = "danger";
  else if (riskScore > 40) status = "warning";

  return {
    status,
    riskScore: Math.min(riskScore, 100),
    alerts,
    recommendations
  };
} 