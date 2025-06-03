/**
 * ManagedAssets.tsx
 * TradeGPT – Managed Assets view.
 * Features: search/filter, responsive table, slide-over panel, Sync Now button, dark mode, Framer Motion.
 * All mock data. No backend.
 */

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, RefreshCw, X, BarChart3 } from 'lucide-react';

const mockAssets = [
  {
    id: 1,
    symbol: 'BTC',
    exchange: 'Binance',
    qty: 0.75,
    avgBuy: 42000,
    price: 67000,
    trades: [
      { date: '2025-06-01', type: 'Buy', qty: 0.5, price: 40000 },
      { date: '2025-06-03', type: 'Buy', qty: 0.25, price: 45000 },
    ],
  },
  {
    id: 2,
    symbol: 'ETH',
    exchange: 'Coinbase',
    qty: 10,
    avgBuy: 2500,
    price: 3120,
    trades: [
      { date: '2025-05-20', type: 'Buy', qty: 5, price: 2400 },
      { date: '2025-05-25', type: 'Buy', qty: 5, price: 2600 },
    ],
  },
  {
    id: 3,
    symbol: 'SOL',
    exchange: 'Kraken',
    qty: 100,
    avgBuy: 80,
    price: 160,
    trades: [
      { date: '2025-04-10', type: 'Buy', qty: 100, price: 80 },
    ],
  },
];

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
      className="w-full flex justify-start max-w-7xl mx-auto px-4 pt-6"
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

function SyncNowButton() {
  return (
    <button
      onClick={() => alert('Sync triggered (mock)!')}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <RefreshCw className="w-4 h-4 animate-spin-slow" /> Sync Now
    </button>
  );
}

function SearchBar({ filter, setFilter }: { filter: any; setFilter: (f: any) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center mb-6">
      <input
        type="text"
        placeholder="Search symbol..."
        value={filter.symbol}
        onChange={e => setFilter((f: any) => ({ ...f, symbol: e.target.value }))}
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <input
        type="text"
        placeholder="Filter by exchange..."
        value={filter.exchange}
        onChange={e => setFilter((f: any) => ({ ...f, exchange: e.target.value }))}
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}

function MiniPriceChart({ prices }: { prices: number[] }) {
  // Simple sparkline
  const w = 160, h = 48, pad = 8;
  const min = Math.min(...prices), max = Math.max(...prices);
  const points = prices.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (prices.length - 1);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    return [x, y];
  });
  return (
    <svg width={w} height={h} className="block">
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlideOver({ asset, onClose }: { asset: any; onClose: () => void }) {
  // Mock price history for chart
  const prices = Array.from({ length: 12 }, (_, i) => asset.price * (0.95 + 0.1 * Math.random()));
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-950 z-50 shadow-2xl border-l border-neutral-800 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> {asset.symbol} on {asset.exchange}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-emerald-400 transition"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <div className="text-xs text-neutral-400 mb-1">Mini Price Chart (mock)</div>
            <MiniPriceChart prices={prices} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-2">Trade History</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-800">
                  <th className="py-1 px-2 text-left">Date</th>
                  <th className="py-1 px-2 text-left">Type</th>
                  <th className="py-1 px-2 text-right">Qty</th>
                  <th className="py-1 px-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {asset.trades.map((t: any, i: number) => (
                  <tr key={i} className="border-b border-neutral-800 last:border-0">
                    <td className="py-1 px-2">{t.date}</td>
                    <td className="py-1 px-2">{t.type}</td>
                    <td className="py-1 px-2 text-right">{t.qty}</td>
                    <td className="py-1 px-2 text-right">${t.price.toLocaleString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ManagedAssetsTable({ assets, onRowClick }: { assets: any[]; onRowClick: (a: any) => void }) {
  const totalValue = assets.reduce((sum, a) => sum + a.qty * a.price, 0);
  return (
    <div className="w-full bg-neutral-900 rounded-2xl shadow-lg p-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutral-400 border-b border-neutral-800">
            <th className="py-2 px-3 text-left">Asset</th>
            <th className="py-2 px-3 text-left">Exchange</th>
            <th className="py-2 px-3 text-right">Qty</th>
            <th className="py-2 px-3 text-right">Avg Buy</th>
            <th className="py-2 px-3 text-right">Unrealized P/L</th>
            <th className="py-2 px-3 text-right">% of Portfolio</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, i) => {
            const value = a.qty * a.price;
            const pct = totalValue ? (value / totalValue) * 100 : 0;
            const unrealized = (a.price - a.avgBuy) * a.qty;
            return (
              <motion.tr
                key={a.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800 cursor-pointer transition"
                onClick={() => onRowClick(a)}
              >
                <td className="py-2 px-3 font-semibold text-white">{a.symbol}</td>
                <td className="py-2 px-3 text-neutral-300">{a.exchange}</td>
                <td className="py-2 px-3 text-right text-neutral-200">{a.qty}</td>
                <td className="py-2 px-3 text-right text-neutral-200">${a.avgBuy.toLocaleString('en-US')}</td>
                <td className={`py-2 px-3 text-right ${unrealized >= 0 ? 'text-green-400' : 'text-red-400'}`}>{unrealized >= 0 ? '+' : ''}${unrealized.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-3 text-right text-neutral-400">{pct.toFixed(1)}%</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs text-neutral-500 mt-2">Mock data for illustration</div>
    </div>
  );
}

export default function ManagedAssets() {
  const [assets] = React.useState(mockAssets);
  const [filter, setFilter] = React.useState({ symbol: '', exchange: '' });
  const [selected, setSelected] = React.useState<any>(null);

  const filtered = assets.filter(a =>
    (!filter.symbol || a.symbol.toLowerCase().includes(filter.symbol.toLowerCase())) &&
    (!filter.exchange || a.exchange.toLowerCase().includes(filter.exchange.toLowerCase()))
  );

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen font-sans">
      <BackToHomeButton />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-white"
          >
            Managed Assets
          </motion.h1>
          <SyncNowButton />
        </div>
        <SearchBar filter={filter} setFilter={setFilter} />
        <ManagedAssetsTable assets={filtered} onRowClick={setSelected} />
      </div>
      <AnimatePresence>
        {selected && <SlideOver asset={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
} 