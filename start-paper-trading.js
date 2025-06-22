#!/usr/bin/env node

/**
 * 24/7 Paper Trading Service Runner
 * 
 * This script runs the paper trading service independently of the Next.js app.
 * It will continue trading even when the browser is closed.
 * 
 * Usage:
 *   node start-paper-trading.js
 * 
 * Or to run in background:
 *   node start-paper-trading.js &
 * 
 * Or use PM2 for production:
 *   pm2 start start-paper-trading.js --name "paper-trading"
 */

require('dotenv').config();

// Set auto-trade enabled
process.env.AUTO_TRADE_ENABLED = 'true';

console.log('🚀 Starting 24/7 Paper Trading Service...');
console.log('📊 Trading pairs: BTC, ETH, SOL, ADA, LINK, AVAX');
console.log('💰 Starting balance: $100');
console.log('🎯 Risk per trade: 1% ($1)');
console.log('⏰ Scan interval: Every 5 minutes');
console.log('');

// Import and start the service
const { paperTradingService } = require('./services/paperTradingService');

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down paper trading service...');
  await paperTradingService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Shutting down paper trading service...');
  await paperTradingService.stop();
  process.exit(0);
});

// Keep the process running
setInterval(() => {
  const status = paperTradingService.getStatus();
  if (status.isRunning) {
    console.log(`📈 Paper Trading Active | Last check: ${new Date(status.stats.lastCheck).toLocaleTimeString()} | Trades: ${status.stats.totalTrades}`);
  }
}, 60000); // Log status every minute

console.log('✅ Paper trading service is now running 24/7!');
console.log('Press Ctrl+C to stop\n'); 