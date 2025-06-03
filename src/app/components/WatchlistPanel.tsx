/**
 * WatchlistPanel.tsx
 * Professional trading watchlist panel - now as a horizontal bottom strip
 * Features: horizontal layout, color-coded changes, hover effects, animations
 */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  last: number;
  chg: number;
  pct: number;
}

const MOCK_DATA: WatchlistItem[] = [
  { symbol: "BTC", last: 111191.0, chg: 145.3, pct: 0.13 },
  { symbol: "ETH", last: 3910.5, chg: 51.2, pct: 1.33 },
  { symbol: "SOL", last: 164.7, chg: -2.1, pct: -1.26 },
  { symbol: "ADA", last: 0.8945, chg: 0.0234, pct: 2.69 },
  { symbol: "DOT", last: 7.234, chg: -0.156, pct: -2.11 },
  { symbol: "LINK", last: 23.45, chg: 0.89, pct: 3.95 },
  { symbol: "AVAX", last: 42.18, chg: -1.23, pct: -2.84 },
  { symbol: "MATIC", last: 1.0567, chg: 0.0234, pct: 2.27 }
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(4);
  }
}

function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export default function WatchlistPanel() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="w-full py-8 bg-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Live Market Data</h2>
          <p className="text-neutral-400">Real-time cryptocurrency prices</p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 p-6 shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {MOCK_DATA.map((item) => {
              const isPositive = item.chg >= 0;
              const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
              const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';
              
              return (
                <motion.div
                  key={item.symbol}
                  variants={itemVariants}
                  className={`${bgColor} rounded-xl p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group`}
                >
                  {/* Symbol */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.symbol}
                    </span>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-lg font-mono font-bold text-white">
                      ${formatPrice(item.last)}
                    </span>
                  </div>

                  {/* Change % */}
                  <div>
                    <span className={`text-sm font-mono font-medium ${changeColor}`}>
                      {formatPercent(item.pct)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-xs text-neutral-500">
              Live data • Updated every second
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
} 