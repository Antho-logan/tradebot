'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  Settings, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface BotStatus {
  isRunning: boolean;
  config: {
    enabled: boolean;
    mode: 'paper' | 'live';
    pairs: string[];
    maxPositions: number;
    riskPerTrade: number;
    checkInterval: number;
    startingBalance: number;
  };
  portfolio: {
    balance: number;
    equity: number;
    freeMargin: number;
    usedMargin: number;
    unrealizedPnL: number;
    dailyPnL: number;
    totalTrades: number;
    winRate: number;
    openPositions: any[];
  };
  lastChecks: { [pair: string]: number };
}

export default function RealTradingBotControl() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    mode: 'paper' as 'paper' | 'live',
    pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    maxPositions: 5,
    riskPerTrade: 0.02,
    checkInterval: 60000,
    startingBalance: 1000
  });

  // Fetch bot status
  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/real-trading-bot?action=status');
      const data = await response.json();
      
      if (data.success) {
        setBotStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  // Start the bot
  const startBot = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/real-trading-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          config: showConfig ? config : undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Real Trading Bot started successfully!');
        setBotStatus(data.data);
      } else {
        setMessage(`❌ Failed to start bot: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error starting bot: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Stop the bot
  const stopBot = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/real-trading-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('🛑 Real Trading Bot stopped');
        setBotStatus(data.data);
      } else {
        setMessage(`❌ Failed to stop bot: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error stopping bot: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Force a trading cycle
  const forceCycle = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/real-trading-bot?action=force-cycle');
      const data = await response.json();
      
      if (data.success) {
        setMessage('🔄 Trading cycle executed');
        await fetchBotStatus();
      } else {
        setMessage(`❌ Failed to execute cycle: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error executing cycle: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Update configuration
  const updateConfig = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/real-trading-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update-config',
          config
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('⚙️ Configuration updated');
        setBotStatus(data.data);
        setShowConfig(false);
      } else {
        setMessage(`❌ Failed to update config: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error updating config: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh status
  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update local config when bot status changes
  useEffect(() => {
    if (botStatus?.config) {
      setConfig({
        mode: botStatus.config.mode,
        pairs: botStatus.config.pairs,
        maxPositions: botStatus.config.maxPositions,
        riskPerTrade: botStatus.config.riskPerTrade,
        checkInterval: botStatus.config.checkInterval,
        startingBalance: botStatus.config.startingBalance
      });
    }
  }, [botStatus]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${botStatus?.isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <h2 className="text-xl font-bold text-white">Real Trading Bot</h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            botStatus?.isRunning ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {botStatus?.isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>
        
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          disabled={loading}
        >
          <Settings className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Bot Status Cards */}
      {botStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Mode</span>
            </div>
            <div className="text-lg font-bold text-white capitalize">
              {botStatus.config.mode}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Positions</span>
            </div>
            <div className="text-lg font-bold text-white">
              {botStatus.portfolio.openPositions.length}/{botStatus.config.maxPositions}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">P&L</span>
            </div>
            <div className={`text-lg font-bold ${
              botStatus.portfolio.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${botStatus.portfolio.unrealizedPnL.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Equity</span>
            </div>
            <div className="text-lg font-bold text-white">
              ${botStatus.portfolio.equity.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Monitored Pairs */}
      {botStatus && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Monitored Pairs</h3>
          <div className="flex flex-wrap gap-2">
            {botStatus.config.pairs.map(pair => {
              const lastCheck = botStatus.lastChecks[pair];
              const isRecent = lastCheck && (Date.now() - lastCheck) < 60000; // Within 1 minute
              
              return (
                <div
                  key={pair}
                  className={`px-3 py-2 rounded-lg border ${
                    isRecent 
                      ? 'bg-green-900/30 border-green-700 text-green-300' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pair}</span>
                    {lastCheck && (
                      <span className="text-xs opacity-75">
                        {formatTime(lastCheck)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-medium text-white mb-4">Bot Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trading Mode</label>
              <select
                value={config.mode}
                onChange={(e) => setConfig({...config, mode: e.target.value as 'paper' | 'live'})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="paper">Paper Trading</option>
                <option value="live">Live Trading</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Positions</label>
              <input
                type="number"
                value={config.maxPositions}
                onChange={(e) => setConfig({...config, maxPositions: parseInt(e.target.value)})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Risk Per Trade (%)</label>
              <input
                type="number"
                value={config.riskPerTrade * 100}
                onChange={(e) => setConfig({...config, riskPerTrade: parseFloat(e.target.value) / 100})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Check Interval (seconds)</label>
              <input
                type="number"
                value={config.checkInterval / 1000}
                onChange={(e) => setConfig({...config, checkInterval: parseInt(e.target.value) * 1000})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="10"
                max="300"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">Trading Pairs (comma-separated)</label>
            <input
              type="text"
              value={config.pairs.join(', ')}
              onChange={(e) => setConfig({...config, pairs: e.target.value.split(',').map(p => p.trim())})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="BTC/USDT, ETH/USDT, SOL/USDT"
            />
          </div>

          <button
            onClick={updateConfig}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            {loading ? 'Updating...' : 'Update Configuration'}
          </button>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 mb-4">
        {!botStatus?.isRunning ? (
          <button
            onClick={startBot}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Starting...' : 'Start Bot'}
          </button>
        ) : (
          <button
            onClick={stopBot}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <Square className="w-4 h-4" />
            {loading ? 'Stopping...' : 'Stop Bot'}
          </button>
        )}

        <button
          onClick={forceCycle}
          disabled={loading || !botStatus?.isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
        >
          <Clock className="w-4 h-4" />
          {loading ? 'Running...' : 'Force Cycle'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-sm text-gray-300"
        >
          {message}
        </motion.div>
      )}

      {/* Strategy Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Strategy: Range Fibonacci</span>
        </div>
        <p className="text-xs text-blue-200 opacity-75">
          This bot runs your actual range fibonacci strategy with real market data. 
          It generates signals based on FVG, order blocks, and CVD analysis, then executes trades automatically.
          {botStatus?.config.mode === 'paper' ? ' Paper trading mode - no real money at risk.' : ' LIVE TRADING MODE - Real money at risk!'}
        </p>
      </div>
    </div>
  );
} 