'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../layout'
import { adminApi, AdminFamily, Paginated } from '@/lib/adminApi'

const LIMIT = 20

export default function AdminFamiliesPage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [data, setData] = useState<Paginated<AdminFamily> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const [actionId, setActionId] = useState('')

  const load = useCallback((p = page, s = search) => {
    setLoading(true)
    adminApi.getFamilies(adminKey, { page: p, search: s })
      .then(setData)
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr(e.message)
      })
      .finally(() => setLoading(false))
  }, [adminKey, page, search])

  useEffect(() => { if (adminKey) load() }, [adminKey])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  const handleToggle = async (f: AdminFamily) => {
    setActionId(f.id)
    try {
      await adminApi.patchFamily(adminKey, f.id, { isActive: !f.isActive })
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
    } finally { setActionId('') }
  }

  const handleDelete = async (f: AdminFamily) => {
    if (!confirm(`Permanently delete "${f.name}"? This soft-deletes the family and all its data.`)) return
    setActionId(f.id)
    try {
      await adminApi.deleteFamily(adminKey, f.id)
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
    } finally { setActionId('') }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Families</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} total` : '—'}
          </p>
        </div>
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, village…"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
        <button type="submit"
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setPage(1); load(1, '') }}
            className="px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Family</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Village</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Members</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No families found</td>
              </tr>
            )}
            {!loading && data?.items.map(f => (
              <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{f.id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {[f.ancestralVillage, f.ancestralDistrict].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {f.peopleCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {f.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500 text-xs">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggle(f)}
                      disabled={actionId === f.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {f.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(f)}
                      disabled={actionId === f.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); load(p) }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); load(p) }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
