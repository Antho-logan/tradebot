/**
 * GlobalPnLWidget.tsx
 * Compact global PnL card for dashboard/overview use.
 * - 320x120px, dark theme, #10A37F accent
 * - Metrics: Balance, Open PnL, Daily PnL, Equity % bar
 * - Green for positive, red for negative
 * - Fade-in on mount, pulse update every 5s (mocked)
 * - Absolute "Back ← Dashboard" link top-left
 */
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#10A37F';

// Consistent number formatting to prevent hydration mismatch
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function randomPnL() {
  const balance = 10000 + Math.round(Math.random() * 2000 - 1000);
  const openPnl = +(Math.random() * 400 - 200).toFixed(2);
  const dailyPnl = +(Math.random() * 300 - 150).toFixed(2);
  const equityPct = Math.max(0, Math.min(100, 60 + Math.random() * 40));
  return { balance, openPnl, dailyPnl, equityPct };
}

export default function GlobalPnLWidget() {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState({
    balance: 10500, // Fixed initial values to prevent hydration mismatch
    openPnl: 125.50,
    dailyPnl: 87.25,
    equityPct: 75,
  });
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Only start random updates after component is mounted on client
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setPulse(true);
        setData(randomPnL());
        setTimeout(() => setPulse(false), 400);
      }, 5000);
    }, 1000); // Wait 1 second before starting updates
    
    return () => {
      clearTimeout(timer);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);



  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-[380px] h-[140px] bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-700 rounded-2xl shadow-xl flex flex-col items-center justify-center px-6 py-5 overflow-hidden"
    >

      <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
        <div className="flex gap-8 w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Balance</span>
            <span className="text-lg font-bold text-white font-mono">${formatNumber(data.balance)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Open PnL</span>
            <span className={`text-lg font-bold font-mono ${data.openPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} ${pulse ? 'animate-pulse' : ''}`}>{data.openPnl >= 0 ? '+' : ''}{data.openPnl.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Daily PnL</span>
            <span className={`text-lg font-bold font-mono ${data.dailyPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} ${pulse ? 'animate-pulse' : ''}`}>{data.dailyPnl >= 0 ? '+' : ''}{data.dailyPnl.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Equity</span>
            <span>{data.equityPct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-neutral-900 rounded-lg overflow-hidden">
            <motion.div
              key={data.equityPct}
              initial={{ width: 0 }}
              animate={{ width: `${data.equityPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-lg"
              style={{ background: ACCENT }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 