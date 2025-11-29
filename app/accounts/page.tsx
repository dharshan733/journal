'use client'

import { useEffect, useState } from 'react'
import { supabase, Account } from '@/lib/supabase'
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    initial_balance: ''
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      const accountsWithStats = await Promise.all(
        data.map(async (account) => {
          const { data: trades } = await supabase
            .from('trades')
            .select('pnl')
            .eq('account_id', account.id)
          
          const totalPnL = trades?.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) || 0
          
          return {
            ...account,
            totalPnL,
            tradeCount: trades?.length || 0
          }
        })
      )
      setAccounts(accountsWithStats as any)
    }
    setLoading(false)
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const balance = parseFloat(newAccount.initial_balance)
    
    const { error } = await supabase.from('accounts').insert({
      user_id: 'demo-user',
      name: newAccount.name,
      initial_balance: balance,
      current_balance: balance
    })
    
    if (!error) {
      setNewAccount({ name: '', initial_balance: '' })
      setShowAddForm(false)
      fetchAccounts()
    } else {
      alert('Error adding account: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading accounts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Accounts</h1>
            <p className="text-gray-400 mt-2">Track multiple trading accounts</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Account
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Add New Account</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Name</label>
                <input 
                  type="text"
                  placeholder="e.g., My Prop Firm Account"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Initial Balance</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="10000"
                  value={newAccount.initial_balance}
                  onChange={(e) => setNewAccount({...newAccount, initial_balance: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition"
                >
                  Add Account
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account: any) => (
            <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{account.name}</h3>
                    <p className="text-sm text-gray-400">{account.tradeCount} trades</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Current Balance</div>
                  <div className="text-3xl font-bold">${account.current_balance.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
                  <div>
                    <div className="text-sm text-gray-400">Initial Balance</div>
                    <div className="text-lg font-semibold">${account.initial_balance.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Trading P&L</div>
                    <div className={`text-lg font-semibold flex items-center gap-1 ${account.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {account.totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      ${account.totalPnL.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
                <Link href={`/trades?account=${account.id}`} className="flex-1">
                  <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm font-semibold">
                    View Trades
                  </button>
                </Link>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No accounts yet</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition"
            >
              Add Your First Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
