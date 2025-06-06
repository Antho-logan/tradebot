'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" }
  })
};

// Mock CVD data for visualization
const mockCVDData = [
  { time: '09:00', cvd: 0, volume: 1200, price: 42800 },
  { time: '09:30', cvd: 150, volume: 1800, price: 42950 },
  { time: '10:00', cvd: 280, volume: 2100, price: 43200 },
  { time: '10:30', cvd: 420, volume: 1950, price: 43400 },
  { time: '11:00', cvd: 380, volume: 1600, price: 43300 },
  { time: '11:30', cvd: 520, volume: 2200, price: 43650 },
  { time: '12:00', cvd: 680, volume: 2800, price: 43850 },
  { time: '12:30', cvd: 590, volume: 1400, price: 43700 },
  { time: '13:00', cvd: 750, volume: 2400, price: 44000 },
  { time: '13:30', cvd: 890, volume: 2600, price: 44200 },
  { time: '14:00', cvd: 820, volume: 1800, price: 44100 },
  { time: '14:30', cvd: 980, volume: 2900, price: 44350 },
];

export default function CVDChart() {
  const maxCVD = Math.max(...mockCVDData.map(d => Math.abs(d.cvd)));
  const currentCVD = mockCVDData[mockCVDData.length - 1].cvd;
  const previousCVD = mockCVDData[mockCVDData.length - 2].cvd;
  const cvdChange = currentCVD - previousCVD;
  const isPositive = currentCVD > 0;
  const isIncreasing = cvdChange > 0;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full py-16 bg-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Cumulative Volume Delta</h2>
          <p className="text-neutral-300">Track buying vs selling pressure in real-time</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* CVD Stats Cards */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className={`w-5 h-5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
              <span className="text-white font-medium">Current CVD</span>
            </div>
            <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentCVD > 0 ? '+' : ''}{currentCVD.toLocaleString()}
            </div>
            <div className={`text-sm flex items-center gap-1 ${isIncreasing ? 'text-emerald-400' : 'text-red-400'}`}>
              {isIncreasing ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isIncreasing ? '+' : ''}{cvdChange}
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Volume</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {mockCVDData[mockCVDData.length - 1].volume.toLocaleString()}
            </div>
            <div className="text-sm text-blue-400">BTC</div>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Price</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${mockCVDData[mockCVDData.length - 1].price.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-400">BTC/USD</div>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Market Bias</span>
            </div>
            <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? 'BULLISH' : 'BEARISH'}
            </div>
            <div className="text-sm text-purple-400">
              {isPositive ? 'Buyers in control' : 'Sellers in control'}
            </div>
          </div>
        </div>

        {/* CVD Chart */}
        <motion.div 
          variants={fadeUp}
          className="mt-8 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">CVD Chart - BTC/USD</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className="text-sm text-neutral-400">Positive CVD</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm text-neutral-400">Negative CVD</span>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative h-80 bg-neutral-900/50 rounded-xl p-4 border border-neutral-700">
            {/* Chart Grid */}
            <div className="absolute inset-4">
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-neutral-700/30"
                  style={{ top: `${percent}%` }}
                ></div>
              ))}
              
              {/* CVD Line Chart */}
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* CVD Line */}
                <polyline
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  points={mockCVDData.map((point, index) => {
                    const x = (index / (mockCVDData.length - 1)) * 380 + 10;
                    const y = 280 - ((point.cvd + maxCVD) / (2 * maxCVD)) * 260;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* CVD Points */}
                {mockCVDData.map((point, index) => {
                  const x = (index / (mockCVDData.length - 1)) * 380 + 10;
                  const y = 280 - ((point.cvd + maxCVD) / (2 * maxCVD)) * 260;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={point.cvd >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                      className="hover:r-5 transition-all cursor-pointer"
                    />
                  );
                })}
                
                {/* Zero line */}
                <line
                  x1="10"
                  y1="150"
                  x2="390"
                  y2="150"
                  stroke="rgb(115, 115, 115)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              </svg>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-400 -ml-8">
                <span>+{maxCVD}</span>
                <span>+{Math.round(maxCVD/2)}</span>
                <span>0</span>
                <span>-{Math.round(maxCVD/2)}</span>
                <span>-{maxCVD}</span>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-400 -mb-6">
                {mockCVDData.filter((_, i) => i % 3 === 0).map((point, index) => (
                  <span key={index}>{point.time}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Timeframe:</span>
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                  <button
                    key={tf}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      tf === '15m' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors">
                Export Data
              </button>
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors">
                Live Feed
              </button>
            </div>
          </div>
        </motion.div>

        {/* CVD Explanation */}
        <motion.div 
          variants={fadeUp}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              What is CVD?
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Cumulative Volume Delta tracks the difference between buying and selling volume over time. 
              Positive CVD indicates buyers are in control, while negative CVD suggests sellers dominate. 
              This helps identify market sentiment and potential trend reversals.
            </p>
          </div>
          
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Trading Signals
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Look for divergences between price and CVD for early reversal signals. 
              Rising CVD with rising price confirms uptrend strength. 
              Falling CVD during price rallies may indicate weakening momentum.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}