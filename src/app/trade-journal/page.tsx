/**
 * Trade Journal Page
 * Excel-like interface for viewing and managing all trades
 * Features: sortable columns, filters, image viewing, trade management
 */

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Clock,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface Trade {
  id: string;
  entry?: string;
  image?: string | null;
  timestamp?: string;
  pair: string;
  type?: 'Long' | 'Short';
  side?: 'long' | 'short';
  status: 'Open' | 'Closed' | 'Pending' | 'open' | 'closed' | 'cancelled';
  entryPrice?: number;
  entry_price?: number;
  exitPrice?: number;
  exit_price?: number;
  quantity?: number;
  size_usd?: number;
  pnl?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  created_at?: string;
  closed_at?: string;
  notes?: string;
  confidence?: number;
  strategy?: string;
  source?: 'manual' | 'paper_trading' | 'blofin_live';
  riskReward?: {
    risk: number;
    reward1: number;
    reward2: number;
    rr1: string | null;
    rr2: string | null;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function TradeJournalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Trade>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Fetch trades from API (includes both manual and paper trades)
  const { data: tradesData, error, mutate } = useSWR('/api/trade-journal', fetcher, {
    refreshInterval: 10000 // Refresh every 10 seconds to catch new paper trades
  });

  const trades = tradesData?.data || [];

  // Merge API trades with legacy localStorage trades using useMemo
  const allTrades = useMemo(() => {
    let mergedTrades = [...trades];
    
    try {
      const savedTrades = localStorage.getItem('tradegpt-trades');
      if (savedTrades) {
        const parsedTrades = JSON.parse(savedTrades);
        // Convert legacy format to new format
        const convertedTrades = parsedTrades.map((trade: any) => ({
          ...trade,
          source: 'manual',
          created_at: trade.timestamp,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          size_usd: trade.quantity ? trade.quantity * (trade.entryPrice || 0) : 0,
          side: trade.type?.toLowerCase(),
          status: trade.status?.toLowerCase()
        }));
        
        // Merge with API data (API data takes precedence)
        mergedTrades = [...trades, ...convertedTrades.filter((legacy: any) => 
          !trades.some((apiTrade: any) => apiTrade.id === legacy.id)
        )];
      }
    } catch (error) {
      console.error('Error parsing localStorage trades:', error);
    }
    
    return mergedTrades;
  }, [trades]);

  // Filter and search trades using useMemo
  const filteredTrades = useMemo(() => {
    let filtered = allTrades.filter(trade => {
      const searchText = (trade.entry || trade.notes || '').toLowerCase();
      const matchesSearch = searchText.includes(searchTerm.toLowerCase()) ||
                           trade.pair.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tradeStatus = trade.status?.toLowerCase() || '';
      const matchesStatus = statusFilter === 'all' || tradeStatus === statusFilter.toLowerCase();
      
      const tradeType = trade.type?.toLowerCase() || trade.side?.toLowerCase() || '';
      const matchesType = typeFilter === 'all' || tradeType === typeFilter.toLowerCase();
      
      const matchesSource = sourceFilter === 'all' || trade.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesSource;
    });

    // Sort trades
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allTrades, searchTerm, statusFilter, typeFilter, sourceFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      // For localStorage trades, remove from localStorage
      const savedTrades = localStorage.getItem('tradegpt-trades');
      if (savedTrades) {
        try {
          const parsedTrades = JSON.parse(savedTrades);
          const updatedTrades = parsedTrades.filter((trade: any) => trade.id !== id);
          localStorage.setItem('tradegpt-trades', JSON.stringify(updatedTrades));
          // Trigger a re-fetch to update the UI
          mutate();
        } catch (error) {
          console.error('Error deleting trade from localStorage:', error);
        }
      }
    }
  };

  // Toggle trade selection
  const toggleTradeSelection = (tradeId: string) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  // Select all visible trades
  const selectAllTrades = () => {
    const allTradeIds = new Set(filteredTrades.map(trade => trade.id));
    setSelectedTrades(allTradeIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedTrades(new Set());
    setIsSelectMode(false);
  };

  // Delete selected trades
  const deleteSelectedTrades = () => {
    if (selectedTrades.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTrades.size} selected trade(s)?`)) {
      const savedTrades = localStorage.getItem('tradegpt-trades');
      if (savedTrades) {
        try {
          const parsedTrades = JSON.parse(savedTrades);
          const updatedTrades = parsedTrades.filter((trade: any) => !selectedTrades.has(trade.id));
          localStorage.setItem('tradegpt-trades', JSON.stringify(updatedTrades));
          
          // Clear selections and trigger re-fetch
          clearSelection();
          mutate();
        } catch (error) {
          console.error('Error deleting selected trades:', error);
        }
      }
    }
  };

  // Clear all old trades (for testing)
  const clearAllOldTrades = () => {
    if (confirm('⚠️ This will delete ALL trades from localStorage (manual trades). Paper trading data will remain. Continue?')) {
      localStorage.removeItem('tradegpt-trades');
      clearSelection();
      mutate();
    }
  };

  // Go back to previous page
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-400 bg-blue-500/10';
      case 'Closed': return 'text-green-400 bg-green-500/10';
      case 'Pending': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-neutral-400 bg-neutral-500/10';
    }
  };

  const getTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    return normalizedType === 'long' ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-neutral-300 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="w-px h-6 bg-neutral-700"></div>
              <h1 className="text-2xl font-bold">Trade Journal</h1>
              {selectedTrades.size > 0 && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {selectedTrades.size} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selection Controls */}
              {isSelectMode ? (
                <>
                  <button
                    onClick={selectAllTrades}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Select All ({filteredTrades.length})
                  </button>
                  <button
                    onClick={deleteSelectedTrades}
                    disabled={selectedTrades.size === 0}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-400 text-white rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedTrades.size})
                  </button>
                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsSelectMode(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Select Trades
                  </button>
                  <button
                    onClick={clearAllOldTrades}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Old
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <Link 
                    href="/#trade-journal"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trade
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Sources</option>
              <option value="manual">Manual Trades</option>
              <option value="paper_trading">Paper Trading</option>
              <option value="blofin_live">BloFin Live</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>

            {/* Stats */}
            <div className="flex flex-col gap-1 text-sm text-neutral-400">
              <div className="flex items-center gap-4">
                <span>Total: {filteredTrades.length}</span>
                <span>Open: {filteredTrades.filter(t => t.status?.toLowerCase() === 'open').length}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Manual: {filteredTrades.filter(t => t.source === 'manual').length}</span>
                <span>Paper: {filteredTrades.filter(t => t.source === 'paper_trading').length}</span>
                <span>Live: {filteredTrades.filter(t => t.source === 'blofin_live').length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trades Table */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800 border-b border-neutral-700">
                <tr>
                  {isSelectMode && (
                    <th className="text-left p-4 font-medium text-neutral-300 w-12">
                      <input
                        type="checkbox"
                        checked={selectedTrades.size === filteredTrades.length && filteredTrades.length > 0}
                        onChange={selectedTrades.size === filteredTrades.length ? clearSelection : selectAllTrades}
                        className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </th>
                  )}
                  <th className="text-left p-4 font-medium text-neutral-300">
                    <button 
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Date
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-300">
                    <button 
                      onClick={() => handleSort('pair')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Pair
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-300">
                    <button 
                      onClick={() => handleSort('side')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Type
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-300">Source</th>
                  <th className="text-left p-4 font-medium text-neutral-300">
                    <button 
                      onClick={() => handleSort('entryPrice')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      Entry
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-300">Stop Loss</th>
                  <th className="text-left p-4 font-medium text-neutral-300">Take Profits</th>
                  <th className="text-left p-4 font-medium text-neutral-300">R:R</th>
                  <th className="text-left p-4 font-medium text-neutral-300">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Status
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-300">Notes</th>
                  <th className="text-left p-4 font-medium text-neutral-300">Chart</th>
                  <th className="text-left p-4 font-medium text-neutral-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectMode ? 13 : 12} className="text-center py-12 text-neutral-400">
                      <div className="flex flex-col items-center gap-3">
                        <Target className="w-12 h-12 text-neutral-600" />
                        <p>No trades found</p>
                        <Link 
                          href="/#trade-journal"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Add your first trade
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((trade, index) => {
                    const tradeDate = trade.created_at || trade.timestamp || '';
                    const tradeType = trade.side || trade.type?.toLowerCase() || '';
                    const entryPrice = trade.entry_price || trade.entryPrice || 0;
                    const exitPrice = trade.exit_price || trade.exitPrice;
                    const size = trade.size_usd || (trade.quantity && trade.entryPrice ? trade.quantity * trade.entryPrice : 0);
                    
                    return (
                    <tr key={trade.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                      {isSelectMode && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedTrades.has(trade.id)}
                            onChange={() => toggleTradeSelection(trade.id)}
                            className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                      )}
                      <td className="p-4 text-sm text-neutral-300">
                        {formatDate(tradeDate)}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-medium text-white">{trade.pair}</span>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 ${getTypeColor(tradeType)}`}>
                          {tradeType === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {trade.source === 'paper_trading' && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">Paper Trading</span>
                          )}
                          {trade.source === 'manual' && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">Manual Trade</span>
                          )}
                          {trade.source === 'blofin_live' && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded font-medium">BloFin Live</span>
                          )}
                          {trade.strategy && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">{trade.strategy}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {entryPrice ? (
                          <span className="font-mono text-white">${entryPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-neutral-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {trade.stopLoss ? (
                          <span className="font-mono text-red-400">${trade.stopLoss.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                        ) : (
                          <span className="text-neutral-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {trade.takeProfit1 && (
                            <span className="font-mono text-emerald-400 text-sm">TP1: ${trade.takeProfit1.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          )}
                          {trade.takeProfit2 && (
                            <span className="font-mono text-emerald-400 text-sm">TP2: ${trade.takeProfit2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          )}
                          {!trade.takeProfit1 && !trade.takeProfit2 && (
                            <span className="text-neutral-500 text-sm">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {trade.riskReward ? (
                          <div className="flex flex-col gap-1">
                            {trade.riskReward.rr1 && (
                              <span className="font-mono text-emerald-400 text-sm">1:{trade.riskReward.rr1}</span>
                            )}
                            {trade.riskReward.rr2 && (
                              <span className="font-mono text-emerald-400 text-sm">1:{trade.riskReward.rr2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="text-sm text-neutral-300">
                          {trade.notes && (
                            <p className="truncate" title={trade.notes}>
                              {trade.notes}
                            </p>
                          )}
                          {trade.entry && !trade.notes && (
                            <p className="truncate" title={trade.entry}>
                              {trade.entry}
                            </p>
                          )}
                          {trade.confidence && (
                            <p className="text-xs text-neutral-400 mt-1">
                              Confidence: {Math.round(trade.confidence * 100)}%
                            </p>
                          )}
                          {trade.pnl !== undefined && trade.pnl !== 0 && (
                            <p className={`text-xs mt-1 ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              P&L: ${trade.pnl.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {trade.image ? (
                          <button
                            onClick={() => setSelectedImage(trade.image!)}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                            View
                          </button>
                        ) : (
                          <span className="text-neutral-500 text-sm">No image</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedImage(trade.image!)}
                            disabled={!trade.image}
                            className="p-1 text-neutral-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 p-2 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Trade chart"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 