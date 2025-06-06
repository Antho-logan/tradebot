'use client';
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3, ShieldCheck, Zap, BookOpen, Radar, Activity, Github, Bell, Paperclip, Send, TrendingUp, TrendingDown, DollarSign, Target, Brain
} from "lucide-react";
import { useStrategyBuilderModal } from './StrategyBuilderModal';
import GlobalPnLWidget from "./GlobalPnLWidget";
import AskAIChat from "./components/AskAIChat";
import WatchlistPanel from "./components/WatchlistPanel";
import CVDChart from "./components/CVDChart";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800/50">
              <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">TradeGPT</span>
        </motion.div>
        <div className="flex items-center gap-3">
          <motion.a 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            href="/settings/api-keys" 
            className="flex items-center gap-2 text-neutral-300 hover:text-emerald-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-neutral-800/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </motion.a>
          <motion.a 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            href="https://github.com/" 
            target="_blank" 
            rel="noopener" 
            className="flex items-center gap-2 text-neutral-300 hover:text-emerald-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-neutral-800/50"
          >
            <Github className="w-4 h-4" aria-hidden /> 
            <span className="hidden sm:inline">GitHub</span>
          </motion.a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full pt-20 pb-16 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900"
    >
              <div className="max-w-6xl mx-auto px-6">
          {/* Main Hero Content */}
        <div className="text-center mb-16">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              AI-Powered Trading Dashboard
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
          >
            Your Trading
            <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Command Center
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeUp}
            className="text-xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced AI-driven tools for smart-money crypto trading. Monitor, analyze, and execute with institutional-grade precision.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105">
              Start Trading Now
            </button>
            <button className="px-8 py-4 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-700 transition-all duration-300 border border-neutral-700 hover:border-neutral-600">
              Paper Trading
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div 
          variants={fadeUp}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl shadow-2xl border border-neutral-700 overflow-hidden">
            {/* Mock Dashboard Header */}
            <div className="bg-neutral-800/50 border-b border-neutral-700 p-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-neutral-400 text-sm">Live Trading Interface</span>
            </div>
            
            {/* Mock Dashboard Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-medium">Portfolio</span>
                  </div>
                  <div className="text-2xl font-bold text-white">$127,450</div>
                  <div className="text-emerald-400 text-sm">+12.4% today</div>
                </div>
                
                <div className="bg-neutral-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Active Trades</span>
                  </div>
                  <div className="text-2xl font-bold text-white">8</div>
                  <div className="text-blue-400 text-sm">3 pending</div>
                </div>
                
                <div className="bg-neutral-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Today's P&L</span>
                  </div>
                  <div className="text-2xl font-bold text-white">+$2,847</div>
                  <div className="text-yellow-400 text-sm">+2.3%</div>
                </div>
              </div>
              
              {/* Mock Chart Area */}
              <div className="bg-neutral-800/50 rounded-xl p-6 h-48 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/30 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-neutral-400 text-lg font-medium">Live Trading Chart</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            Live Data
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            AI Powered
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function PnLSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-16 bg-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Portfolio Dashboard</h2>
          <p className="text-neutral-300">Monitor your performance and execute trades with precision</p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* P&L Widget */}
          <div className="flex-shrink-0">
            <motion.div
              variants={fadeUp}
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Live Portfolio</h3>
                <p className="text-neutral-400">Real-time performance tracking</p>
              </div>
              <GlobalPnLWidget />
            </motion.div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            <motion.button
              variants={fadeUp}
              className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
            >
              Execute New Trade
            </motion.button>
            <motion.button
              variants={fadeUp}
              className="w-full px-6 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all duration-300 border border-neutral-700 hover:border-neutral-600"
            >
              View Full Portfolio
            </motion.button>
            <motion.button
              variants={fadeUp}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Risk Analysis
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StatsStrip() {
  const stats = [
    { label: "Connected Exchanges", value: "3", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Avg. Monthly ROI", value: "8.4%", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Active Strategies", value: "5", icon: <Target className="w-5 h-5" /> },
    { label: "Win Rate", value: "73%", icon: <ShieldCheck className="w-5 h-5" /> }
  ];
  
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-16 bg-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 
          variants={fadeUp}
          className="text-3xl font-bold text-white text-center mb-12"
        >
          Your Trading Performance
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              className="bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-2xl p-6 text-center hover:bg-neutral-800/70 transition-all duration-300 hover:scale-105"
            >
              <div className="flex justify-center mb-3 text-emerald-400">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-neutral-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  category: 'analysis' | 'trading' | 'management' | 'tools';
  featured?: boolean;
};

const features: Feature[] = [
  {
    icon: <BarChart3 className="w-7 h-7 text-emerald-400" aria-label="Portfolio Performance" />,
    title: "Portfolio Performance",
    desc: "Track your total equity, risk, and returns across all connected accounts.",
    href: "/portfolio-performance",
    category: 'management',
    featured: true
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-blue-400" aria-label="Managed Assets" />,
    title: "Managed Assets",
    desc: "View, filter, and analyze your assets across exchanges.",
    href: "/managed-assets",
    category: 'management'
  },
  {
    icon: <Radar className="w-7 h-7 text-purple-400" aria-label="Fair Value Gap Engine" />,
    title: "Fair Value Gap Engine",
    desc: "Finds price imbalances for my favorite pairs.",
    href: "/fvg",
    category: 'analysis',
    featured: true
  },
  {
    icon: <BookOpen className="w-7 h-7 text-orange-400" aria-label="Order Block Radar" />,
    title: "Order Block Radar",
    desc: "Tracks institutional order blocks in my watchlist.",
    href: "/order-block-radar",
    category: 'analysis'
  },
  {
    icon: <Zap className="w-7 h-7 text-yellow-400" aria-label="Liquidity Sniper" />,
    title: "Liquidity Sniper",
    desc: "Pinpoints liquidity pools and sweep zones.",
    href: "/liquidity-sniper",
    category: 'trading',
    featured: true
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-red-400" aria-label="Risk AI Overseer" />,
    title: "Risk AI Overseer",
    desc: "Monitors risk and auto-adjusts my position sizing.",
    href: "/risk-overseer",
    category: 'management',
    featured: true
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-emerald-400" aria-label="Back-testing Sandbox" />,
    title: "Back-testing Sandbox",
    desc: "Test my strategies on historical data.",
    href: "/backtesting-sandbox",
    category: 'tools'
  },
  {
    icon: <Activity className="w-7 h-7 text-green-400" aria-label="Trade Journal" />,
    title: "Trade Journal",
    desc: "Read and review your journal entries.",
    href: "/trade-journal",
    category: 'tools'
  }
];

function FeatureGrid({ openStrategyModal }: { openStrategyModal: () => void }) {
  const featuresWithStrategy: Feature[] = [
    ...features,
    {
      icon: <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
      title: "Build New Strategy",
      desc: "Create and customize a trading strategy.",
      onClick: openStrategyModal,
      category: 'tools',
      featured: true
    },
    {
      icon: <Zap className="w-7 h-7 text-cyan-400" aria-label="Signal Center" />,
      title: "Signal Center",
      desc: "Live feed of AI trading signals.",
      href: "/signal-center",
      category: 'trading'
    },
    {
      icon: <Bell className="w-7 h-7 text-pink-400" aria-label="Alert Settings" />,
      title: "Alert Settings",
      desc: "Manage your notification preferences.",
      href: "/alerts-settings",
      category: 'tools'
    }
  ];

  const categories = {
    analysis: { name: 'Market Analysis', color: 'from-purple-500 to-purple-600' },
    trading: { name: 'Trading Tools', color: 'from-blue-500 to-blue-600' },
    management: { name: 'Portfolio Management', color: 'from-emerald-500 to-emerald-600' },
    tools: { name: 'Utilities & Tools', color: 'from-orange-500 to-orange-600' }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-20 bg-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Complete Trading Arsenal
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Everything you need to trade like a professional, powered by advanced AI and institutional-grade tools.
          </p>
        </motion.div>

        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryFeatures = featuresWithStrategy.filter(f => f.category === categoryKey);
          if (categoryFeatures.length === 0) return null;

          return (
            <motion.div key={categoryKey} variants={fadeUp} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 bg-gradient-to-b ${categoryInfo.color} rounded-full`}></div>
                <h3 className="text-2xl font-bold text-white">{categoryInfo.name}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryFeatures.map((feature, i) => (
                  feature.href ? (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      className={`group relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                        feature.featured 
                          ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                          : 'bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800/70'
                      }`}
                    >
                      {feature.featured && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </div>
                      )}
                      <div className="mb-4">{feature.icon}</div>
                      <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
                    </Link>
                  ) : (
                    <motion.div
                      key={feature.title}
                      className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        feature.featured 
                          ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                          : 'bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800/70'
                      }`}
                      onClick={feature.onClick}
                    >
                      {feature.featured && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </div>
                      )}
                      <div className="mb-4">{feature.icon}</div>
                      <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
                    </motion.div>
                  )
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function TradeJournalInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = React.useState('');
  const [setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  
  // Trading fields
  const [tradeType, setTradeType] = React.useState<'Long' | 'Short'>('Long');
  const [pair, setPair] = React.useState('BTC/USD');
  const [entryPrice, setEntryPrice] = React.useState('');
  const [stopLoss, setStopLoss] = React.useState('');
  const [takeProfit1, setTakeProfit1] = React.useState('');
  const [takeProfit2, setTakeProfit2] = React.useState('');
  const [positionSize, setPositionSize] = React.useState('');
  const [leverage, setLeverage] = React.useState('1');
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate risk/reward ratios with position size and leverage
  const calculateRiskReward = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp1 = parseFloat(takeProfit1);
    const tp2 = parseFloat(takeProfit2);
    const position = parseFloat(positionSize);
    const lev = parseFloat(leverage);
    
    if (!entry || !sl || !position) return null;
    
    // Calculate actual position value with leverage
    const totalPositionValue = position * lev;
    
    // Calculate price differences as percentages
    const riskPercentage = Math.abs(tradeType === 'Long' ? (sl - entry) / entry : (entry - sl) / entry);
    const reward1Percentage = tp1 ? Math.abs(tradeType === 'Long' ? (tp1 - entry) / entry : (entry - tp1) / entry) : 0;
    const reward2Percentage = tp2 ? Math.abs(tradeType === 'Long' ? (tp2 - entry) / entry : (entry - tp2) / entry) : 0;
    
    // Calculate actual dollar amounts
    const riskAmount = totalPositionValue * riskPercentage;
    const reward1Amount = totalPositionValue * reward1Percentage;
    const reward2Amount = totalPositionValue * reward2Percentage;
    
    return {
      riskAmount,
      reward1Amount,
      reward2Amount,
      riskPercentage: (riskPercentage * 100).toFixed(2),
      reward1Percentage: (reward1Percentage * 100).toFixed(2),
      reward2Percentage: (reward2Percentage * 100).toFixed(2),
      rr1: reward1Amount > 0 ? (reward1Amount / riskAmount).toFixed(2) : null,
      rr2: reward2Amount > 0 ? (reward2Amount / riskAmount).toFixed(2) : null,
      totalPositionValue
    };
  };

  const riskReward = calculateRiskReward();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      // Save trade to localStorage
      const trade = {
        id: Date.now().toString(),
        entry: value,
        image: imagePreview,
        timestamp: new Date().toISOString(),
        pair: pair,
        type: tradeType,
        status: 'Open',
        entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit1: takeProfit1 ? parseFloat(takeProfit1) : undefined,
        takeProfit2: takeProfit2 ? parseFloat(takeProfit2) : undefined,
        positionSize: positionSize ? parseFloat(positionSize) : undefined,
        leverage: leverage ? parseFloat(leverage) : 1,
        riskReward: riskReward
      };
      
      const existingTrades = JSON.parse(localStorage.getItem('tradegpt-trades') || '[]');
      existingTrades.push(trade);
      localStorage.setItem('tradegpt-trades', JSON.stringify(existingTrades));
      
      onSend(value);
      setValue('');
      setSelectedImage(null);
      setImagePreview(null);
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit1('');
      setTakeProfit2('');
      setPositionSize('');
      setLeverage('1');
      setPair('BTC/USD');
      setTradeType('Long');
    }
  };
  
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full py-16 bg-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Trade Journal</h2>
          <p className="text-neutral-300">Document your trading thoughts and strategies</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
                      <form
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl shadow-xl border border-neutral-700 p-6 mb-6"
              onSubmit={handleSubmit}
            >
              {/* Text Entry and Image Upload */}
              <div className="flex items-start gap-4 mb-6">
                <label className="p-3 text-neutral-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-neutral-700 cursor-pointer" title="Attach chart image">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <div className="flex-1">
                  <textarea
                    className="w-full bg-neutral-700 rounded-xl px-4 py-3 text-white border border-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Write your trading journal entry... (e.g., 'Expecting breakout above resistance, good R:R setup')"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    rows={3}
                  />
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img 
                        src={imagePreview} 
                        alt="Chart preview" 
                        className="max-w-full h-32 object-cover rounded-lg border border-neutral-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!value.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Trading Setup Fields */}
              <div className="border-t border-neutral-700 pt-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Trading Setup
                </h4>
                
                {/* Direction, Position Size, and Leverage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Direction</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTradeType('Long')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          tradeType === 'Long'
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Long
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeType('Short')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          tradeType === 'Short'
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4 inline mr-2" />
                        Short
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Position Size ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={positionSize}
                      onChange={e => setPositionSize(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Leverage</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.1"
                      value={leverage}
                      onChange={e => setLeverage(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="1.0"
                    />
                  </div>
                </div>

                {/* Trading Pair and Entry Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Trading Pair</label>
                    <input
                      type="text"
                      value={pair}
                      onChange={e => setPair(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="BTC/USD"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={e => setEntryPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Stop Loss and Take Profits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.01"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Take Profit 1</label>
                    <input
                      type="number"
                      step="0.01"
                      value={takeProfit1}
                      onChange={e => setTakeProfit1(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Take Profit 2</label>
                    <input
                      type="number"
                      step="0.01"
                      value={takeProfit2}
                      onChange={e => setTakeProfit2(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Risk/Reward Display */}
                {riskReward && (
                  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Position Value:</span>
                          <span className="text-blue-400 font-mono">${riskReward.totalPositionValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Risk Amount:</span>
                          <span className="text-red-400 font-mono">${riskReward.riskAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Risk %:</span>
                          <span className="text-red-400 font-mono">{riskReward.riskPercentage}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {riskReward.rr1 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Reward 1:</span>
                              <span className="text-emerald-400 font-mono">${riskReward.reward1Amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">R:R 1:</span>
                              <span className="text-emerald-400 font-mono">1:{riskReward.rr1}</span>
                            </div>
                          </>
                        )}
                        {riskReward.rr2 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Reward 2:</span>
                              <span className="text-emerald-400 font-mono">${riskReward.reward2Amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">R:R 2:</span>
                              <span className="text-emerald-400 font-mono">1:{riskReward.rr2}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
                      <span className="text-neutral-400">Trade Type:</span>
                      <span className={`font-medium ${tradeType === 'Long' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tradeType} • {leverage}x Leverage
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          
          {/* Open Trade Journal Button */}
          <div className="text-center">
            <Link
              href="/trade-journal"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Activity className="w-5 h-5" />
              Open Trade Journal
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Footer() {
  return (
    <footer className="w-full py-12 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">TradeGPT</span>
          </div>
          <span className="text-neutral-400 text-sm">© 2025 TradeGPT – Professional Trading Platform</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const [strategyModal, openStrategyModal] = useStrategyBuilderModal();

  return (
    <div className="bg-neutral-950 min-h-screen font-sans main-container">
      <Navbar />
      
      <main className="w-full">
        <Hero />
        <PnLSection />
        <CVDChart />
        <StatsStrip />
        <FeatureGrid openStrategyModal={openStrategyModal} />
        <TradeJournalInput onSend={msg => console.log('Journal entry:', msg)} />
        <WatchlistPanel />
      </main>
      
      <Footer />
      {strategyModal}
      <AskAIChat />
    </div>
  );
}
