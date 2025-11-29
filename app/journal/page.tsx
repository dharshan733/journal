'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react'

interface JournalEntry {
  id: string
  entry_date: string
  market_events?: any
  symbols_analysis?: any
  performance_context?: string
  journal_sections?: any
  created_at: string
  updated_at: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    market_conditions: '',
    key_events: '',
    symbols_watched: '',
    trades_taken: '',
    what_went_well: '',
    what_to_improve: '',
    lessons_learned: '',
    emotional_state: '',
    tomorrow_plan: ''
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .order('entry_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching entries:', error)
    }
    
    if (data) setEntries(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const journalData = {
      user_id: 'demo-user',
      entry_date: formData.entry_date,
      market_events: {
        conditions: formData.market_conditions,
        key_events: formData.key_events
      },
      symbols_analysis: {
        watched: formData.symbols_watched,
        trades_taken: formData.trades_taken
      },
      performance_context: formData.what_went_well,
      journal_sections: {
        improvements: formData.what_to_improve,
        lessons: formData.lessons_learned,
        emotions: formData.emotional_state,
        tomorrow: formData.tomorrow_plan
      },
      updated_at: new Date().toISOString()
    }

    if (editingEntry) {
      // Update existing entry
      const { error } = await supabase
        .from('daily_entries')
        .update(journalData)
        .eq('id', editingEntry.id)
      
      if (error) {
        console.error('Update error:', error)
        alert('Failed to update entry: ' + error.message)
      } else {
        alert('Entry updated successfully!')
        fetchEntries()
        resetForm()
      }
    } else {
      // Create new entry
      const { error } = await supabase
        .from('daily_entries')
        .insert(journalData)
      
      if (error) {
        console.error('Insert error:', error)
        if (error.code === '23505') {
          alert('You already have an entry for this date. Please edit the existing one.')
        } else {
          alert('Failed to save entry: ' + error.message)
        }
      } else {
        alert('Entry saved successfully!')
        fetchEntries()
        resetForm()
      }
    }

    setSaving(false)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      entry_date: entry.entry_date,
      market_conditions: entry.market_events?.conditions || '',
      key_events: entry.market_events?.key_events || '',
      symbols_watched: entry.symbols_analysis?.watched || '',
      trades_taken: entry.symbols_analysis?.trades_taken || '',
      what_went_well: entry.performance_context || '',
      what_to_improve: entry.journal_sections?.improvements || '',
      lessons_learned: entry.journal_sections?.lessons || '',
      emotional_state: entry.journal_sections?.emotions || '',
      tomorrow_plan: entry.journal_sections?.tomorrow || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    const { error } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      alert('Entry deleted!')
      fetchEntries()
    }
  }

  const resetForm = () => {
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      market_conditions: '',
      key_events: '',
      symbols_watched: '',
      trades_taken: '',
      what_went_well: '',
      what_to_improve: '',
      lessons_learned: '',
      emotional_state: '',
      tomorrow_plan: ''
    })
    setShowForm(false)
    setEditingEntry(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading journal...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Daily Journal</h1>
            <p className="text-gray-400 mt-2">Reflect on your trading day</p>
          </div>
          <button 
            onClick={() => {
              if (showForm) {
                resetForm()
              } else {
                setShowForm(true)
              }
            }}
            className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Cancel' : 'New Entry'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input 
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Market Conditions</label>
                  <textarea 
                    placeholder="Trending, Ranging, Volatile..."
                    value={formData.market_conditions}
                    onChange={(e) => setFormData({...formData, market_conditions: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Key Events / News</label>
                  <textarea 
                    placeholder="Fed decision, NFP data, earnings..."
                    value={formData.key_events}
                    onChange={(e) => setFormData({...formData, key_events: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Symbols Watched</label>
                  <textarea 
                    placeholder="EURUSD, GBPUSD, NQ..."
                    value={formData.symbols_watched}
                    onChange={(e) => setFormData({...formData, symbols_watched: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trades Taken</label>
                  <textarea 
                    placeholder="List of trades you took today..."
                    value={formData.trades_taken}
                    onChange={(e) => setFormData({...formData, trades_taken: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What Went Well Today?</label>
                <textarea 
                  placeholder="Good entries, patience, followed rules..."
                  value={formData.what_went_well}
                  onChange={(e) => setFormData({...formData, what_went_well: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What Could Be Improved?</label>
                <textarea 
                  placeholder="Mistakes made, rules broken, areas to work on..."
                  value={formData.what_to_improve}
                  onChange={(e) => setFormData({...formData, what_to_improve: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Lessons Learned</label>
                <textarea 
                  placeholder="Important insights and takeaways..."
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({...formData, lessons_learned: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emotional State & Psychology</label>
                <textarea 
                  placeholder="How did you feel? Were you disciplined, fearful, greedy?..."
                  value={formData.emotional_state}
                  onChange={(e) => setFormData({...formData, emotional_state: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plan for Tomorrow</label>
                <textarea 
                  placeholder="What setups to watch, what to focus on..."
                  value={formData.tomorrow_plan}
                  onChange={(e) => setFormData({...formData, tomorrow_plan: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Entry')}
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No journal entries yet</p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition"
              >
                Create Your First Entry
              </button>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{new Date(entry.entry_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(entry)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 bg-gray-800 hover:bg-red-900 rounded-lg transition text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {entry.market_events?.conditions && (
                    <div>
                      <div className="text-gray-400 font-semibold mb-1">📊 Market Conditions:</div>
                      <div className="text-gray-300">{entry.market_events.conditions}</div>
                    </div>
                  )}

                  {entry.performance_context && (
                    <div>
                      <div className="text-green-400 font-semibold mb-1">✅ What Went Well:</div>
                      <div className="text-gray-300">{entry.performance_context}</div>
                    </div>
                  )}

                  {entry.journal_sections?.improvements && (
                    <div>
                      <div className="text-purple-400 font-semibold mb-1">⚠️ To Improve:</div>
                      <div className="text-gray-300">{entry.journal_sections.improvements}</div>
                    </div>
                  )}

                  {entry.journal_sections?.lessons && (
                    <div>
                      <div className="text-blue-400 font-semibold mb-1">💡 Lessons Learned:</div>
                      <div className="text-gray-300">{entry.journal_sections.lessons}</div>
                    </div>
                  )}

                  {entry.journal_sections?.emotions && (
                    <div>
                      <div className="text-purple-400 font-semibold mb-1">🧠 Emotional State:</div>
                      <div className="text-gray-300">{entry.journal_sections.emotions}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
