/**
 * PortfolioPerformance.tsx
 * TradeGPT – Portfolio performance dashboard.
 * Features: sticky nav, animated equity chart, KPIs, period toggle, history table.
 * All mock data. Dark mode, OpenAI style, Tailwind, Framer Motion.
 */

'use client';
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, TrendingUp, Calendar, BarChart3, Home as HomeIcon } from "lucide-react";

// --- Mock Data ---
const periods = [
  { label: "All Time", key: "all" },
  { label: "30d", key: "30d" },
  { label: "7d", key: "7d" },
  { label: "24h", key: "24h" },
];

const mockEquityCurves = {
  all: [10000, 12000, 15000, 14000, 17000, 20000, 22000, 21000, 25000],
  "30d": [20000, 21000, 22000, 21000, 25000],
  "7d": [21000, 22000, 21000, 25000],
  "24h": [24000, 25000],
};

const mockKPIs = {
  all: { pnl24h: "+$1,000", pnl30d: "+$5,000", maxDD: "-8.2%", sharpe: "1.42" },
  "30d": { pnl24h: "+$400", pnl30d: "+$5,000", maxDD: "-4.1%", sharpe: "1.21" },
  "7d": { pnl24h: "+$200", pnl30d: "+$1,200", maxDD: "-2.2%", sharpe: "1.09" },
  "24h": { pnl24h: "+$100", pnl30d: "+$100", maxDD: "-0.5%", sharpe: "0.98" },
};

const mockTable = [
  { date: "2025-06-01", start: "$24,000", dep: "$0", wd: "$0", pnl: "+$1,000", end: "$25,000" },
  { date: "2025-05-31", start: "$23,000", dep: "$0", wd: "$0", pnl: "+$1,000", end: "$24,000" },
  { date: "2025-05-30", start: "$22,000", dep: "$0", wd: "$0", pnl: "+$1,000", end: "$23,000" },
  { date: "2025-05-29", start: "$21,000", dep: "$0", wd: "$0", pnl: "+$1,000", end: "$22,000" },
  { date: "2025-05-28", start: "$20,000", dep: "$0", wd: "$0", pnl: "+$1,000", end: "$21,000" },
];

// --- Animation ---
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" }
  })
};

// --- Components ---
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

function StickyNav() {
  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex items-center gap-1 text-neutral-200 hover:text-emerald-400 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </a>
        </div>
        <a href="#" className="flex items-center gap-1 text-neutral-200 hover:text-emerald-400 transition">
          <Wallet className="w-4 h-4" /> Managed Assets
        </a>
      </div>
    </nav>
  );
}

function PeriodToggle({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
            ${value === p.key
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400"
              : "bg-neutral-900 text-neutral-300 border border-transparent hover:border-neutral-700"}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function EquityChart({ data }: { data: number[] }) {
  // Simple SVG line chart (mock, no axis)
  const w = 700, h = 180, pad = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const points = data.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (data.length - 1);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    return [x, y];
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full bg-neutral-900 rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="w-full overflow-x-auto">
        <svg width={w} height={h} className="block mx-auto">
          <defs>
            <linearGradient id="equity-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polygon
            points={
              `${points.map(([x, y]) => `${x},${y}`).join(" ")} ` +
              `${points[points.length - 1][0]},${h - pad} ${points[0][0]},${h - pad}`
            }
            fill="url(#equity-gradient)"
          />
          {/* Line */}
          <polyline
            points={points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center text-neutral-400 text-xs mt-2">Total Equity Curve (mock data)</div>
    </motion.div>
  );
}

function KPICards({ kpi }: { kpi: typeof mockKPIs["all"] }) {
  const items = [
    { icon: <TrendingUp className="w-5 h-5" />, label: "24h PnL", value: kpi.pnl24h },
    { icon: <Calendar className="w-5 h-5" />, label: "30d PnL", value: kpi.pnl30d },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Max DD", value: kpi.maxDD },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Sharpe", value: kpi.sharpe },
  ];
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center shadow"
        >
          <div className="mb-2 text-emerald-400">{item.icon}</div>
          <div className="text-lg font-bold text-white">{item.value}</div>
          <div className="text-xs text-neutral-400">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function HistoryTable({ rows }: { rows: typeof mockTable }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full bg-neutral-900 rounded-2xl shadow-lg p-4 overflow-x-auto"
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutral-400 border-b border-neutral-800">
            <th className="py-2 px-3 text-left">Date</th>
            <th className="py-2 px-3 text-right">Starting Bal</th>
            <th className="py-2 px-3 text-right">Deposits</th>
            <th className="py-2 px-3 text-right">Withdrawals</th>
            <th className="py-2 px-3 text-right">PnL</th>
            <th className="py-2 px-3 text-right">End Bal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-neutral-800 last:border-0">
              <td className="py-2 px-3">{r.date}</td>
              <td className="py-2 px-3 text-right">{r.start}</td>
              <td className="py-2 px-3 text-right">{r.dep}</td>
              <td className="py-2 px-3 text-right">{r.wd}</td>
              <td className={`py-2 px-3 text-right ${r.pnl.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{r.pnl}</td>
              <td className="py-2 px-3 text-right">{r.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-neutral-500 mt-2">Mock data for illustration</div>
    </motion.div>
  );
}

// --- Main Page ---
export default function PortfolioPerformance() {
  const [period, setPeriod] = React.useState("all");
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen font-sans">
      <BackToHomeButton />
      <StickyNav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-extrabold text-white mb-2"
        >
          Portfolio Performance
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-neutral-400 mb-8"
        >
          Track your total equity, risk, and returns across all connected accounts.
        </motion.p>
        <PeriodToggle value={period} onChange={setPeriod} />
        <EquityChart data={mockEquityCurves[period as keyof typeof mockEquityCurves]} />
        <KPICards kpi={mockKPIs[period as keyof typeof mockKPIs]} />
        <HistoryTable rows={mockTable} />
      </main>
    </div>
  );
} 