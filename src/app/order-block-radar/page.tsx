// /app/order-block-radar/page.tsx
// Order Block Radar – placeholder UI, pure front-end
// TODO: Wire up real data, connect chart/modal logic

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen } from 'lucide-react';
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

const MOCK_OBS = [
  { id: 1, pair: 'BTC/USD', tf: '1h', dir: 'bullish', zone: '67,200 – 67,500', strength: 92 },
  { id: 2, pair: 'ETH/USD', tf: '4h', dir: 'bearish', zone: '3,180 – 3,120', strength: 81 },
  { id: 3, pair: 'SOL/USD', tf: '1d', dir: 'bullish', zone: '155 – 162', strength: 77 },
  { id: 4, pair: 'BTC/USD', tf: '5m', dir: 'bearish', zone: '67,400 – 67,300', strength: 68 },
  { id: 5, pair: 'ETH/USD', tf: '1h', dir: 'bullish', zone: '3,100 – 3,140', strength: 59 },
  { id: 6, pair: 'SOL/USD', tf: '4h', dir: 'bearish', zone: '158 – 153', strength: 54 },
];

const fadeStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
    },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function OrderBlockRadarPage() {
  const [pair, setPair] = React.useState(PAIRS[0].value);
  const [tf, setTf] = React.useState(TIMEFRAMES[0].value);
  const [strongOnly, setStrongOnly] = React.useState(false);
  const [modal, setModal] = React.useState<null | typeof MOCK_OBS[0]>(null);

  // Filtered OBs (mock logic)
  const obs = MOCK_OBS.filter(
    ob =>
      (pair ? ob.pair === PAIRS.find(p => p.value === pair)?.label : true) &&
      (tf ? ob.tf === tf : true) &&
      (!strongOnly || ob.strength >= 75)
  );

  return (
    <AppShell>
      <div className="px-4 py-8 max-w-7xl mx-auto font-sans">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-white">Order Block Radar</span>
        </nav>
        <h1 className="text-3xl font-bold text-white mb-6">Order Block Radar</h1>
        {/* Sticky Filter Bar */}
        <div className="sticky top-4 z-10 mb-8">
          <div className="flex flex-col md:flex-row gap-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-4 items-center">
            <label className="flex flex-col text-sm text-neutral-300">
              Pair
              <select value={pair} onChange={e => setPair(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {PAIRS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-neutral-300">
              Timeframe
              <select value={tf} onChange={e => setTf(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={strongOnly} onChange={e => setStrongOnly(e.target.checked)} className="accent-emerald-500 w-5 h-5" />
              Show Only Strong OBs
            </label>
          </div>
        </div>
        {/* Results Grid */}
        <motion.div
          variants={fadeStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {obs.map(ob => (
            <motion.div
              key={ob.id}
              variants={fadeUp}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6 flex flex-col gap-3 cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-transform relative group"
              onClick={() => setModal(ob)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${ob.pair} ${ob.tf}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={`w-5 h-5 ${ob.dir === 'bullish' ? 'text-emerald-400' : 'text-red-400'}`} />
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ob.dir === 'bullish' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>{ob.dir.charAt(0).toUpperCase() + ob.dir.slice(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{ob.pair}</span>
                <span className="text-neutral-400 text-sm">{ob.tf}</span>
              </div>
              <div className="text-neutral-300 text-sm mb-1">Zone: <span className="font-mono text-white">{ob.zone}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-xs">Strength</span>
                <span className="font-mono text-emerald-400 text-base">{ob.strength}%</span>
              </div>
              {/* TODO: Add more OB details here */}
            </motion.div>
          ))}
        </motion.div>
        {/* Modal */}
        <AnimatePresence>
          {modal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setModal(null)} className="absolute top-3 right-3 text-neutral-400 hover:text-emerald-400 text-xl">×</button>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className={`w-5 h-5 ${modal.dir === 'bullish' ? 'text-emerald-400' : 'text-red-400'}`} />
                  <span className="text-white font-bold text-lg">{modal.pair} <span className="text-neutral-400 text-base">{modal.tf}</span></span>
                </div>
                <div className="mb-4 text-neutral-300">Zone: <span className="font-mono text-white">{modal.zone}</span></div>
                <div className="mb-6 flex items-center gap-2"><span className="text-neutral-400 text-xs">Strength</span><span className="font-mono text-emerald-400 text-base">{modal.strength}%</span></div>
                <div className="h-48 flex items-center justify-center text-neutral-500 border border-dashed border-neutral-700 rounded-xl bg-neutral-900">
                  {/* TODO: Render OB chart here */}
                  <span>Chart placeholder</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
} 