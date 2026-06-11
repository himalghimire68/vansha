'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminCtx {
  adminKey: string
  onUnauthorized: () => void
}
const AdminContext = createContext<AdminCtx>({ adminKey: '', onUnauthorized: () => {} })
export const useAdmin = () => useContext(AdminContext)

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname()
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState('')
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setKey(sessionStorage.getItem('vansha-admin-key') || '')
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sessionStorage.setItem('vansha-admin-key', input.trim())
    setKey(input.trim())
    setErr('')
    setInput('')
  }

  const handleUnauthorized = () => {
    sessionStorage.removeItem('vansha-admin-key')
    setKey('')
    setErr('Invalid admin key — please try again.')
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('vansha-admin-key')
    setKey('')
    setErr('')
  }

  if (!mounted) return null

  if (!key) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="w-full max-w-sm px-4">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              🛡️
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Vansha Platform</p>
            <h1 className="text-2xl font-bold text-white">Developer Admin</h1>
          </div>

          <form onSubmit={handleLogin}
            className="rounded-2xl p-8 space-y-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {err && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {err}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter your admin key"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              Access Panel
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AdminContext.Provider value={{ adminKey: key, onUnauthorized: handleUnauthorized }}>
      <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>
        {/* Sidebar */}
        <aside
          className="w-60 flex-shrink-0 flex flex-col"
          style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Vansha</p>
            <p className="text-base font-bold text-white">Developer Admin</p>
          </div>

          <nav className="flex-1 p-4 space-y-0.5">
            <NavLink href="/admin" icon="📊" label="Dashboard" />
            <NavLink href="/admin/users" icon="👤" label="Users" />
            <NavLink href="/admin/families" icon="🏛️" label="Families" />
            <NavLink href="/admin/people" icon="👥" label="People" />
            <div className="pt-3 pb-1 px-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Content</p>
            </div>
            <NavLink href="/admin/gotras" icon="🪬" label="Gotras & Surnames" />
            <NavLink href="/admin/content" icon="✏️" label="Content" />
            <NavLink href="/admin/settings" icon="⚙️" label="Site Settings" />
          </nav>

          <div className="p-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to app
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 transition-colors w-full text-left"
            >
              🔒 Sign out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  )
}
