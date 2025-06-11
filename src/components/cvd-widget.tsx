"use client"

import useSWR from "swr"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const timeframes = [
  { label: "5m", value: "5min", points: 12 },
  { label: "15m", value: "15min", points: 16 },
  { label: "1h", value: "1h", points: 24 },
  { label: "4h", value: "4h", points: 24 },
]

/** Markets we allow in the dropdown */
const MARKET_OPTIONS = [
  { label: "BTC/USD  ·  Bybit",   symbol: "BTCUSD",  exchange: "bybit"   },
  { label: "BTC/USD  ·  Binance", symbol: "BTCUSD",  exchange: "binance" },
  { label: "BTC/USDT ·  Bybit",   symbol: "BTCUSDT", exchange: "bybit"   },
  { label: "BTC/USDT ·  Binance", symbol: "BTCUSDT", exchange: "binance" },
] as const

type Market = typeof MARKET_OPTIONS[number]

export default function CVDWidget() {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[0])
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKET_OPTIONS[0])
  
  const { data, error, isLoading } = useSWR(
    `/api/cvd?symbol=${selectedMarket.symbol}&exchange=${selectedMarket.exchange}&interval=${selectedTimeframe.value}&points=${selectedTimeframe.points}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-red-400 text-lg">CVD Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Failed to load CVD data</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300 text-lg">Cumulative Volume Delta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { cvd, metrics } = data
  const currentCVD = metrics?.current || 0
  const buyRatio = metrics?.buyRatio || 0
  const peak = metrics?.peak || 0
  const low = metrics?.low || 0

  // Format CVD value
  const formatCVD = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + "K"
    }
    return value.toFixed(0)
  }

  // Determine trend color
  const getTrendColor = (current: number, peak: number, low: number) => {
    const range = peak - low
    const position = (current - low) / range
    if (position > 0.7) return "text-green-400"
    if (position < 0.3) return "text-red-400"
    return "text-yellow-400"
  }

  const trendColor = getTrendColor(currentCVD, peak, low)

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-300 text-lg">Cumulative Volume Delta</CardTitle>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  selectedTimeframe.value === tf.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Market Selector */}
        <div className="mt-3">
          <select
            value={`${selectedMarket.symbol}-${selectedMarket.exchange}`}
            onChange={(e) => {
              const market = MARKET_OPTIONS.find(
                (m) => `${m.symbol}-${m.exchange}` === e.target.value
              )
              if (market) setSelectedMarket(market)
            }}
            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {MARKET_OPTIONS.map((market) => (
              <option key={market.label} value={`${market.symbol}-${market.exchange}`}>
                {market.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main CVD Value */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${trendColor}`}>
            {formatCVD(currentCVD)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Current CVD</p>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cvd}>
              <XAxis 
                dataKey="t" 
                hide 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                hide 
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                }}
                formatter={(value: number) => [formatCVD(value), "CVD"]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
              />
              <Line
                type="monotone"
                dataKey="cvd"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {formatCVD(peak)}
            </div>
            <p className="text-xs text-gray-500">Peak</p>
          </div>
          
          <div className="text-center">
            <div className="text-blue-400 font-semibold">
              {(buyRatio * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Buy Ratio</p>
          </div>
          
          <div className="text-center">
            <div className="text-red-400 font-semibold">
              {formatCVD(low)}
            </div>
            <p className="text-xs text-gray-500">Low</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <div className={`w-2 h-2 rounded-full ${
            buyRatio > 0.6 ? 'bg-green-400' : 
            buyRatio < 0.4 ? 'bg-red-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-xs text-gray-400">
            {buyRatio > 0.6 ? 'Bullish Pressure' : 
             buyRatio < 0.4 ? 'Bearish Pressure' : 'Neutral'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 