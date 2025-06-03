/**
 * BacktestingSandbox.tsx – Skeleton for backtesting UI
 * Three panes: params sidebar, main chart, results table. Run Backtest button with loading spinner. Dummy data. Back to Home button. Tailwind, Framer Motion.
 */

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Loader2 } from 'lucide-react';

const PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
const STRATEGIES = ['AlphaBot', 'Mean Revert', 'Breakout', 'Custom'];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' },
  }),
};

function BackToHomeButton() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full flex justify-start max-w-6xl mx-auto px-4 pt-6"
    >
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-emerald-400 font-medium shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <HomeIcon className="w-5 h-5" /> Back to Home
      </a>
    </motion.div>
  );
}

function ParamsSidebar({ params, setParams, onRun, loading }: any) {
  return (
    <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 p-6 flex flex-col gap-6 min-w-[220px]">
      <div>
        <label className="block text-neutral-400 text-xs mb-1">Date Range</label>
        <input
          type="date"
          value={params.start}
          onChange={e => setParams((p: any) => ({ ...p, start: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-white w-full mb-2"
        />
        <input
          type="date"
          value={params.end}
          onChange={e => setParams((p: any) => ({ ...p, end: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-white w-full"
        />
      </div>
      <div>
        <label className="block text-neutral-400 text-xs mb-1">Pair</label>
        <select
          value={params.pair}
          onChange={e => setParams((p: any) => ({ ...p, pair: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white w-full"
        >
          {PAIRS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-neutral-400 text-xs mb-1">Strategy</label>
        <select
          value={params.strategy}
          onChange={e => setParams((p: any) => ({ ...p, strategy: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white w-full"
        >
          {STRATEGIES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <button
        onClick={onRun}
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />} Run Backtest
      </button>
    </div>
  );
}

function ChartArea() {
  return (
    <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 flex items-center justify-center h-64 min-w-[320px]">
      <span className="text-neutral-500">[Chart Placeholder]</span>
    </div>
  );
}

function ResultsTable() {
  // Dummy data
  const rows = [
    { date: '2025-06-01', type: 'Buy', price: 67000, qty: 0.1, pnl: 120 },
    { date: '2025-06-02', type: 'Sell', price: 68000, qty: 0.1, pnl: 100 },
  ];
  return (
    <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 p-4 min-w-[320px]">
      <div className="font-semibold text-neutral-200 mb-2">Results</div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutral-400 border-b border-neutral-800">
            <th className="py-2 px-3 text-left">Date</th>
            <th className="py-2 px-3 text-left">Type</th>
            <th className="py-2 px-3 text-right">Price</th>
            <th className="py-2 px-3 text-right">Qty</th>
            <th className="py-2 px-3 text-right">PnL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-neutral-800 last:border-0">
              <td className="py-2 px-3">{r.date}</td>
              <td className="py-2 px-3">{r.type}</td>
              <td className="py-2 px-3 text-right">${r.price.toLocaleString('en-US')}</td>
              <td className="py-2 px-3 text-right">{r.qty}</td>
              <td className={`py-2 px-3 text-right ${r.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.pnl >= 0 ? '+' : ''}${r.pnl.toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BacktestingSandbox() {
  const [params, setParams] = React.useState({
    start: '2025-06-01',
    end: '2025-06-10',
    pair: PAIRS[0],
    strategy: STRATEGIES[0],
  });
  const [loading, setLoading] = React.useState(false);

  function handleRun() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <div className="bg-neutral-950 min-h-screen font-sans">
      <BackToHomeButton />
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 relative">
        <ParamsSidebar params={params} setParams={setParams} onRun={handleRun} loading={loading} />
        <div className="flex-1 flex flex-col gap-8">
          <ChartArea />
          <ResultsTable />
        </div>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center"
            >
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 