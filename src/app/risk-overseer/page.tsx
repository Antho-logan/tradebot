// /app/risk-overseer/page.tsx
// Risk AI Overseer – placeholder UI, pure front-end
// TODO: Wire up real risk engine, alerts, and backend

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, SlidersHorizontal, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import AppShell from '../AppShell';

const OVERVIEW = [
  { label: 'Daily Drawdown %', value: '-1.8%', accent: 'text-red-400' },
  { label: 'Max Open Exposure', value: '32%', accent: 'text-emerald-400' },
  { label: 'Active SLs', value: '3', accent: 'text-emerald-400' },
];

const ACCORDION = [
  { key: 'risk', label: 'Per-Trade Risk %', min: 0.25, max: 3, step: 0.05, type: 'slider', field: 'perTradeRisk' },
  { key: 'cap', label: 'Daily Loss Cap %', min: 1, max: 10, step: 0.1, type: 'slider', field: 'dailyLossCap' },
  { key: 'maxtrades', label: 'Max Concurrent Trades', min: 1, max: 20, step: 1, type: 'input', field: 'maxTrades' },
  { key: 'news', label: 'News Blackout', type: 'toggle', field: 'newsBlackout' },
];

const DEFAULTS = {
  perTradeRisk: 1,
  dailyLossCap: 5,
  maxTrades: 5,
  newsBlackout: false,
  riskMode: 'dry' as 'dry' | 'live',
};

const fadeAccordion = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};
const fadeToast = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function RiskOverseerPage() {
  const [settings, setSettings] = React.useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('riskSettings');
        return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS;
      } catch { return DEFAULTS; }
    }
    return DEFAULTS;
  });
  const [open, setOpen] = React.useState<string | null>('risk');
  const [toast, setToast] = React.useState(false);

  // Save to localStorage
  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('riskSettings', JSON.stringify(settings));
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-8 max-w-5xl mx-auto font-sans">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-white">Risk AI Overseer</span>
        </nav>
        <h1 className="text-3xl font-bold text-white mb-6">Risk AI Overseer</h1>
        {/* Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {OVERVIEW.map((o, i) => (
            <div key={o.label} className="bg-neutral-900 border border-neutral-800 rounded-xl shadow p-5 flex flex-col items-center gap-2">
              <ShieldCheck className={`w-6 h-6 ${o.accent}`} />
              <div className="text-2xl font-bold text-white">{o.value}</div>
              <div className="text-xs text-neutral-400">{o.label}</div>
            </div>
          ))}
          {/* Risk Mode Toggle */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow p-5 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {settings.riskMode === 'live' ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-neutral-400" />}
              <span className="text-xs text-neutral-400">Risk Mode</span>
            </div>
            <button
              className={`mt-2 px-4 py-1 rounded-full font-bold text-sm ${settings.riskMode === 'live' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'}`}
              onClick={() => setSettings(s => ({ ...s, riskMode: s.riskMode === 'live' ? 'dry' : 'live' }))}
            >
              {settings.riskMode === 'live' ? 'Live' : 'Dry-Run'}
            </button>
          </div>
        </div>
        {/* Accordion */}
        <div className="mb-8">
          {ACCORDION.map(a => (
            <div key={a.key} className="mb-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold focus:outline-none"
                onClick={() => setOpen(open === a.key ? null : a.key)}
              >
                <span className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-emerald-400" />{a.label}</span>
                <span>{open === a.key ? '-' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {open === a.key && (
                  <motion.div
                    key={a.key}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeAccordion}
                    className="px-5 pb-5"
                  >
                    {a.type === 'slider' && (
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={a.min}
                          max={a.max}
                          step={a.step}
                          value={settings[a.field]}
                          onChange={e => setSettings(s => ({ ...s, [a.field]: +e.target.value }))}
                          className="accent-emerald-500 w-48"
                        />
                        <span className="font-mono text-emerald-400">{settings[a.field]}</span>
                      </div>
                    )}
                    {a.type === 'input' && (
                      <input
                        type="number"
                        min={a.min}
                        max={a.max}
                        step={a.step}
                        value={settings[a.field]}
                        onChange={e => setSettings(s => ({ ...s, [a.field]: +e.target.value }))}
                        className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32"
                      />
                    )}
                    {a.type === 'toggle' && (
                      <button
                        className={`mt-2 px-4 py-1 rounded-full font-bold text-sm ${settings[a.field] ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'}`}
                        onClick={() => setSettings(s => ({ ...s, [a.field]: !s[a.field] }))}
                      >
                        {settings[a.field] ? 'Enabled' : 'Disabled'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <button
          className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 px-6 rounded transition mb-8"
          onClick={save}
        >
          Save Settings
        </button>
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeToast}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 border border-emerald-500 text-emerald-400 px-6 py-3 rounded-xl shadow-lg z-50 font-semibold"
            >
              Settings saved
            </motion.div>
          )}
        </AnimatePresence>
        {/* Triggered Risk Alerts Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow p-6 mt-8">
          <div className="flex items-center gap-2 mb-4 text-neutral-400 font-semibold text-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Triggered Risk Alerts
          </div>
          <div className="text-neutral-500 text-sm">No alerts triggered yet.</div>
          {/* TODO: Wire up real alerts table */}
        </div>
      </div>
    </AppShell>
  );
} 