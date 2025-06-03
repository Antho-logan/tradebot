// /app/fvg/page.tsx
// Fair Value Gap Engine – FVG scan UI (placeholder, pure front-end)
// TODO: Wire up real data, connect chart/table, handle scan logic

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Settings, BarChart3, Table2 } from 'lucide-react';
import Link from 'next/link';
import AppShell from '../AppShell';

const PAIRS = [
  { label: 'BTC/USD', value: 'BTCUSD' },
  { label: 'ETH/USD', value: 'ETHUSD' },
  { label: 'SOL/USD', value: 'SOLUSD' },
];
const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

export default function FVGPage() {
  const [pair, setPair] = React.useState(PAIRS[0].value);
  const [tf, setTf] = React.useState(TIMEFRAMES[0].value);
  const [minGap, setMinGap] = React.useState(1);
  const [tab, setTab] = React.useState<'chart' | 'table'>('chart');

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-4 py-8 max-w-7xl mx-auto font-sans"
      >
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-white">Fair Value Gap Engine</span>
        </nav>
        {/* Title & Hero */}
        <h1 className="text-3xl font-bold text-white mb-2">Fair Value Gap Engine</h1>
        <h2 className="text-lg font-medium text-neutral-300 mb-8 max-w-2xl">
          Identify and scan for Fair Value Gaps (FVGs) in crypto price action. FVGs are price imbalances that may signal future fills or reversals. Configure your scan and visualize results below.
        </h2>
        {/* 2-col layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Card */}
          <section className="bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold"><Settings className="w-5 h-5" /> Settings</div>
            <label className="flex flex-col gap-1 text-sm">
              Pair
              <select value={pair} onChange={e => setPair(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {PAIRS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Timeframe
              <select value={tf} onChange={e => setTf(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Min Gap %
              <input type="number" min={0.1} step={0.1} value={minGap} onChange={e => setMinGap(Number(e.target.value))} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </label>
            <button className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 rounded transition">Run Scan</button>
            {/* TODO: Wire up scan logic */}
          </section>
          {/* Chart & Table Tabs */}
          <section className="flex-1 w-full">
            <div className="flex gap-2 mb-4">
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-t-lg font-medium transition border-b-2 ${tab === 'chart' ? 'border-emerald-500 text-emerald-400 bg-neutral-900' : 'border-transparent text-neutral-400 bg-neutral-950 hover:text-emerald-400'}`}
                onClick={() => setTab('chart')}
              >
                <BarChart3 className="w-4 h-4" /> Chart
              </button>
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-t-lg font-medium transition border-b-2 ${tab === 'table' ? 'border-emerald-500 text-emerald-400 bg-neutral-900' : 'border-transparent text-neutral-400 bg-neutral-950 hover:text-emerald-400'}`}
                onClick={() => setTab('table')}
              >
                <Table2 className="w-4 h-4" /> Table
              </button>
            </div>
            <div className="bg-neutral-900 rounded-xl shadow-lg p-6 border border-neutral-800 min-h-[340px]">
              {tab === 'chart' ? (
                <motion.div
                  key="chart"
                  id="fvg-chart"
                  initial={{ x: 64, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-64 flex items-center justify-center text-neutral-500"
                >
                  {/* TODO: Render chart here */}
                  <span>Chart placeholder</span>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ x: -64, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="text-neutral-400 border-b border-neutral-800">
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Pair</th>
                          <th className="py-2 pr-4">Dir</th>
                          <th className="py-2 pr-4">Gap</th>
                          <th className="py-2 pr-4">Filled?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* TODO: Map real scan results here */}
                        <tr className="border-b border-neutral-800">
                          <td className="py-2 pr-4">--:--</td>
                          <td className="py-2 pr-4">BTC/USD</td>
                          <td className="py-2 pr-4">Up</td>
                          <td className="py-2 pr-4">1.2%</td>
                          <td className="py-2 pr-4">No</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">--:--</td>
                          <td className="py-2 pr-4">ETH/USD</td>
                          <td className="py-2 pr-4">Down</td>
                          <td className="py-2 pr-4">0.8%</td>
                          <td className="py-2 pr-4">Yes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </AppShell>
  );
} 