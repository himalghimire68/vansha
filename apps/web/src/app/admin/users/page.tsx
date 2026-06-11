'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../layout'
import { adminApi, AdminUser } from '@/lib/adminApi'

const LIMIT = 20

const ROLES = ['member', 'viewer', 'contributor', 'elder', 'admin']
const STATUSES = ['active', 'suspended', 'pending']

const ROLE_COLORS: Record<string, string> = {
  admin:       'bg-purple-100 text-purple-700',
  elder:       'bg-amber-100 text-amber-700',
  contributor: 'bg-blue-100 text-blue-700',
  member:      'bg-slate-100 text-slate-700',
  viewer:      'bg-slate-50 text-slate-500',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  pending:   'bg-yellow-100 text-yellow-700',
}

function Badge({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${colorClass}`}>
      {text}
    </span>
  )
}

// ── Create/Edit modal ──────────────────────────────────────────────────────
interface UserFormProps {
  initial?: AdminUser | null
  onClose: () => void
  onSaved: (u: AdminUser) => void
  adminKey: string
  onUnauthorized: () => void
}

function UserForm({ initial, onClose, onSaved, adminKey, onUnauthorized }: UserFormProps) {
  const isEdit = !!initial
  const [email, setEmail]     = useState(initial?.email || '')
  const [firstName, setFirst] = useState(initial?.firstName || '')
  const [lastName, setLast]   = useState(initial?.lastName || '')
  const [phone, setPhone]     = useState(initial?.phone || '')
  const [role, setRole]       = useState(initial?.role || 'member')
  const [status, setStatus]   = useState(initial?.status || 'active')
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setErr('Email is required.'); return }
    setSaving(true)
    setErr('')
    try {
      const payload = { email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), role, status }
      const saved = isEdit
        ? await adminApi.updateUser(adminKey, initial!.id, payload)
        : await adminApi.createUser(adminKey, payload)
      if ('error' in saved) { setErr((saved as any).error); return }
      onSaved(saved as AdminUser)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {err && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 break-all">{err}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirst(e.target.value)}
                placeholder="First"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLast(e.target.value)}
                placeholder="Last"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+977-..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400"
              >
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [data, setData] = useState<{ items: AdminUser[]; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const [actionId, setActionId] = useState('')
  const [modal, setModal] = useState<'create' | AdminUser | null>(null)

  const load = useCallback((p = page, s = search, sf = statusFilter, rf = roleFilter) => {
    setLoading(true)
    adminApi.getUsers(adminKey, { page: p, search: s, status: sf, role: rf })
      .then(d => setData({ items: d.items, total: d.total }))
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr(e.message)
      })
      .finally(() => setLoading(false))
  }, [adminKey, page, search, statusFilter, roleFilter])

  useEffect(() => { if (adminKey) load() }, [adminKey])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load(1, search, statusFilter, roleFilter)
  }

  const handleSaved = (u: AdminUser) => {
    setModal(null)
    load()
  }

  const handleReset = async (u: AdminUser) => {
    if (!confirm(`Reset all settings for "${u.email}"? This clears their saved preferences.`)) return
    setActionId(u.id)
    try {
      await adminApi.resetUserSettings(adminKey, u.id)
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr(e.message)
    } finally { setActionId('') }
  }

  const handleToggleStatus = async (u: AdminUser) => {
    const next = u.status === 'active' ? 'suspended' : 'active'
    setActionId(u.id)
    try {
      await adminApi.updateUser(adminKey, u.id, { status: next })
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr(e.message)
    } finally { setActionId('') }
  }

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Permanently remove "${u.email}"? This is a soft delete.`)) return
    setActionId(u.id)
    try {
      await adminApi.deleteUser(adminKey, u.id)
      load()
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
    } finally { setActionId('') }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {modal && (
        <UserForm
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          adminKey={adminKey}
          onUnauthorized={onUnauthorized}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} total` : '—'} registered users
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          + Create User
        </button>
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono break-all">{err}</div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-5 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value, roleFilter) }}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); load(1, search, statusFilter, e.target.value) }}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-48 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 shadow-sm"
        />
        <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Search
        </button>
        {(search || statusFilter || roleFilter) && (
          <button type="button"
            onClick={() => { setSearch(''); setStatusFilter(''); setRoleFilter(''); setPage(1); load(1, '', '', '') }}
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
              <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Last Login</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && [...Array(8)].map((_, i) => (
              <tr key={i}>
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No users found</td>
              </tr>
            )}
            {!loading && data?.items.map(u => (
              <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.deletedAt ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">
                    {u.firstName || u.lastName
                      ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                      : <span className="text-slate-400 italic">No name</span>
                    }
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  {u.phone && <p className="text-xs text-slate-400 mt-0.5">{u.phone}</p>}
                </td>
                <td className="px-4 py-4 text-center">
                  <Badge text={u.role} colorClass={ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'} />
                </td>
                <td className="px-4 py-4 text-center">
                  <Badge text={u.status} colorClass={STATUS_COLORS[u.status] || 'bg-slate-100 text-slate-600'} />
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setModal(u)}
                      disabled={actionId === u.id}
                      title="Edit user"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={actionId === u.id}
                      title={u.status === 'active' ? 'Suspend user' : 'Activate user'}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-colors ${
                        u.status === 'active'
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleReset(u)}
                      disabled={actionId === u.id}
                      title="Reset user settings"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={actionId === u.id}
                      title="Delete user"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
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
