import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, BookText, TrendingUp, FlaskConical, Target, Settings, Users, Wallet } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trading Journal Dashboard',
  description: 'Track your trading performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={inter.className}>
        <div className="flex h-screen bg-black text-white">
          <aside className="w-64 border-r border-purple-800 bg-gray-950 flex flex-col">
            <div className="p-6 border-b border-purple-800">
              <h2 className="text-2xl font-bold text-purple-500">The Trading Journal</h2>
              <p className="text-xs text-gray-400 mt-1">Where Average Stops, And Growth Begins.</p>
            </div>
            
            <nav className="flex-1 px-3 py-6 space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <LayoutDashboard className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Dashboard</span>
              </Link>
              
              <Link 
                href="/accounts" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <Wallet className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Accounts</span>
              </Link>
              
              <Link 
                href="/journal" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Daily Journal</span>
              </Link>
              
              <Link 
                href="/trades" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <BookText className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Trade Log</span>
              </Link>
              
              <Link 
                href="/insights" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Insights</span>
              </Link>
              
              <Link 
                href="/analysis" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <FlaskConical className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Analysis</span>
              </Link>
              
              <Link 
                href="/goals" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors group"
              >
                <Target className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                <span className="group-hover:text-purple-500">Goals</span>
              </Link>
              
              
               
              
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-black">
                  U
                </div>
                <div>
                  <div className="text-sm font-semibold">Demo User</div>
                  <div className="text-xs text-purple-400">demo@trader.com</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-black">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
