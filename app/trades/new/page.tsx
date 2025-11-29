'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTradePage() {
  const router = useRouter()

  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    account_id: '',
    symbol: '',
    asset_class: 'forex',
    trade_type: 'long',
    entry_price: '',
    exit_price: '',
    stop_loss: '',
    take_profit: '',
    position_size: '',
    pnl: '',
    risk_reward: '',
    strategy: '',
    model: '',
    trade_date: new Date().toISOString().split('T')[0],
    before_trade_notes: '',
    post_trade_reflection: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)

  // STEP 4: get authenticated user first, then fetch accounts
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        // not logged in → send to login
        window.location.href = '/login'
        return
      }
      setUserId(data.user.id)
      await fetchAccounts()
    }

    init()
  }, [])

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      setAccounts(data)
      setFormData(prev => ({ ...prev, account_id: data[0].id }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!userId) {
      alert('Not logged in')
      setLoading(false)
      return
    }

    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`
      const filePath = `screenshots/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('trade-images') // bucket name
        .upload(filePath, imageFile)

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('trade-images')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData?.publicUrl || null
    }

    const tradeData = {
      user_id: userId, // IMPORTANT: real user id from auth
      account_id: formData.account_id,
      symbol: formData.symbol.toUpperCase(),
      asset_class: formData.asset_class,
      trade_type: formData.trade_type,
      entry_price: parseFloat(formData.entry_price),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
      position_size: parseFloat(formData.position_size),
      pnl: formData.pnl ? parseFloat(formData.pnl) : null,
      risk_reward: formData.risk_reward ? parseFloat(formData.risk_reward) : null,
      strategy: formData.strategy || null,
      model: formData.model || null,
      trade_date: formData.trade_date,
      before_trade_notes: formData.before_trade_notes || null,
      post_trade_reflection: formData.post_trade_reflection || null,
      images: imageUrl ? [imageUrl] : null,

    }

    const { error } = await supabase.from('trades').insert(tradeData)

    if (error) {
      alert('Error saving trade: ' + error.message)
      setLoading(false)
    } else {
      alert('Trade saved successfully!')
      setImageFile(null)
      router.push('/trades')
    }
  }

  if (!userId) {
    // waiting for auth check
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Checking session...</div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg">No accounts yet.</p>
          <Link
            href="/accounts"
            className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition"
          >
            Create an account first
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/trades"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Add New Trade</h1>
        <p className="text-gray-400 mb-8">Log a new trade with full details.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          {/* Account */}
          <div>
            <label className="block text-sm font-medium mb-2">Account *</label>
            <select
              value={formData.account_id}
              onChange={e =>
                setFormData({ ...formData, account_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Symbol / Asset / Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Symbol *</label>
              
              <input
                type="text"
                value={formData.symbol}
                onChange={e =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Class *
              </label>
              <select
                value={formData.asset_class}
                onChange={e =>
                  setFormData({ ...formData, asset_class: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              >
                <option value="forex">Forex</option>
                <option value="futures">Futures</option>
                <option value="stocks">Stocks</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Trade Type *
              </label>
              <select
                value={formData.trade_type}
                onChange={e =>
                  setFormData({ ...formData, trade_type: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Price *
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.entry_price}
                onChange={e =>
                  setFormData({ ...formData, entry_price: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Exit Price
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.exit_price}
                onChange={e =>
                  setFormData({ ...formData, exit_price: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.stop_loss}
                onChange={e =>
                  setFormData({ ...formData, stop_loss: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Take Profit
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.take_profit}
                onChange={e =>
                  setFormData({ ...formData, take_profit: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Size / PnL / RR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Position Size *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.position_size}
                onChange={e =>
                  setFormData({ ...formData, position_size: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">P&L</label>
              <input
                type="number"
                step="0.01"
                value={formData.pnl}
                onChange={e =>
                  setFormData({ ...formData, pnl: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Risk / Reward
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.risk_reward}
                onChange={e =>
                  setFormData({ ...formData, risk_reward: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Strategy / Model / Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Strategy</label>
              <input
                type="text"
                value={formData.strategy}
                onChange={e =>
                  setFormData({ ...formData, strategy: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Model / Setup
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={e =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Trade Date *
              </label>
              <input
                type="date"
                value={formData.trade_date}
                onChange={e =>
                  setFormData({ ...formData, trade_date: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Before Trade Notes
            </label>
            <textarea
              value={formData.before_trade_notes}
              onChange={e =>
                setFormData({
                  ...formData,
                  before_trade_notes: e.target.value,
                })
              }
              rows={4}
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Post-Trade Reflection
            </label>
            <textarea
              value={formData.post_trade_reflection}
              onChange={e =>
                setFormData({
                  ...formData,
                  post_trade_reflection: e.target.value,
                })
              }
              rows={4}
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Trade Screenshot
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setImageFile(file)
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-black hover:file:bg-purple-600"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Trade'}
            </button>
            <Link
              href="/trades"
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
