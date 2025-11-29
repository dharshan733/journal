'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, Target, Award, Filter, Calendar } from 'lucide-react'

interface ModelStats {
  model: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
  avgPnL: number
  bestTrade: number
  worstTrade: number
}

interface AccountStats {
  accountId: string
  accountName: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
  avgPnL: number
}

export default function InsightsPage() {
  const [modelStats, setModelStats] = useState<ModelStats[]>([])
  const [accountStats, setAccountStats] = useState<AccountStats[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [accounts, setAccounts] = useState<any[]>([])
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterModel, setFilterModel] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [uniqueModels, setUniqueModels] = useState<string[]>([])

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [filterAccount, filterModel, dateFrom, dateTo])

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) setAccounts(data)
  }

  const fetchInsights = async () => {
    setLoading(true)

    // Build query with filters
    let query = supabase
      .from('trades')
      .select('*, accounts(name)')
      .order('trade_date', { ascending: false })

    // Apply account filter
    if (filterAccount !== 'all') {
      query = query.eq('account_id', filterAccount)
    }

    // Apply model filter
    if (filterModel !== 'all') {
      query = query.eq('model', filterModel)
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte('trade_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('trade_date', dateTo)
    }

    const { data: trades } = await query

    if (trades) {
      // Extract unique models for dropdown
      const models = [...new Set(trades.map(t => t.model).filter(m => m))] as string[]
      setUniqueModels(models)

      // Calculate stats by model
      const modelMap = new Map<string, any[]>()
      
      trades.forEach(trade => {
        const model = trade.model || 'No Model'
        if (!modelMap.has(model)) {
          modelMap.set(model, [])
        }
        modelMap.get(model)!.push(trade)
      })

      const modelStatsData: ModelStats[] = []
      modelMap.forEach((tradesForModel, model) => {
        const wins = tradesForModel.filter(t => (Number(t.pnl) || 0) > 0).length
        const losses = tradesForModel.filter(t => (Number(t.pnl) || 0) < 0).length
        const totalTrades = tradesForModel.length
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
        const totalPnL = tradesForModel.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
        const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0
        const pnls = tradesForModel.map(t => Number(t.pnl) || 0).filter(p => p !== 0)
        const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0
        const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0

        modelStatsData.push({
          model,
          totalTrades,
          wins,
          losses,
          winRate,
          totalPnL,
          avgPnL,
          bestTrade,
          worstTrade
        })
      })

      modelStatsData.sort((a, b) => b.totalPnL - a.totalPnL)
      setModelStats(modelStatsData)

      // Calculate stats by account
      const accountMap = new Map<string, any[]>()
      
      trades.forEach(trade => {
        const accountId = trade.account_id
        if (!accountMap.has(accountId)) {
          accountMap.set(accountId, [])
        }
        accountMap.get(accountId)!.push(trade)
      })

      const accountStatsData: AccountStats[] = []
      accountMap.forEach((tradesForAccount, accountId) => {
        const wins = tradesForAccount.filter(t => (Number(t.pnl) || 0) > 0).length
        const losses = tradesForAccount.filter(t => (Number(t.pnl) || 0) < 0).length
        const totalTrades = tradesForAccount.length
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
        const totalPnL = tradesForAccount.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
        const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0
        const accountName = (tradesForAccount[0] as any).accounts?.name || 'Unknown'

        accountStatsData.push({
          accountId,
          accountName,
          totalTrades,
          wins,
          losses,
          winRate,
          totalPnL,
          avgPnL
        })
      })

      accountStatsData.sort((a, b) => b.totalPnL - a.totalPnL)
      setAccountStats(accountStatsData)
    }

    setLoading(false)
  }

  const clearFilters = () => {
    setFilterAccount('all')
    setFilterModel('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = filterAccount !== 'all' || filterModel !== 'all' || dateFrom || dateTo

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading insights...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Performance Insights</h1>
          <p className="text-gray-400 mt-2">Analyze your trading performance by model and account</p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-500" />
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Account</label>
              <select 
                value={filterAccount} 
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Accounts</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Model/Setup</label>
              <select 
                value={filterModel} 
                onChange={(e) => setFilterModel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Models</option>
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input 
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input 
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-3">
              <div className="text-sm text-gray-400">Active filters:</div>
              {filterAccount !== 'all' && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {accounts.find(a => a.id === filterAccount)?.name}
                </span>
              )}
              {filterModel !== 'all' && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {filterModel}
                </span>
              )}
              {dateFrom && (
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                  From: {dateFrom}
                </span>
              )}
              {dateTo && (
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                  To: {dateTo}
                </span>
              )}
              <button 
                onClick={clearFilters}
                className="ml-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Performance by Model */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-500" />
            Performance by Model
          </h2>

          {modelStats.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">No data available with current filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modelStats.map(stat => (
                <div key={stat.model} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-purple-500">{stat.model}</h3>
                      <p className="text-sm text-gray-400">{stat.totalTrades} trades</p>
                    </div>
                    <div className={`text-2xl font-bold ${stat.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.totalPnL >= 0 ? '+' : ''}${stat.totalPnL.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-bold">{stat.winRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{stat.wins}W / {stat.losses}L</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg P&L</div>
                      <div className={`text-lg font-bold ${stat.avgPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${stat.avgPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">per trade</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <div className="text-sm text-gray-400">Best Trade</div>
                      <div className="text-md font-bold text-green-500">+${stat.bestTrade.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Worst Trade</div>
                      <div className="text-md font-bold text-red-500">${stat.worstTrade.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Win Rate</span>
                      <span>{stat.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(stat.winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance by Account */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Performance by Account
          </h2>

          {accountStats.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">No data available with current filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accountStats.map(stat => (
                <div key={stat.accountId} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-400">{stat.accountName}</h3>
                      <p className="text-sm text-gray-400">{stat.totalTrades} trades</p>
                    </div>
                    <div className={`${stat.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.totalPnL >= 0 ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Total P&L</div>
                      <div className={`text-lg font-bold ${stat.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.totalPnL >= 0 ? '+' : ''}${stat.totalPnL.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-bold">{stat.winRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg Trade</div>
                      <div className={`text-lg font-bold ${stat.avgPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${stat.avgPnL.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded">{stat.wins} Wins</span>
                      <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded">{stat.losses} Losses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
