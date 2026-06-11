'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../admin-context'
import { adminApi, AdminPerson, AdminFamily, Paginated } from '@/lib/adminApi'

const LIMIT = 20

export default function AdminPeoplePage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [data, setData] = useState<Paginated<AdminPerson> | null>(null)
  const [families, setFamilies] = useState<AdminFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [familyFilter, setFamilyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const [actionId, setActionId] = useState('')

  // Load all families for the filter dropdown once
  useEffect(() => {
    if (!adminKey) return
    adminApi.getFamilies(adminKey, { page: 1 })
      .then(d => setFamilies(d.items))
      .catch(e => { if (e.message === 'UNAUTHORIZED') onUnauthorized() })
  }, [adminKey])

  const load = useCallback((p = page, s = search, fid = familyFilter) => {
    setLoading(true)
    adminApi.getPeople(adminKey, { page: p, search: s, familyId: fid })
      .then(setData)
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr(e.message)
      })
      .finally(() => setLoading(false))
  }, [adminKey, page, search, familyFilter])

  useEffect(() => { if (adminKey) load() }, [adminKey])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load(1, search, familyFilter)
  }

  const handleFamilyChange = (fid: string) => {
    setFamilyFilter(fid)
    setPage(1)
    load(1, search, fid)
  }

  const handleDelete = async (p: AdminPerson) => {
    if (!confirm(`Delete "${p.firstName} ${p.lastName}" from ${p.familyName}? This is a soft delete.`)) return
    setActionId(p.id)
    try {
      await adminApi.deletePerson(adminKey, p.id)
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
    } finally { setActionId('') }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">People</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {data ? `${data.total} total` : 'â€”'} across all families
        </p>
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-5 flex flex-wrap gap-3">
        <select
          value={familyFilter}
          onChange={e => handleFamilyChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        >
          <option value="">All Families</option>
          {families.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or gotraâ€¦"
          className="flex-1 min-w-48 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
        <button type="submit"
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Search
        </button>
        {(search || familyFilter) && (
          <button type="button"
            onClick={() => { setSearch(''); setFamilyFilter(''); setPage(1); load(1, '', '') }}
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
              <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Family</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Gotra</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Added</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No people found</td>
              </tr>
            )}
            {!loading && data?.items.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">
                    {p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{p.id.slice(0, 8)}â€¦</p>
                </td>
                <td className="px-4 py-4 text-slate-600 text-xs">{p.familyName}</td>
                <td className="px-4 py-4 text-slate-500 text-xs">{p.gotra || 'â€”'}</td>
                <td className="px-4 py-4 text-center">
                  <span className="text-base">
                    {p.gender === 'male' ? 'â™‚' : p.gender === 'female' ? 'â™€' : 'âš§'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    p.isLiving ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.isLiving ? 'Living' : 'Ancestor'}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500 text-xs">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={actionId === p.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
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
            Showing {(page - 1) * LIMIT + 1}â€“{Math.min(page * LIMIT, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); load(p) }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              â† Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); load(p) }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next â†’
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
