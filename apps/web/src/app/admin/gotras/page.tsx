'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAdmin } from '../admin-context'
import { adminApi, AdminGotra } from '@/lib/adminApi'

function SurnameList({
  surnames,
  onChange,
}: {
  surnames: string[]
  onChange: (s: string[]) => void
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newValue, setNewValue] = useState('')
  const editRef = useRef<HTMLInputElement>(null)

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditValue(surnames[idx])
    setTimeout(() => editRef.current?.focus(), 0)
  }

  const commitEdit = () => {
    if (editingIdx === null) return
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== surnames[editingIdx]) {
      onChange(surnames.map((s, i) => (i === editingIdx ? trimmed : s)))
    }
    setEditingIdx(null)
  }

  const remove = (idx: number) => {
    if (editingIdx === idx) setEditingIdx(null)
    onChange(surnames.filter((_, i) => i !== idx))
  }

  const add = () => {
    const trimmed = newValue.trim()
    if (!trimmed || surnames.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return
    onChange([...surnames, trimmed])
    setNewValue('')
  }

  return (
    <div>
      {/* Scrollable list */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        {surnames.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">No surnames yet</div>
        ) : (
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {surnames.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 group">
                {editingIdx === idx ? (
                  <>
                    <input
                      ref={editRef}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit()
                        if (e.key === 'Escape') setEditingIdx(null)
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none bg-blue-50"
                    />
                    <button
                      type="button"
                      onClick={commitEdit}
                      className="text-green-600 hover:text-green-700 text-sm font-bold px-1"
                      title="Save"
                    >
                      âœ“
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIdx(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm px-1"
                      title="Cancel"
                    >
                      âœ•
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-slate-800">{s}</span>
                    <button
                      type="button"
                      onClick={() => startEdit(idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all text-xs px-1"
                      title="Edit"
                    >
                      âœŽ
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs px-1"
                      title="Remove"
                    >
                      âœ•
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Add row pinned at bottom of the list box */}
        <div className="flex gap-0 border-t border-slate-100">
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder="Add surnameâ€¦"
            className="flex-1 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white placeholder-slate-400"
          />
          <button
            type="button"
            onClick={add}
            disabled={!newValue.trim()}
            className="px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-slate-100"
          >
            Add
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{surnames.length} surname{surnames.length !== 1 ? 's' : ''} Â· hover a row to edit or remove</p>
    </div>
  )
}

function GotraRow({
  gotra,
  adminKey,
  onSaved,
  onDeleted,
  onUnauthorized,
}: {
  gotra: AdminGotra
  adminKey: string
  onSaved: (g: AdminGotra) => void
  onDeleted: (id: string) => void
  onUnauthorized: () => void
}) {
  const [open, setOpen] = useState(false)
  const [english, setEnglish] = useState(gotra.gotra)
  const [nepali, setNepali] = useState(gotra.nepali)
  const [surnames, setSurnames] = useState<string[]>(gotra.surnames)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const isDirty =
    english.trim().toUpperCase() !== gotra.gotra ||
    nepali.trim() !== gotra.nepali ||
    JSON.stringify(surnames) !== JSON.stringify(gotra.surnames)

  const reset = () => {
    setEnglish(gotra.gotra)
    setNepali(gotra.nepali)
    setSurnames(gotra.surnames)
    setOpen(false)
  }

  const save = async () => {
    setSaving(true)
    setErr('')
    try {
      const updated = await adminApi.updateGotra(adminKey, gotra.id, {
        gotra: english.trim().toUpperCase(),
        nepali: nepali.trim(),
        surnames,
      })
      onSaved(updated)
      setOpen(false)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm(`Delete gotra "${gotra.gotra}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteGotra(adminKey, gotra.id)
      onDeleted(gotra.id)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 text-sm">{gotra.gotra}</span>
            {gotra.nepali && (
              <span className="ml-2 text-slate-500 text-xs">{gotra.nepali}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-400">{gotra.surnames.length} surnames</span>
          {isDirty && !open && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">unsaved</span>
          )}
          <span className="text-slate-400 text-xs">{open ? 'â–²' : 'â–¼'}</span>
        </div>
      </div>

      {/* Editor */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 space-y-5">
          {err && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{err}</div>
          )}

          {/* Names */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                English Name
              </label>
              <input
                value={english}
                onChange={e => setEnglish(e.target.value)}
                placeholder="e.g. KASYAP"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-400 uppercase placeholder:normal-case"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Nepali Name
              </label>
              <input
                value={nepali}
                onChange={e => setNepali(e.target.value)}
                placeholder="e.g. à¤•à¤¶à¥à¤¯à¤ª"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Surnames list */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Surnames / Caste Names
            </label>
            <SurnameList surnames={surnames} onChange={setSurnames} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={del}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete gotra
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Savingâ€¦' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminGotrasPage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [gotras, setGotras] = useState<AdminGotra[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [err, setErr] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newGotra, setNewGotra] = useState('')
  const [newNepali, setNewNepali] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getGotras(adminKey, { limit: 200 })
      .then(d => setGotras(d.items))
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr('Failed to load gotras.')
      })
      .finally(() => setLoading(false))
  }, [adminKey])

  useEffect(() => { if (adminKey) load() }, [adminKey])

  const filtered = search.trim()
    ? gotras.filter(g =>
        g.gotra.toLowerCase().includes(search.toLowerCase()) ||
        g.nepali.includes(search) ||
        g.surnames.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : gotras

  const handleSaved = (updated: AdminGotra) =>
    setGotras(prev => prev.map(g => g.id === updated.id ? updated : g))

  const handleDeleted = (id: string) =>
    setGotras(prev => prev.filter(g => g.id !== id))

  const handleAdd = async () => {
    if (!newGotra.trim() || !newNepali.trim()) return
    setAdding(true)
    try {
      const created = await adminApi.createGotra(adminKey, {
        gotra: newGotra.trim(),
        nepali: newNepali.trim(),
        surnames: [],
      })
      setGotras(prev => [...prev, created])
      setNewGotra('')
      setNewNepali('')
      setShowAdd(false)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr('Failed to create gotra.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gotras & Surnames</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {gotras.length} gotras Â· {gotras.reduce((n, g) => n + g.surnames.length, 0)} total surnames
          </p>
        </div>
        <button
          onClick={() => setShowAdd(o => !o)}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          + Add Gotra
        </button>
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
      )}

      {/* Add new gotra */}
      {showAdd && (
        <div className="mb-5 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">New Gotra</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">English Name</label>
              <input
                value={newGotra}
                onChange={e => setNewGotra(e.target.value)}
                placeholder="e.g. VASISHTHA"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400 uppercase placeholder:normal-case"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nepali Name</label>
              <input
                value={newNepali}
                onChange={e => setNewNepali(e.target.value)}
                placeholder="e.g. à¤µà¤¶à¤¿à¤·à¥à¤ "
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAdd(false); setNewGotra(''); setNewNepali('') }}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !newGotra.trim() || !newNepali.trim()}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {adding ? 'Creatingâ€¦' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by gotra name or surnameâ€¦"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">No gotras found</div>
          )}
          {filtered.map(g => (
            <GotraRow
              key={g.id}
              gotra={g}
              adminKey={adminKey}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              onUnauthorized={onUnauthorized}
            />
          ))}
        </div>
      )}
    </div>
  )
}
