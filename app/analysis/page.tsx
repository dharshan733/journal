'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [symbolStats, setSymbolStats] = useState<any[]>([])
  const [assetClassStats, setAssetClassStats] = useState<any[]>([])
  const [strategyStats, setStrategyStats] = useState<any[]>([])
  const [modelStats, setModelStats] = useState<any[]>([])

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    setLoading(true)

    const { data: trades } = await supabase
      .from('trades')
      .select('*')
    
    if (trades) {
      // Symbol Performance
      const symbolMap = new Map()
      trades.forEach(t => {
        if (!symbolMap.has(t.symbol)) {
          symbolMap.set(t.symbol, { symbol: t.symbol, pnl: 0, trades: 0 })
        }
        const stats = symbolMap.get(t.symbol)
        stats.pnl += Number(t.pnl) || 0
        stats.trades += 1
      })
      setSymbolStats(Array.from(symbolMap.values()).sort((a, b) => b.pnl - a.pnl))

      // Asset Class Performance
      const assetMap = new Map()
      trades.forEach(t => {
        if (!assetMap.has(t.asset_class)) {
          assetMap.set(t.asset_class, { name: t.asset_class, value: 0, trades: 0 })
        }
        const stats = assetMap.get(t.asset_class)
        stats.value += Number(t.pnl) || 0
        stats.trades += 1
      })
      setAssetClassStats(Array.from(assetMap.values()))

      // Strategy Performance
      const strategyMap = new Map()
      trades.forEach(t => {
        const strat = t.strategy || 'No Strategy'
        if (!strategyMap.has(strat)) {
          strategyMap.set(strat, { strategy: strat, pnl: 0, trades: 0 })
        }
        const stats = strategyMap.get(strat)
        stats.pnl += Number(t.pnl) || 0
        stats.trades += 1
      })
      setStrategyStats(Array.from(strategyMap.values()).sort((a, b) => b.pnl - a.pnl))

      // Model Performance
      const modelMap = new Map()
      trades.forEach(t => {
        const model = t.model || 'No Model'
        if (!modelMap.has(model)) {
          modelMap.set(model, { model, pnl: 0, trades: 0 })
        }
        const stats = modelMap.get(model)
        stats.pnl += Number(t.pnl) || 0
        stats.trades += 1
      })
      setModelStats(Array.from(modelMap.values()).sort((a, b) => b.pnl - a.pnl))
    }

    setLoading(false)
  }

  const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ef4444']

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading analysis...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Advanced Analysis</h1>
          <p className="text-gray-400 mt-2">Deep dive into your trading performance</p>
        </div>

        {/* Symbol Performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Performance by Symbol</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symbolStats.slice(0, 10)}>
              <XAxis dataKey="symbol" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="pnl" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Class Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Asset Class Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assetClassStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {assetClassStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Strategy Performance</h2>
            <div className="space-y-3">
              {strategyStats.slice(0, 5).map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{stat.strategy}</div>
                    <div className="text-sm text-gray-400">{stat.trades} trades</div>
                  </div>
                  <div className={`text-xl font-bold ${stat.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Model/Setup Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modelStats.map((stat, idx) => (
              <div key={idx} className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-bold text-theme-primary mb-2">{stat.model}</h3>
                <div className={`text-2xl font-bold mb-1 ${stat.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">{stat.trades} trades</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
