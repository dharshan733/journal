'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-purple-500">
            Trading Journal
          </h1>
          <p className="text-2xl text-gray-400">
            Where Average Stops, And Growth Begins.
          </p>
        </div>
        
        <p className="text-lg text-gray-300">
          Track your trades, analyze performance, and grow as a trader with comprehensive journaling tools.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link 
            href="/dashboard" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-purple-500 transition group"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500">Dashboard</h3>
            <p className="text-sm text-gray-400">View your trading statistics and performance</p>
          </Link>

          <Link 
            href="/trades" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-purple-500 transition group"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500">Trade Log</h3>
            <p className="text-sm text-gray-400">Review all your past trades</p>
          </Link>

          <Link 
            href="/trades/new" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-purple-500 transition group"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500">Add Trade</h3>
            <p className="text-sm text-gray-400">Log a new trade with details</p>
          </Link>

          <Link 
            href="/insights" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-purple-500 transition group"
          >
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500">Insights</h3>
            <p className="text-sm text-gray-400">Analyze your trading patterns</p>
          </Link>
        </div>

        <div className="mt-12">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-purple-500 text-black font-bold text-lg rounded-lg hover:bg-purple-600 transition shadow-lg shadow-purple-500/20">
              Get Started →
            </button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 space-y-2">
          <p>✅ Track multiple accounts</p>
          <p>✅ Calculate P&L automatically</p>
          <p>✅ Analyze win rate and risk/reward</p>
          <p>✅ Cloud sync across devices</p>
        </div>
      </div>
    </div>
  )
}
