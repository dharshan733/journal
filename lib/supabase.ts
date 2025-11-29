import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Account {
  id: string
  user_id: string
  name: string
  initial_balance: number
  current_balance: number
  created_at: string
  updated_at: string
  
}

export interface Trade {
  id: string
  account_id: string
  user_id: string
  symbol: string
  asset_class: 'futures' | 'forex' | 'stocks' | 'crypto'
  trade_type: 'long' | 'short'
  entry_price: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  position_size: number
  pnl?: number
  risk_reward?: number
  strategy?: string
  tags?: string[]
  trade_date: string
  entry_time?: string
  exit_time?: string
  images?: string[]
  before_trade_notes?: string
  post_trade_reflection?: string
  created_at: string
  updated_at: string
  model?: string
}

export interface DailyEntry {
  id: string
  user_id: string
  entry_date: string
  market_events?: any
  symbols_analysis?: any
  performance_context?: string
  journal_sections?: any
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  month: string
  profit_goal?: number
  win_rate_goal?: number
  created_at: string
  updated_at: string
}
