'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from './layout'
import { adminApi, AdminStats } from '@/lib/adminApi'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: color + '20' }}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!adminKey) return
    adminApi.stats(adminKey)
      .then(setStats)
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr(e.message)
      })
      .finally(() => setLoading(false))
  }, [adminKey])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview — Vansha</p>
      </div>

      {err && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse h-32" />
          ))}
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <StatCard icon="🏛️" label="Total Families" value={stats.totalFamilies} color="#3b82f6" />
            <StatCard icon="👥" label="Family Members" value={stats.totalPeople} color="#10b981" />
            <StatCard icon="👤" label="Users" value={stats.totalUsers} sub={`${stats.activeUsers} active`} color="#f59e0b" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard icon="✅" label="Approvals" value={stats.totalApprovals} color="#8b5cf6" />
            <StatCard
              icon="⏳"
              label="Pending Approvals"
              value={stats.pendingApprovals}
              sub={stats.pendingApprovals > 0 ? 'Needs attention' : 'All clear'}
              color={stats.pendingApprovals > 0 ? '#ef4444' : '#10b981'}
            />
          </div>
        </>
      )}

      {/* Recent data */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent families */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Recent Families</h2>
              <Link href="/admin/families" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentFamilies.length === 0 && (
                <p className="px-6 py-8 text-sm text-slate-400 text-center">No families yet</p>
              )}
              {stats.recentFamilies.map(f => (
                <div key={f.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                    {f.ancestralVillage && (
                      <p className="text-xs text-slate-400">{f.ancestralVillage}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent people */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Recent Members</h2>
              <Link href="/admin/people" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentPeople.length === 0 && (
                <p className="px-6 py-8 text-sm text-slate-400 text-center">No members yet</p>
              )}
              {stats.recentPeople.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{p.familyName}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    p.isLiving ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.isLiving ? 'Living' : 'Ancestor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
