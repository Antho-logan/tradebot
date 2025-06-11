/**
 * CVDChart.tsx
 * Cumulative Volume Delta Chart Component
 * Shows the difference between buying and selling volume over time
 * Features: Real-time updates, color-coded positive/negative CVD, smooth animations
 */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface CVDDataPoint {
  time: string;
  cvd: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
}

// Fixed initial data to prevent hydration mismatches
const INITIAL_CVD_DATA: CVDDataPoint[] = [
  { time: '09:00', cvd: 1250, volume: 2500, buyVolume: 1875, sellVolume: 625 },
  { time: '09:15', cvd: 1890, volume: 3200, buyVolume: 2560, sellVolume: 640 },
  { time: '09:30', cvd: 2340, volume: 2800, buyVolume: 2240, sellVolume: 560 },
  { time: '09:45', cvd: 2900, volume: 3500, buyVolume: 2800, sellVolume: 700 },
  { time: '10:00', cvd: 2650, volume: 2200, buyVolume: 1540, sellVolume: 660 },
  { time: '10:15', cvd: 3100, volume: 4000, buyVolume: 3200, sellVolume: 800 },
  { time: '10:30', cvd: 3450, volume: 2900, buyVolume: 2320, sellVolume: 580 },
  { time: '10:45', cvd: 3200, volume: 2100, buyVolume: 1470, sellVolume: 630 },
];

function generateRandomCVDData(): CVDDataPoint[] {
  const data: CVDDataPoint[] = [];
  let cumulativeCVD = 1000;
  
  for (let i = 0; i < 8; i++) {
    const hour = 9 + Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const volume = 2000 + Math.random() * 3000;
    const buyRatio = 0.4 + Math.random() * 0.4; // 40-80% buy ratio
    const buyVolume = volume * buyRatio;
    const sellVolume = volume * (1 - buyRatio);
    
    cumulativeCVD += (buyVolume - sellVolume);
    
    data.push({
      time,
      cvd: Math.round(cumulativeCVD),
      volume: Math.round(volume),
      buyVolume: Math.round(buyVolume),
      sellVolume: Math.round(sellVolume)
    });
  }
  
  return data;
}

export default function CVDChart() {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<CVDDataPoint[]>(INITIAL_CVD_DATA);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Only start random updates after component is mounted on client
    const interval = setInterval(() => {
      setIsUpdating(true);
      setData(generateRandomCVDData());
      setTimeout(() => setIsUpdating(false), 400);
    }, 8000); // Update every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Use fixed data until mounted to prevent hydration mismatches
  const displayData = mounted ? data : INITIAL_CVD_DATA;
  
  const currentCVD = displayData[displayData.length - 1]?.cvd || 0;
  const previousCVD = displayData[displayData.length - 2]?.cvd || 0;
  const cvdChange = currentCVD - previousCVD;
  const isPositive = cvdChange >= 0;

  // Calculate chart dimensions and points
  const chartWidth = 320;
  const chartHeight = 120;
  const padding = 20;
  
  const minCVD = Math.min(...displayData.map(d => d.cvd));
  const maxCVD = Math.max(...displayData.map(d => d.cvd));
  const range = maxCVD - minCVD || 1;

  const points = displayData.map((point, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (displayData.length - 1);
    const y = chartHeight - padding - ((point.cvd - minCVD) / range) * (chartHeight - 2 * padding);
    return { x, y, cvd: point.cvd };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className="w-full py-16 bg-neutral-950"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }
          }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Cumulative Volume Delta</h2>
          <p className="text-neutral-300">Real-time buying vs selling pressure analysis</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CVD Chart */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -32 },
              visible: { opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.6 } }
            }}
            className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">CVD Chart</h3>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{formatNumber(cvdChange)}
                </span>
              </div>
            </div>

            {/* Chart SVG */}
            <div className="relative bg-neutral-900/50 rounded-xl p-4 mb-4">
              <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* CVD Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={currentCVD >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isUpdating ? "animate-pulse" : ""}
                />
                
                {/* Data points */}
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={point.cvd >= 0 ? "#10b981" : "#ef4444"}
                    className="drop-shadow-sm"
                  />
                ))}
              </svg>
            </div>

            {/* Current CVD Value */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(currentCVD)}
              </div>
              <div className="text-sm text-neutral-400">Current CVD</div>
            </div>
          </motion.div>

          {/* CVD Stats */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 32 },
              visible: { opacity: 1, x: 0, transition: { delay: 0.6, duration: 0.6 } }
            }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 p-6 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4">Volume Breakdown</h4>
              <div className="space-y-4">
                {displayData.slice(-3).map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">{point.time}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                        <span className="text-emerald-400 text-sm font-mono">
                          {formatNumber(point.buyVolume)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-red-400 text-sm font-mono">
                          {formatNumber(point.sellVolume)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 p-6 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4">CVD Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatNumber(Math.max(...displayData.map(d => d.cvd)))}
                  </div>
                  <div className="text-xs text-neutral-400">Peak CVD</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {formatNumber(Math.min(...displayData.map(d => d.cvd)))}
                  </div>
                  <div className="text-xs text-neutral-400">Low CVD</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatNumber(displayData.reduce((sum, d) => sum + d.volume, 0))}
                  </div>
                  <div className="text-xs text-neutral-400">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {((displayData.reduce((sum, d) => sum + d.buyVolume, 0) / 
                       displayData.reduce((sum, d) => sum + d.volume, 0)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-neutral-400">Buy Ratio</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
} 