/**
 * AppShell.tsx – Layout wrapper for TradeGPT
 * Sidebar nav (collapsible, icons+labels), top bar (dark toggle, settings, avatar), watchlist panel, outlet for children. OpenAI dark, Tailwind, Framer Motion.
 */

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Zap, Bell, Activity, Settings, User, Menu, X, Home as HomeIcon, BookOpen, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import WatchlistPanel from './components/WatchlistPanel';

const NAV = [
  { href: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Home' },
  { href: '/portfolio-performance', icon: <BarChart3 className="w-5 h-5" />, label: 'Portfolio' },
  { href: '/managed-assets', icon: <BarChart3 className="w-5 h-5" />, label: 'Assets' },
  { href: '/order-block-radar', icon: <BookOpen className="w-5 h-5" />, label: 'Order Block Radar' },
  { href: '/liquidity-sniper', icon: <Zap className="w-5 h-5" />, label: 'Liquidity Sniper' },
  { href: '/risk-overseer', icon: <ShieldCheck className="w-5 h-5" />, label: 'Risk AI Overseer' },
  { href: '/signal-center', icon: <Zap className="w-5 h-5" />, label: 'Signals' },
  { href: '/alerts-settings', icon: <Bell className="w-5 h-5" />, label: 'Alerts' },
  { href: '/trade-journal', icon: <Activity className="w-5 h-5" />, label: 'Journal' },
  { href: '/backtesting-sandbox', icon: <BarChart3 className="w-5 h-5" />, label: 'Backtest' },
];

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -220 }}
          animate={{ x: 0 }}
          exit={{ x: -220 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed z-40 top-0 left-0 h-full w-56 bg-neutral-950 border-r border-neutral-900 flex flex-col py-6 px-3 shadow-lg"
        >
          <div className="flex items-center justify-between mb-8 px-1">
            <span className="font-bold text-xl tracking-tight text-white">TradeGPT</span>
            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-emerald-400"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:text-emerald-400 hover:bg-neutral-900 transition font-medium">
                {item.icon} <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const [dark, setDark] = React.useState(true);
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur border-b border-neutral-900 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <button className="md:hidden text-neutral-400 hover:text-emerald-400" onClick={onMenu}><Menu className="w-6 h-6" /></button>
        <span className="hidden md:inline font-bold text-xl tracking-tight text-white">TradeGPT</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDark(d => !d)}
          className="text-neutral-400 hover:text-emerald-400"
          title="Toggle dark mode"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-12.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 4.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </button>
        <Link href="/settings/api-keys" className="text-neutral-400 hover:text-emerald-400" title="API Settings"><Settings className="w-6 h-6" /></Link>
        <button className="text-neutral-400 hover:text-emerald-400"><User className="w-6 h-6" /></button>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebar, setSidebar] = React.useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Sidebar open={sidebar} setOpen={setSidebar} />
      <WatchlistPanel />
      <div className="md:pl-56 flex flex-col min-h-screen">
        <TopBar onMenu={() => setSidebar(true)} />
        <main className="flex-1 flex flex-col md:ml-[260px]">{children}</main>
      </div>
    </div>
  );
} 