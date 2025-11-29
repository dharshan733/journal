'use client'

import { useEffect, useState } from 'react'
import { supabase, Trade } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'symbol'>('date')

  useEffect(() => {
    fetchTrades()
  }, [sortBy])

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order(sortBy === 'date' ? 'trade_date' : sortBy, { ascending: false })

    if (data) setTrades(data as Trade[])
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trade History</h1>
            <p className="text-gray-400 mt-2">Review and analyze your past trades.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-sm"
            >
              <option value="date">Sort by: Date</option>
              <option value="pnl">Sort by: P&L</option>
              <option value="symbol">Sort by: Symbol</option>
            </select>
            <Link href="/trades/new">
              <Button className="bg-purple-500 text-black hover:bg-purple-600 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Trade
              </Button>
            </Link>
          </div>
        </div>

        {/* Trade cards with images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trades.map(trade => {
            // Handle both text and text[] for images column
            const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this trade?')) return

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Failed to delete trade: ' + error.message)
  } else {
    // refresh list
    fetchTrades()
  }
}
            const imageUrl = Array.isArray((trade as any).images) 
              ? (trade as any).images[0] 
              : (trade as any).images

            return (
              <Card key={trade.id} className="bg-gray-900 border border-gray-800">
                <CardContent className="p-4 flex gap-4">
                  {/* Image thumbnail */}
                  <div className="w-24 h-24 bg-gray-950 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Trade screenshot"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">No Image</span>
                    )}
                  </div>

                  {/* Trade info */}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-lg text-white font-semibold">
                        {trade.symbol} · {trade.trade_type.toUpperCase()}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          (trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        ${(trade.pnl || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      {trade.trade_date}{' '}
                      · {trade.asset_class.toUpperCase()} · Size {trade.position_size}
                    </div>

                    {trade.strategy && (
                      <div className="text-xs text-purple-400">Strategy: {trade.strategy}</div>
                    )}

                    {trade.model && (
                      <div className="text-xs text-blue-400">Model: {trade.model}</div>
                    )}

                    {trade.post_trade_reflection && (
                      <div className="text-xs text-gray-300 line-clamp-2">
                        {trade.post_trade_reflection}
                      </div>
                    )}
                      <div className="px-4 pb-4 flex justify-end">
    <button
      onClick={() => handleDelete(trade.id as string)}
      className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Delete
    </button>
  </div>

                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {trades.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No trades yet.{' '}
            <Link href="/trades/new" className="text-purple-400 underline">
              Add your first trade.
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
