'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Target, TrendingUp, Award, Edit } from 'lucide-react'

export default function GoalsPage() {
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))
  const [goals, setGoals] = useState({
    profit_goal: 0,
    win_rate_goal: 0
  })
  const [performance, setPerformance] = useState({
    actualProfit: 0,
    actualWinRate: 0,
    totalTrades: 0,
    daysInMonth: 0,
    daysTraded: 0
  })
  const [editMode, setEditMode] = useState(false)
  const [tempGoals, setTempGoals] = useState({ profit_goal: '', win_rate_goal: '' })

  useEffect(() => {
    fetchGoals()
    fetchPerformance()
  }, [currentMonth])

  const fetchGoals = async () => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')

  console.log('GOALS RAW', data, error)

  const filtered = data?.filter(
    g => g.user_id === 'demo-user' && g.month.startsWith(currentMonth)
  )
  console.log('GOALS FILTERED', currentMonth, filtered)

  const goal = filtered && filtered[0]

  if (goal) {
    setGoals({
      profit_goal: Number(goal.profit_goal) || 0,
      win_rate_goal: Number(goal.win_rate_goal) || 0,
    })
    setTempGoals({
      profit_goal: goal.profit_goal?.toString() || '',
      win_rate_goal: goal.win_rate_goal?.toString() || '',
    })
  } else {
    setGoals({ profit_goal: 100, win_rate_goal: 25 })
    setTempGoals({ profit_goal: '100', win_rate_goal: '25' })
  }
}


    const fetchPerformance = async () => {
  setLoading(true)

  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')

  console.log('TRADES RAW', trades, error)

  const monthTrades = trades?.filter(t =>
    String(t.trade_date).startsWith(currentMonth)
  )

  console.log('MONTH TRADES', currentMonth, monthTrades?.length)

  const [year, month] = currentMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  if (monthTrades && monthTrades.length > 0) {
    const totalTrades = monthTrades.length
    const wins = monthTrades.filter(t => (Number(t.pnl) || 0) > 0).length
    const actualWinRate = (wins / totalTrades) * 100
    const actualProfit = monthTrades.reduce(
      (sum, t) => sum + (Number(t.pnl) || 0),
      0,
    )

    const uniqueDays = new Set(
      monthTrades.map(t => String(t.trade_date).slice(0, 10))
    ).size

    setPerformance({
      actualProfit,
      actualWinRate,
      totalTrades,
      daysInMonth,
      daysTraded: uniqueDays,
    })
  } else {
    setPerformance({
      actualProfit: 0,
      actualWinRate: 0,
      totalTrades: 0,
      daysInMonth,
      daysTraded: 0,
    })
  }

  setLoading(false)
}


  const saveGoals = async () => {
    const profitGoal = parseFloat(tempGoals.profit_goal) || 0
    const winRateGoal = parseFloat(tempGoals.win_rate_goal) || 0

    const { error } = await supabase
      .from('goals')
      .upsert({
        user_id: 'demo-user',
        month: currentMonth + '-01',
        profit_goal: profitGoal,
        win_rate_goal: winRateGoal
      }, {
        onConflict: 'user_id,month'
      })
    
    if (!error) {
      setGoals({ profit_goal: profitGoal, win_rate_goal: winRateGoal })
      setEditMode(false)
    }
  }
   console.log('currentMonth', currentMonth);
console.log('goals state', goals);
console.log('performance state', performance);

  const profitProgress = goals.profit_goal > 0 ? (performance.actualProfit / goals.profit_goal) * 100 : 0
  const winRateProgress = goals.win_rate_goal > 0 ? (performance.actualWinRate / goals.win_rate_goal) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Trading Goals</h1>
            <p className="text-gray-400 mt-2">Track your monthly trading targets</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <button 
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Goals
            </button>
          </div>
        </div>

        {/* Edit Goals Form */}
        {editMode && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Set Your Goals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Profit Goal ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={tempGoals.profit_goal}
                  onChange={(e) => setTempGoals({...tempGoals, profit_goal: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Win Rate Goal (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={tempGoals.win_rate_goal}
                  onChange={(e) => setTempGoals({...tempGoals, win_rate_goal: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={saveGoals}
                className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition"
              >
                Save Goals
              </button>
              <button 
                onClick={() => setEditMode(false)}
                className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Profit Goal */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Profit Goal</h3>
                <p className="text-sm text-gray-400">Monthly target</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-400">Current</div>
                  <div className={`text-3xl font-bold ${performance.actualProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${performance.actualProfit.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Goal</div>
                  <div className="text-2xl font-bold">${goals.profit_goal.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold">{Math.min(profitProgress, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${profitProgress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(profitProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 text-sm text-gray-400">
                {profitProgress >= 100 ? (
                  <span className="text-green-500 font-semibold">🎉 Goal achieved!</span>
                ) : (
                  <span>${(goals.profit_goal - performance.actualProfit).toFixed(2)} remaining</span>
                )}
              </div>
            </div>
          </div>

          {/* Win Rate Goal */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Win Rate Goal</h3>
                <p className="text-sm text-gray-400">Monthly target</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-400">Current</div>
                  <div className="text-3xl font-bold text-blue-500">
                    {performance.actualWinRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Goal</div>
                  <div className="text-2xl font-bold">{goals.win_rate_goal.toFixed(1)}%</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold">{Math.min(winRateProgress, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${winRateProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(winRateProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 text-sm text-gray-400">
                {winRateProgress >= 100 ? (
                  <span className="text-green-500 font-semibold">🎉 Goal achieved!</span>
                ) : (
                  <span>{performance.totalTrades} trades this month</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Monthly Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Trades</div>
              <div className="text-2xl font-bold">{performance.totalTrades}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Days Traded</div>
              <div className="text-2xl font-bold">{performance.daysTraded} / {performance.daysInMonth}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg Profit/Trade</div>
              <div className={`text-2xl font-bold ${performance.actualProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${performance.totalTrades > 0 ? (performance.actualProfit / performance.totalTrades).toFixed(2) : '0.00'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg Trades/Day</div>
              <div className="text-2xl font-bold">
                {performance.daysTraded > 0 ? (performance.totalTrades / performance.daysTraded).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

