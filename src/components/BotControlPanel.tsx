'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Settings, Zap, Activity, AlertCircle } from 'lucide-react';

interface BotControlPanelProps {
  className?: string;
}

export default function BotControlPanel({ className = '' }: BotControlPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const createDemoTrade = async (mode: 'paper' | 'live') => {
    setIsLoading(true);
    try {
      // Update bot mode first
      await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-config',
          config: { mode }
        })
      });

      // Create demo trade
      const response = await fetch('/api/bot?action=demo-trade');
      const data = await response.json();

      if (data.success) {
        showMessage(`${mode === 'paper' ? 'Paper' : 'BloFin Live'} demo trade created! Check the trade journal.`, 'success');
      } else {
        showMessage(`Failed to create demo trade: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage('Error creating demo trade', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMultipleTrades = async (count: number, mode: 'paper' | 'live') => {
    setIsLoading(true);
    try {
      // Update bot mode first
      await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-config',
          config: { mode }
        })
      });

      // Create multiple demo trades
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-demo-trades',
          count
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`${count} ${mode === 'paper' ? 'paper' : 'live'} demo trades created! Check the trade journal.`, 'success');
      } else {
        showMessage(`Failed to create demo trades: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage('Error creating demo trades', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-neutral-900 rounded-xl border border-neutral-800 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Bot Control Panel</h3>
          <p className="text-sm text-neutral-400">Test the trade logging system</p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            messageType === 'success' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{message}</span>
        </motion.div>
      )}

      {/* Demo Trade Buttons */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Create Demo Trades</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => createDemoTrade('paper')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              Paper Trade
            </button>
            
            <button
              onClick={() => createDemoTrade('live')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              BloFin Live
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Bulk Create (5 trades)</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => createMultipleTrades(5, 'paper')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              5 Paper Trades
            </button>
            
            <button
              onClick={() => createMultipleTrades(5, 'live')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              5 Live Trades
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 leading-relaxed">
            These demo trades will appear in your trade journal with proper source labels. 
            Paper trades show as "Paper Trading" and live trades show as "BloFin Live". 
            All trades include strategy information and confidence scores.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 