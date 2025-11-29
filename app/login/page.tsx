'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Logged in!')
      window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4 w-80">
        <h1 className="text-xl font-bold">Login</h1>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
