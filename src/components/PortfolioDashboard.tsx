"use client";

import React from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { formatNumber, formatPnL, formatPercent } from '../app/utils/formatters';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  percentage: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  cost: number;
  fee: number;
  timestamp: number;
  pnl: number;
}

export default function PortfolioDashboard() {
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

  const account = accountData?.data;
  const trades = tradesData?.data;
  const isLiveData = accountData?.source === 'live';

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Dashboard</h1>
          <p className="text-neutral-400 mt-1">
            Real-time Blowfin account overview
            {!isLiveData && (
              <span className="ml-2 text-yellow-400 text-sm">
                (Using mock data - API connection issue)
              </span>
            )}
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          isLiveData ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isLiveData ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
          <span className="text-sm font-medium">
            {isLiveData ? 'Live Data' : 'Mock Data'}
          </span>
        </div>
      </motion.div>

      {/* Account Summary Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <SummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Total Balance"
          value={`$${formatNumber(account?.balance || 0)}`}
          subtitle="Available funds"
          color="text-blue-400"
        />
        <SummaryCard
          icon={account?.openPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          title="Open P&L"
          value={`${account?.openPnl >= 0 ? '+' : ''}${formatPnL(account?.openPnl || 0)}`}
          subtitle="Unrealized"
          color={account?.openPnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <SummaryCard
          icon={account?.dailyPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          title="Daily P&L"
          value={`${account?.dailyPnl >= 0 ? '+' : ''}${formatPnL(account?.dailyPnl || 0)}`}
          subtitle="Today's performance"
          color={account?.dailyPnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <SummaryCard
          icon={<Target className="w-5 h-5" />}
          title="Equity Usage"
          value={`${Math.round(account?.equityPct || 0)}%`}
          subtitle="Risk utilization"
          color="text-purple-400"
        />
      </motion.div>

      {/* Positions and Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="bg-neutral-900 rounded-2xl p-6 border border-neutral-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-400" />
            Open Positions
          </h2>
          {account?.positions?.length > 0 ? (
            <div className="space-y-3">
              {account.positions.map((position: Position, index: number) => (
                <PositionCard key={index} position={position} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No open positions</p>
            </div>
          )}
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="bg-neutral-900 rounded-2xl p-6 border border-neutral-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Recent Trades
          </h2>
          {trades?.trades?.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trades.trades.slice(0, 5).map((trade: Trade) => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent trades</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color}`}>{icon}</div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-neutral-400">{title}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PositionCard({ position }: { position: Position }) {
  const isProfit = position.unrealizedPnl >= 0;
  
  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">{position.symbol}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            position.side === 'long' 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            {position.side.toUpperCase()}
          </span>
        </div>
        <span className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {isProfit ? '+' : ''}{formatPnL(position.unrealizedPnl)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-neutral-400">Size</p>
          <p className="text-white font-medium">{position.size}</p>
        </div>
        <div>
          <p className="text-neutral-400">Entry</p>
          <p className="text-white font-medium">${formatNumber(position.entryPrice)}</p>
        </div>
        <div>
          <p className="text-neutral-400">Mark</p>
          <p className="text-white font-medium">${formatNumber(position.markPrice)}</p>
        </div>
        <div>
          <p className="text-neutral-400">P&L %</p>
          <p className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(position.percentage)}
          </p>
        </div>
      </div>
    </div>
  );
}

function TradeCard({ trade }: { trade: Trade }) {
  const isProfit = trade.pnl >= 0;
  
  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">{trade.symbol}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            trade.side === 'buy' 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            {trade.side.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-neutral-400">
          {new Date(trade.timestamp).toLocaleDateString()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-neutral-400">Amount</p>
          <p className="text-white font-medium">{trade.amount}</p>
        </div>
        <div>
          <p className="text-neutral-400">Price</p>
          <p className="text-white font-medium">${formatNumber(trade.price)}</p>
        </div>
        <div>
          <p className="text-neutral-400">P&L</p>
          <p className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatPnL(trade.pnl)}
          </p>
        </div>
      </div>
    </div>
  );
} 