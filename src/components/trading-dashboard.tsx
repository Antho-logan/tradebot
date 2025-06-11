"use client"

import CVDWidget from "./cvd-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TradingDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-white mb-6">Trading Bot Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CVD Widget */}
          <div className="col-span-1 md:col-span-2">
            <CVDWidget />
          </div>

          {/* Placeholder for other widgets */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Market Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>24h Volume:</span>
                  <span className="text-white">$2.1B</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Open Interest:</span>
                  <span className="text-white">$15.2B</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Funding Rate:</span>
                  <span className="text-green-400">0.0125%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Bot Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Strategy:</span>
                  <span className="text-white">CVD Momentum</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">P&L Today:</span>
                  <span className="text-green-400">+$127.50</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Recent Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CVD Divergence</span>
                  <span className="text-yellow-400">Warning</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume Spike</span>
                  <span className="text-green-400">Bullish</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Support Level</span>
                  <span className="text-blue-400">Hold</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 