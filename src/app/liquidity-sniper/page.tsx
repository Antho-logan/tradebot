// /app/liquidity-sniper/page.tsx
// Liquidity Sniper – placeholder UI, pure front-end
// TODO: Wire up real sockets/data for sweeps, chart, KPIs

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import AppShell from '../AppShell';

const MOCK_SWEEPS = [
  { id: 1, ts: '12:01:10', pair: 'BTC/USD', dir: 'bull', size: 1.2 },
  { id: 2, ts: '12:02:15', pair: 'ETH/USD', dir: 'bear', size: 0.8 },
  { id: 3, ts: '12:03:20', pair: 'SOL/USD', dir: 'bull', size: 2.1 },
];

const KPI = [
  { label: 'Total Pools Found', value: 128 },
  { label: 'Avg Sweep Size', value: '1.4M' },
  { label: 'Last Sweep Pair', value: 'BTC/USD' },
];

const TABS = [
  { key: 'heat', label: 'Heat-Map' },
  { key: 'levels', label: 'Liquidity Levels' },
];

const fadeDown = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LiquiditySniperPage() {
  const [sweeps, setSweeps] = React.useState(MOCK_SWEEPS);
  const [tab, setTab] = React.useState<'heat' | 'levels'>('heat');
  // Auto-append mock sweep every 5s
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSweeps(prev => [
        ...prev,
        {
          id: prev.length + 1,
          ts: new Date().toLocaleTimeString().slice(0, 8),
          pair: ['BTC/USD', 'ETH/USD', 'SOL/USD'][Math.floor(Math.random()*3)],
          dir: Math.random() > 0.5 ? 'bull' : 'bear',
          size: +(Math.random()*2+0.5).toFixed(2),
        },
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell>
      <div className="px-4 py-8 max-w-7xl mx-auto font-sans">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-white">Liquidity Sniper</span>
        </nav>
        <h1 className="text-3xl font-bold text-white mb-6">Liquidity Sniper</h1>
        {/* KPI Chip Row */}
        <div className="flex flex-wrap gap-4 mb-8">
          {KPI.map(k => (
            <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-full px-6 py-2 flex items-center gap-2 text-emerald-400 font-semibold text-sm shadow">
              <Zap className="w-4 h-4" />
              <span>{k.label}:</span>
              <span className="text-white font-bold">{k.value}</span>
            </div>
          ))}
        </div>
        {/* Split Pane */}
        <div className="flex flex-col lg:flex-row gap-8 min-h-[420px]">
          {/* LEFT: Timeline */}
          <div className="lg:w-1/3 w-full flex flex-col gap-4">
            <div className="font-semibold text-neutral-300 mb-2">Latest Sweeps</div>
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {sweeps.slice(-10).reverse().map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeDown}
                    className={`relative bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 flex flex-col shadow group overflow-hidden`}
                    style={{ borderLeft: `6px solid ${s.dir === 'bull' ? '#10A37F' : '#ef4444'}` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${s.dir === 'bull' ? 'text-emerald-400' : 'text-red-400'}`}>{s.pair}</span>
                      <span className="text-xs text-neutral-400">{s.ts}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-xs">Sweep Size</span>
                      <span className="font-mono text-white">{s.size}M</span>
                      <span className={`text-xs font-semibold ${s.dir === 'bull' ? 'text-emerald-400' : 'text-red-400'}`}>{s.dir === 'bull' ? 'Bull' : 'Bear'}</span>
                    </div>
                    {/* TODO: Add sweep details, link to chart, etc. */}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          {/* RIGHT: Chart + Tabs */}
          <div className="lg:w-2/3 w-full flex flex-col gap-4">
            <div className="flex gap-2 mb-2">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`px-4 py-2 rounded-t-lg font-medium transition border-b-2 ${tab === t.key ? 'border-emerald-500 text-emerald-400 bg-neutral-900' : 'border-transparent text-neutral-400 bg-neutral-950 hover:text-emerald-400'}`}
                  onClick={() => setTab(t.key as 'heat' | 'levels')}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="bg-neutral-900 rounded-xl shadow-lg p-6 border border-neutral-800 flex-1 min-h-[260px] flex items-center justify-center text-neutral-500">
              {/* TODO: Render chart or liquidity levels here */}
              <span>{tab === 'heat' ? 'Heat-Map placeholder' : 'Liquidity Levels placeholder'}</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 