'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

interface AccountData {
  balance: number;
  freeBalance: number;
  usedBalance: number;
  openPnl: number;
  dailyPnl: number;
  equityPct: number;
  positions: Array<{
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    markPrice: number;
    unrealizedPnl: number;
    percentage: number;
  }>;
  timestamp: number;
}

interface TradesData {
  trades: Array<{
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    cost: number;
    fee: number;
    timestamp: number;
    pnl: number;
  }>;
  summary: {
    totalTrades: number;
    totalVolume: number;
    totalFees: number;
    totalPnL: number;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(2);
}

function formatPnL(pnl: number): string {
  return `$${Math.abs(pnl).toFixed(2)}`;
}

export default function LiveTradingInterface() {
  // Fetch account data
  const { data: accountData, error: accountError } = useSWR(
    '/api/blowfin/account',
    fetcher,
    { refreshInterval: 30000 }
  );

  // Fetch recent trades
  const { data: tradesData, error: tradesError } = useSWR(
    '/api/blowfin/trades?limit=10',
    fetcher,
    { refreshInterval: 60000 }
  );

  const account: AccountData | undefined = accountData?.data;
  const trades: TradesData | undefined = tradesData?.data;
  const isLiveData = accountData?.success && !accountError;

  // Calculate active trades count
  const activeTrades = account?.positions?.length || 0;
  const pendingTrades = Math.max(0, (trades?.summary?.totalTrades || 0) - activeTrades);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Portfolio Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="bg-neutral-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">Portfolio</span>
            {isLiveData && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatNumber(account?.balance || 0)}
          </div>
          <div className={`text-sm ${
            (account?.dailyPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {(account?.dailyPnl || 0) >= 0 ? '+' : ''}
            {account?.dailyPnl ? formatPnL(account.dailyPnl) : '$0.00'} today
          </div>
        </motion.div>
        
        {/* Active Trades Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="bg-neutral-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Active Trades</span>
            {isLiveData && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">{activeTrades}</div>
          <div className="text-blue-400 text-sm">
            {pendingTrades} recent
          </div>
        </motion.div>
        
        {/* Today's P&L Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="bg-neutral-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            {(account?.openPnl || 0) >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-medium">Open P&L</span>
            {isLiveData && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            (account?.openPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {(account?.openPnl || 0) >= 0 ? '+' : ''}
            {account?.openPnl ? formatPnL(account.openPnl) : '$0.00'}
          </div>
          <div className={`text-sm ${
            (account?.openPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {account?.equityPct ? `${account.equityPct.toFixed(1)}% equity` : 'No positions'}
          </div>
        </motion.div>
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
          isLiveData 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isLiveData ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
          <span className="font-medium">
            {isLiveData ? 'Live BloFin Data' : 'Connection Issue'}
          </span>
        </div>
        
        {account?.timestamp && (
          <div className="text-xs text-neutral-400">
            Last updated: {new Date(account.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      {/* Mock Chart Area */}
      <div className="bg-neutral-800/50 rounded-xl p-6 h-48 flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/30 to-emerald-500/20 rounded-lg flex items-center justify-center">
          <span className="text-neutral-400 text-lg font-medium">Live Trading Chart</span>
        </div>
      </div>
    </div>
  );
} 