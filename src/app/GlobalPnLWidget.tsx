/**
 * GlobalPnLWidget.tsx
 * Compact global PnL card for dashboard/overview use.
 * - Real Blowfin account data integration
 * - Metrics: Balance, Open PnL, Daily PnL, Equity % bar
 * - Green for positive, red for negative
 * - Fade-in on mount, updates every 30s
 */
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatPnL } from './utils/formatters';
import useSWR from 'swr';

const ACCENT = '#10A37F';

// Fixed initial data to ensure consistent SSR/client rendering
const INITIAL_DATA = {
  balance: 10500,
  openPnl: 125.50,
  dailyPnl: 87.25,
  equityPct: 75,
  source: 'loading' as 'loading' | 'live' | 'mock'
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GlobalPnLWidget() {
  const [mounted, setMounted] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);

  // Fetch real account data from Blowfin API
  const { data: accountResponse, error, isLoading } = useSWR(
    '/api/blowfin/account',
    fetcher,
    {
      refreshInterval: 30000, // Update every 30 seconds
      revalidateOnFocus: true,
      errorRetryCount: 3,
    }
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger pulse animation when data updates
  React.useEffect(() => {
    if (accountResponse && mounted) {
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }
  }, [accountResponse, mounted]);

  // Determine data to display
  const data = React.useMemo(() => {
    if (!mounted) {
      return INITIAL_DATA;
    }

    if (isLoading) {
      return { ...INITIAL_DATA, source: 'loading' as const };
    }

    if (error || !accountResponse?.success) {
      return { ...INITIAL_DATA, source: 'mock' as const };
    }

    const accountData = accountResponse.data;
    return {
      balance: accountData.balance,
      openPnl: accountData.openPnl,
      dailyPnl: accountData.dailyPnl,
      equityPct: accountData.equityPct,
      source: accountResponse.source as 'live' | 'mock'
    };
  }, [mounted, isLoading, error, accountResponse]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-[380px] h-[140px] bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-700 rounded-2xl shadow-xl flex flex-col items-center justify-center px-6 py-5 overflow-hidden"
    >
      {/* Data source indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${
          data.source === 'live' ? 'bg-green-400' : 
          data.source === 'mock' ? 'bg-yellow-400' : 
          'bg-gray-400'
        }`} title={
          data.source === 'live' ? 'Live Blowfin data' :
          data.source === 'mock' ? 'Mock data (API error)' :
          'Loading...'
        } />
      </div>

      <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
        <div className="flex gap-8 w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Balance</span>
            <span className="text-lg font-bold text-white font-mono">
              ${formatNumber(data.balance)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Open PnL</span>
            <span className={`text-lg font-bold font-mono ${
              data.openPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
            } ${pulse ? 'animate-pulse' : ''}`}>
              {data.openPnl >= 0 ? '+' : ''}{formatPnL(data.openPnl)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Daily PnL</span>
            <span className={`text-lg font-bold font-mono ${
              data.dailyPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
            } ${pulse ? 'animate-pulse' : ''}`}>
              {data.dailyPnl >= 0 ? '+' : ''}{formatPnL(data.dailyPnl)}
            </span>
          </div>
        </div>
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Equity</span>
            <span>{Math.round(data.equityPct)}%</span>
          </div>
          <div className="w-full h-3 bg-neutral-900 rounded-lg overflow-hidden">
            <motion.div
              key={mounted ? data.equityPct : INITIAL_DATA.equityPct}
              initial={{ width: 0 }}
              animate={{ width: `${data.equityPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-lg"
              style={{ background: ACCENT }}
            />
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && mounted && (
        <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center rounded-2xl">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
        </div>
      )}
    </motion.div>
  );
} 