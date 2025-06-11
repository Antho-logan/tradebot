'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Activity,
  BarChart3,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

interface MarketPrice {
  symbol: string;
  price: number;
  changePct: number;
}

interface PaperTradingStats {
  totalBalance: number;
  startingBalance: number;
  totalPnL: number;
  totalPnLPct: number;
  dailyPnL: number;
  dailyPnLPct: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  openTrades: number;
  todayTrades: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldTime: string;
  sharpeRatio: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

export default function PaperTradingDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch paper trading data
  const { data: statsData, error: statsError } = useSWR(
    '/api/paper-trading/stats',
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: tradesData, error: tradesError } = useSWR(
    '/api/paper-trading/trades?limit=10',
    fetcher,
    { refreshInterval: 10000 }
  );

  // Fetch current market prices for real-time P&L
  const { data: pricesData } = useSWR(
    '/api/market/prices',
    fetcher,
    { refreshInterval: 10000 }
  );

  // Default starting data for paper trading
  const defaultStats: PaperTradingStats = {
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
  };

  const stats = statsData?.data || defaultStats;
  const trades = tradesData?.data || [];
  const prices: MarketPrice[] = pricesData?.data || [];

  // Get current price for a trading pair
  const getCurrentPrice = (pair: string): number => {
    const symbol = pair.split('/')[0]; // Extract base currency (e.g., 'BTC' from 'BTC/USDT')
    const priceData = prices.find(p => p.symbol === symbol);
    return priceData?.price || 0;
  };

  // Calculate real-time P&L for open positions (FIXED CALCULATION)
  const calculateRealTimePnL = (trade: PaperTrade): { pnl: number; pnlPct: number; currentPrice: number; quantity: number } => {
    if (trade.status !== 'open') {
      return { 
        pnl: trade.pnl || 0, 
        pnlPct: trade.pnl ? (trade.pnl / trade.size_usd) * 100 : 0,
        currentPrice: trade.exit_price || trade.entry_price,
        quantity: trade.size_usd / trade.entry_price
      };
    }

    const currentPrice = getCurrentPrice(trade.pair);
    if (!currentPrice) {
      return { 
        pnl: 0, 
        pnlPct: 0, 
        currentPrice: trade.entry_price,
        quantity: trade.size_usd / trade.entry_price
      };
    }

    // Calculate quantity (how many coins/tokens we have)
    const quantity = trade.size_usd / trade.entry_price;
    
    // Calculate P&L based on price difference and quantity
    let pnl: number;
    if (trade.side === 'long') {
      // Long: profit when price goes up
      pnl = (currentPrice - trade.entry_price) * quantity;
    } else {
      // Short: profit when price goes down
      pnl = (trade.entry_price - currentPrice) * quantity;
    }
    
    const pnlPct = (pnl / trade.size_usd) * 100;

    return { pnl, pnlPct, currentPrice, quantity };
  };

  // Get open trades only
  const openTrades = trades.filter(trade => trade.status === 'open');

  // Calculate total unrealized P&L from current trades
  const totalUnrealizedPnL = openTrades.reduce((total, trade) => {
    const { pnl } = calculateRealTimePnL(trade);
    return total + pnl;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1) {
      return quantity.toFixed(4);
    }
    return quantity.toFixed(8);
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-emerald-400';
    if (value < 0) return 'text-red-400';
    return 'text-neutral-400';
  };

  const getTypeColor = (side: string) => {
    const normalizedSide = side.toLowerCase();
    return normalizedSide === 'long' ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full py-8 bg-gradient-to-br from-neutral-900 to-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Paper Trading Dashboard</h2>
              <p className="text-neutral-400">Live simulation • $100 starting balance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-neutral-300 font-medium">Total Balance</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(stats.startingBalance + stats.totalPnL + totalUnrealizedPnL)}
            </div>
            <div className={`text-sm ${getPerformanceColor(stats.totalPnL + totalUnrealizedPnL)}`}>
              {formatPercentage(((stats.totalPnL + totalUnrealizedPnL) / stats.startingBalance) * 100)} total return
            </div>
          </motion.div>

          {/* Daily P&L */}
          <motion.div
            variants={fadeUp}
            custom={1}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              {stats.dailyPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-neutral-300 font-medium">Daily P&L</span>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(stats.dailyPnL)}`}>
              {formatCurrency(stats.dailyPnL)}
            </div>
            <div className={`text-sm ${getPerformanceColor(stats.dailyPnL)}`}>
              {formatPercentage(stats.dailyPnLPct)} today
            </div>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            variants={fadeUp}
            custom={2}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-neutral-300 font-medium">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-neutral-400">
              {stats.winningTrades}W / {stats.losingTrades}L
            </div>
          </motion.div>

          {/* Unrealized P&L */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              {totalUnrealizedPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-orange-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-orange-400" />
              )}
              <span className="text-neutral-300 font-medium">Unrealized P&L</span>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(totalUnrealizedPnL)}`}>
              {formatCurrency(totalUnrealizedPnL)}
            </div>
            <div className={`text-sm ${getPerformanceColor(totalUnrealizedPnL)}`}>
              {formatPercentage((totalUnrealizedPnL / stats.startingBalance) * 100)} • {openTrades.length} open
            </div>
          </motion.div>
        </div>

        {/* Current Trades Section */}
        {openTrades.length > 0 && (
          <motion.div
            variants={fadeUp}
            custom={4}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Current Trades</h3>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                  {openTrades.length} Open
                </span>
              </div>
              <div className="text-sm text-neutral-400">
                Real-time P&L • Updates every 10s
              </div>
            </div>

            <div className="space-y-4">
              {openTrades.map((trade, index) => {
                const { pnl, pnlPct, currentPrice, quantity } = calculateRealTimePnL(trade);
                
                return (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-4 hover:border-neutral-600 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      {/* Pair & Side */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trade.side === 'long' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          {trade.side === 'long' ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{trade.pair}</div>
                          <div className={`text-sm font-medium ${getTypeColor(trade.side)}`}>
                            {trade.side.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <div className="text-neutral-400 text-xs mb-1">Quantity</div>
                        <div className="text-white font-medium">{formatQuantity(quantity)}</div>
                      </div>

                      {/* Entry Price */}
                      <div>
                        <div className="text-neutral-400 text-xs mb-1">Entry Price</div>
                        <div className="text-white font-medium">{formatPrice(trade.entry_price)}</div>
                      </div>

                      {/* Current Price */}
                      <div>
                        <div className="text-neutral-400 text-xs mb-1">Current Price</div>
                        <div className="text-white font-medium">{formatPrice(currentPrice)}</div>
                      </div>

                      {/* Position Size */}
                      <div>
                        <div className="text-neutral-400 text-xs mb-1">Size</div>
                        <div className="text-white font-medium">{formatCurrency(trade.size_usd)}</div>
                      </div>

                      {/* P&L */}
                      <div>
                        <div className="text-neutral-400 text-xs mb-1">P&L</div>
                        <div className={`font-bold ${getPerformanceColor(pnl)}`}>
                          {formatCurrency(pnl)}
                        </div>
                        <div className={`text-xs ${getPerformanceColor(pnl)}`}>
                          {formatPercentage(pnlPct)}
                        </div>
                      </div>

                      {/* Time & Strategy */}
                      <div className="text-right">
                        <div className="text-neutral-400 text-xs mb-1">Strategy</div>
                        <div className="text-white text-sm">{trade.strategy.replace('_', ' ')}</div>
                        <div className="text-neutral-500 text-xs">
                          {new Date(trade.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current Trades Summary */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-neutral-400 text-sm">Total Exposure</div>
                  <div className="text-white font-bold text-lg">
                    {formatCurrency(openTrades.reduce((sum, trade) => sum + trade.size_usd, 0))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-neutral-400 text-sm">Unrealized P&L</div>
                  <div className={`font-bold text-lg ${getPerformanceColor(totalUnrealizedPnL)}`}>
                    {formatCurrency(totalUnrealizedPnL)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-neutral-400 text-sm">Open Positions</div>
                  <div className="text-white font-bold text-lg">{openTrades.length}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Trades - ALWAYS VISIBLE */}
        <motion.div
          variants={fadeUp}
          custom={5}
          className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent Trades
          </h3>
          <div className="space-y-3">
            {trades.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-neutral-400 mb-2">No trades yet</div>
                <div className="text-sm text-neutral-500">
                  Paper trading will start automatically when market conditions are favorable
                </div>
              </div>
            ) : (
              trades.slice(0, 5).map((trade, index) => {
                const { pnl: realTimePnL } = calculateRealTimePnL(trade);
                const displayPnL = trade.status === 'open' ? realTimePnL : (trade.pnl || 0);
                
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(trade.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{trade.pair}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.side === 'long' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-400">
                          Entry: {formatPrice(trade.entry_price)} • Size: {formatCurrency(trade.size_usd)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getPerformanceColor(displayPnL)}`}>
                        {formatCurrency(displayPnL)}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {new Date(trade.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Expanded Stats */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Profit Factor</div>
                <div className="text-xl font-bold text-white">{stats.profitFactor.toFixed(2)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Sharpe Ratio</div>
                <div className="text-xl font-bold text-white">{stats.sharpeRatio.toFixed(2)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Max Drawdown</div>
                <div className="text-xl font-bold text-red-400">{formatCurrency(stats.maxDrawdown)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Avg Win</div>
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(stats.avgWin)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Avg Loss</div>
                <div className="text-xl font-bold text-red-400">{formatCurrency(stats.avgLoss)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Avg Hold Time</div>
                <div className="text-xl font-bold text-white">{stats.avgHoldTime}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Open Trades</div>
                <div className="text-xl font-bold text-white">{openTrades.length}</div>
                <div className="text-xs text-neutral-500 mt-1">{stats.todayTrades} trades today</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Best Trade</div>
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(stats.bestTrade)}</div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Worst Trade</div>
                <div className="text-xl font-bold text-red-400">{formatCurrency(stats.worstTrade)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Summary */}
        <motion.div
          variants={fadeUp}
          custom={6}
          className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 mt-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Strategy Performance</h3>
              <p className="text-neutral-300">
                {stats.totalTrades === 0 
                  ? 'Range Fibonacci strategy is ready to start paper trading. Waiting for favorable market conditions to execute first trade.'
                  : `Range Fibonacci strategy is performing ${(stats.totalPnL + totalUnrealizedPnL) > 0 ? 'well' : 'below expectations'} with a ${formatPercentage(((stats.totalPnL + totalUnrealizedPnL) / stats.startingBalance) * 100)} return over ${stats.totalTrades} trades.`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(stats.totalPnL + totalUnrealizedPnL)}
              </div>
              <div className="text-sm text-neutral-400">Total Profit</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}