/**
 * Signal Center – Real-time feed for TradeGPT
 * Features: vertical timeline, filter chips, color-coded border, auto-scroll (pause on hover), mock websocket, dark mode, Tailwind, Framer Motion.
 */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Zap, BookOpen, Radar } from 'lucide-react';

const PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h'];
const SIGNALS = [
  { key: 'fvg', label: 'FVG', icon: <Radar className="w-4 h-4" /> },
  { key: 'ob', label: 'OB', icon: <BookOpen className="w-4 h-4" /> },
];
const BIAS = ['long', 'short'];

function randomSignal() {
  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const timeframe = TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)];
  const tags = SIGNALS.filter(() => Math.random() > 0.5).map(s => s.key);
  if (tags.length === 0) tags.push('fvg');
  const confidence = Math.floor(60 + Math.random() * 40);
  const bias = BIAS[Math.floor(Math.random() * 2)];
  return {
    id: Math.random().toString(36).slice(2),
    pair,
    timeframe,
    tags,
    confidence,
    bias,
    timestamp: new Date().toISOString(),
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.5, ease: 'easeOut' },
  }),
};

const ALL_FILTERS = [
  { key: 'long', label: 'Long Bias', color: 'emerald' },
  { key: 'short', label: 'Short Bias', color: 'red' },
  ...SIGNALS.map(s => ({ key: s.key, label: s.label, color: 'sky' })),
];

function BackToHomeButton() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full flex justify-start max-w-3xl mx-auto px-4 pt-6"
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

function FilterChips({ filters, setFilters }: { filters: string[]; setFilters: (f: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 px-4 max-w-3xl mx-auto">
      {ALL_FILTERS.map(f => {
        const active = filters.includes(f.key);
        return (
          <button
            key={f.key}
            onClick={() => setFilters(filters => active ? filters.filter(k => k !== f.key) : [...filters, f.key])}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition
              ${active ? `bg-${f.color}-500/20 text-${f.color}-400 border-${f.color}-400` : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'}`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function SignalItem({ s, i }: { s: any; i: number }) {
  const border = s.bias === 'long' ? 'border-emerald-500' : 'border-red-500';
  const biasColor = s.bias === 'long' ? 'text-emerald-400' : 'text-red-400';
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={i}
      className={`flex items-start gap-4 bg-neutral-900 rounded-xl shadow p-4 border-l-4 ${border}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-white text-sm">{s.pair}</span>
          <span className="text-xs text-neutral-400">{s.timeframe}</span>
          <span className={`text-xs font-bold uppercase ${biasColor}`}>{s.bias}</span>
        </div>
        <div className="flex gap-2 mb-1">
          {s.tags.map((tag: string) => {
            const sig = SIGNALS.find(x => x.key === tag);
            return sig ? (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-800/40 text-sky-300 text-xs font-mono">
                {sig.icon} {sig.label}
              </span>
            ) : null;
          })}
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>Confidence: <span className="text-white font-bold">{s.confidence}%</span></span>
          <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SignalCenter() {
  const [signals, setSignals] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<string[]>([]);
  const [hover, setHover] = React.useState(false);
  const feedRef = React.useRef<HTMLDivElement>(null);

  // Mock websocket: push new signal every 5s
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSignals(sigs => [randomSignal(), ...sigs.slice(0, 49)]);
    }, 5000);
    // Add initial signals
    setSignals(Array.from({ length: 10 }, randomSignal));
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to top unless hovered
  React.useEffect(() => {
    if (!hover && feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [signals, hover]);

  const filtered = signals.filter(s => {
    if (filters.length === 0) return true;
    return (
      (filters.includes('long') && s.bias === 'long') ||
      (filters.includes('short') && s.bias === 'short') ||
      SIGNALS.some(sig => filters.includes(sig.key) && s.tags.includes(sig.key))
    );
  });

  return (
    <div className="bg-neutral-950 min-h-screen font-sans">
      <BackToHomeButton />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-extrabold text-white mb-2"
        >
          Signal Center
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-neutral-400 mb-6"
        >
          Real-time feed of AI-generated trading signals.
        </motion.p>
        <FilterChips filters={filters} setFilters={setFilters} />
        <div
          ref={feedRef}
          className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {filtered.length === 0 ? (
            <div className="text-neutral-500 text-center py-12">No signals match your filters.</div>
          ) : (
            filtered.map((s, i) => <SignalItem key={s.id} s={s} i={i} />)
          )}
        </div>
      </div>
    </div>
  );
} 