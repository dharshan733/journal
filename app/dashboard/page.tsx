'use client'

import { useEffect, useState } from 'react'
import { supabase, Account, Trade } from '@/lib/supabase'
import { DollarSign, TrendingUp, Target, Award } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    netPnL: 0,
    winRate: 0,
    avgRR: 0,
    totalTrades: 0,
    wins: 0,
    losses: 0
  })
  const [cumulativePnL, setCumulativePnL] = useState<any[]>([])
  const [calendarData, setCalendarData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    const { data: accountsData, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (accountsError) {
      console.error('Accounts error:', accountsError)
    }
    
    if (accountsData) {
      setAccounts(accountsData)
    }

    const { data: tradesData, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .order('trade_date', { ascending: true })
    
    if (tradesError) {
      console.error('Trades error:', tradesError)
    }
    
    if (tradesData) {
      setTrades(tradesData)
      calculateStats(tradesData)
      calculateCumulativePnL(tradesData)
      calculateCalendarData(tradesData)
    }
    
    setLoading(false)
  }

  const calculateStats = (tradesData: Trade[]) => {
    const totalTrades = tradesData.length
    const tradesWithPnL = tradesData.filter(t => t.pnl !== null && t.pnl !== undefined)
    const wins = tradesWithPnL.filter(t => Number(t.pnl) > 0).length
    const losses = tradesWithPnL.filter(t => Number(t.pnl) < 0).length
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
    const netPnL = tradesWithPnL.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
    const tradesWithRR = tradesData.filter(t => t.risk_reward !== null && t.risk_reward !== undefined)
    const avgRR = tradesWithRR.length > 0
      ? tradesWithRR.reduce((sum, t) => sum + (Number(t.risk_reward) || 0), 0) / tradesWithRR.length
      : 0

    setStats({ netPnL, winRate, avgRR, totalTrades, wins, losses })
  }

  const calculateCumulativePnL = (tradesData: Trade[]) => {
    let cumulative = 0
    const data = tradesData
      .filter(t => t.pnl !== null && t.pnl !== undefined)
      .map(trade => {
        cumulative += Number(trade.pnl) || 0
        return {
          date: format(parseISO(trade.trade_date), 'MMM dd'),
          pnl: cumulative
        }
      })
    setCumulativePnL(data)
  }

  const calculateCalendarData = (tradesData: Trade[]) => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const dailyPnL = new Map<string, number>()
    tradesData.forEach(trade => {
      const date = trade.trade_date
      const pnl = Number(trade.pnl) || 0
      dailyPnL.set(date, (dailyPnL.get(date) || 0) + pnl)
    })

    const calendar = daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const pnl = dailyPnL.get(dateStr) || 0
      return {
        day: format(day, 'd'),
        dayName: format(day, 'EEE'),
        pnl,
        color: pnl > 0 ? 'green' : pnl < 0 ? 'red' : 'gray'
      }
    })

    setCalendarData(calendar)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#22c55e' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="space-x-3">
            <Link href="/trades/new">
              <button className="px-4 py-2 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition">
                + Add Trade
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                Home
              </button>
            </Link>
          </div>
        </div>

        {/* Account Balance Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="text-sm text-gray-400 mb-2">{accounts[0]?.name || 'No Account'}</div>
          <div className="text-4xl font-bold mb-2">
            ${accounts[0]?.current_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500">Current Balance</div>
          <div className={`text-lg mt-2 ${stats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${stats.netPnL.toFixed(2)} ({stats.netPnL >= 0 ? '+' : ''}{((stats.netPnL / (accounts[0]?.initial_balance || 1)) * 100).toFixed(2)}%)
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Net P&L</div>
              <DollarSign className="h-5 w-5 text-gray-500" />
            </div>
            <div className={`text-3xl font-bold ${stats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${stats.netPnL.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-2">Over {stats.totalTrades} trades</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Win Rate</div>
              <Target className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-2">{stats.wins}W / {stats.losses}L</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Avg R:R</div>
              <TrendingUp className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-3xl font-bold">{stats.avgRR.toFixed(2)}R</div>
            <div className="text-xs text-gray-500 mt-2">Risk/Reward Ratio</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Total Trades</div>
              <Award className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-3xl font-bold">{stats.totalTrades}</div>
            <div className="text-xs text-gray-500 mt-2">Trades logged</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cumulative P&L Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Cumulative P&L</h2>
            {cumulativePnL.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cumulativePnL}>
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="pnl" stroke="#eab308" strokeWidth={2} dot={{ fill: '#eab308' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No trade data yet
              </div>
            )}
          </div>

          {/* Win/Loss Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Win/Loss Distribution</h2>
            {stats.totalTrades > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Wins: {stats.wins}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Losses: {stats.losses}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No trade data yet
              </div>
            )}
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">This Month's P&L Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>
                <div 
                  className={`h-12 rounded flex flex-col items-center justify-center text-sm font-semibold ${
                    day.pnl > 0 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : day.pnl < 0 
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  <div>{day.day}</div>
                  {day.pnl !== 0 && <div className="text-xs">${day.pnl.toFixed(0)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Trades</h2>
            <Link href="/trades" className="text-purple-500 hover:text-purple-400">
              View All →
            </Link>
          </div>
          
          {trades.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No trades recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {trades.slice(0, 5).reverse().map(trade => (
                <div key={trade.id} className="flex justify-between items-center p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-gray-700 transition">
                  <div>
                    <div className="font-semibold text-lg">{trade.symbol}</div>
                    <div className="text-sm text-gray-400">
                      {trade.trade_date} • {trade.trade_type.toUpperCase()}
                      {trade.strategy && ` • ${trade.strategy}`}
                      {trade.model && ` • ${trade.model}`}
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${(Number(trade.pnl) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(Number(trade.pnl) || 0) >= 0 ? '+' : ''}${(Number(trade.pnl) || 0).toFixed(2)}
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
