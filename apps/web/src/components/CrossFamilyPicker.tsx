'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, ApiFamily, ApiPerson } from '@/lib/api'

// Reuse generation builder logic (duplicated here to keep component self-contained)
function calcGenerations(people: ApiPerson[]): Map<string, number> {
  const map = new Map(people.map(p => [p.id, p]))
  const genMap = new Map<string, number>()

  for (const p of people) {
    if ((!p.fatherId || !map.has(p.fatherId)) && (!p.motherId || !map.has(p.motherId))) {
      genMap.set(p.id, 0)
    }
  }
  let changed = true
  while (changed) {
    changed = false
    for (const p of people) {
      let max = -1
      if (p.fatherId && genMap.has(p.fatherId)) max = Math.max(max, genMap.get(p.fatherId)!)
      if (p.motherId && genMap.has(p.motherId)) max = Math.max(max, genMap.get(p.motherId)!)
      if (max >= 0 && (genMap.get(p.id) ?? -1) < max + 1) {
        genMap.set(p.id, max + 1); changed = true
      }
    }
  }
  for (const p of people) { if (!genMap.has(p.id)) genMap.set(p.id, 0) }
  return genMap
}

// Convert internal gen (0=oldest) to display gen (1=most recent)
function toDisplayGen(internalGen: number, maxInternal: number): number {
  return maxInternal - internalGen + 1
}

export interface PickedPerson {
  person: ApiPerson
  familyId: string
  familyName: string
}

interface Props {
  label: string
  currentValue?: ApiPerson | null
  excludeId?: string          // person being edited — exclude from list
  onPick: (picked: PickedPerson | null) => void
}

export function CrossFamilyPicker({ label, currentValue, excludeId, onPick }: Props) {
  const [families, setFamilies] = useState<ApiFamily[]>([])
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('')
  const [familyPeople, setFamilyPeople] = useState<ApiPerson[]>([])
  const [loadingPeople, setLoadingPeople] = useState(false)
  const [genFilter, setGenFilter] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getFamilies().then(setFamilies).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedFamilyId) { setFamilyPeople([]); return }
    setLoadingPeople(true)
    api.getPeople(selectedFamilyId)
      .then(setFamilyPeople)
      .catch(() => setFamilyPeople([]))
      .finally(() => setLoadingPeople(false))
  }, [selectedFamilyId])

  const { genMap, maxInternal, displayGroups } = useMemo(() => {
    const genMap = calcGenerations(familyPeople)
    const vals = Array.from(genMap.values())
    const maxInternal = vals.length ? Math.max(...vals) : 0
    const groups: Record<number, ApiPerson[]> = {}
    for (const p of familyPeople) {
      if (p.id === excludeId) continue
      const dg = toDisplayGen(genMap.get(p.id) ?? 0, maxInternal)
      if (!groups[dg]) groups[dg] = []
      groups[dg].push(p)
    }
    return { genMap, maxInternal, displayGroups: groups }
  }, [familyPeople, excludeId])

  const filteredPeople = useMemo(() => {
    let pool = familyPeople.filter(p => p.id !== excludeId)
    if (genFilter !== 'all') {
      pool = pool.filter(p => toDisplayGen(genMap.get(p.id) ?? 0, maxInternal) === genFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      pool = pool.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.gotra ?? '').toLowerCase().includes(q)
      )
    }
    return pool
  }, [familyPeople, genFilter, search, excludeId, genMap, maxInternal])

  const selectedFamily = families.find(f => f.id === selectedFamilyId)
  const displayGens = Object.keys(displayGroups).map(Number).sort((a, b) => a - b)

  return (
    <div className="space-y-3">
      <label className="text-caption font-sans text-on-surface-variant block">{label}</label>

      {/* Current value chip */}
      {currentValue && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary-container/30 border border-secondary-fixed/40">
          <span className="font-sans text-body-md text-primary font-semibold flex-1">
            {currentValue.firstName} {currentValue.lastName}
          </span>
          {currentValue._familyName && (
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
              {currentValue._familyName}
            </span>
          )}
          <button type="button" onClick={() => onPick(null)}
                  className="text-on-surface-variant hover:text-v-error transition-colors text-sm">✕</button>
        </div>
      )}

      {/* Family selector */}
      <select
        value={selectedFamilyId}
        onChange={e => { setSelectedFamilyId(e.target.value); setGenFilter('all'); setSearch('') }}
        className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-primary text-body-md font-sans focus:outline-none focus:border-secondary bg-surface-container transition-colors"
      >
        <option value="">— Select a family to browse —</option>
        {families.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      {selectedFamilyId && (
        <>
          {/* Generation filter chips */}
          {displayGens.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGenFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold transition-all ${
                  genFilter === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All
              </button>
              {displayGens.map(dg => (
                <button
                  key={dg}
                  type="button"
                  onClick={() => setGenFilter(dg)}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold transition-all ${
                    genFilter === dg
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Gen {dg}
                  {dg === 1 && ' (recent)'}
                  {dg === 2 && ' (parents)'}
                  {dg === 3 && ' (grandparents)'}
                  <span className="ml-1 opacity-60">
                    {displayGroups[dg]?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or gotra…"
            className="w-full border border-outline-variant rounded-xl px-4 py-2 text-body-md font-sans text-primary focus:outline-none focus:border-secondary bg-surface-container transition-colors"
          />

          {/* People list */}
          {loadingPeople ? (
            <div className="text-center py-4 text-caption font-sans text-on-surface-variant">Loading…</div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-4 text-caption font-sans text-on-surface-variant">No members found</div>
          ) : (
            <ul className="max-h-52 overflow-y-auto border border-outline-variant rounded-xl overflow-hidden">
              {filteredPeople.map(p => {
                const dg = toDisplayGen(genMap.get(p.id) ?? 0, maxInternal)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onPick({
                        person: { ...p, _crossFamily: true, _familyName: selectedFamily?.name },
                        familyId: selectedFamilyId,
                        familyName: selectedFamily?.name ?? '',
                      })}
                      className={`w-full text-left px-4 py-3 font-sans hover:bg-surface-container transition-colors border-b border-outline-variant/20 last:border-0 flex items-center justify-between gap-3 ${
                        currentValue?.id === p.id ? 'bg-secondary-container/20' : ''
                      }`}
                    >
                      <div>
                        <span className="text-body-md text-primary font-medium">
                          {p.firstName} {p.lastName}
                        </span>
                        {p.gotra && (
                          <span className="ml-2 text-[11px] text-on-surface-variant">{p.gotra}</span>
                        )}
                        {(p.birthDate || p.isLiving !== undefined) && (
                          <div className="text-[11px] text-on-surface-variant mt-0.5">
                            {p.isLiving ? '● Living' : p.birthDate ? new Date(p.birthDate).getFullYear() : 'Ancestor'}
                          </div>
                        )}
                      </div>
                      <span
                        className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#d6eaf8', color: '#1e3a5f' }}
                      >
                        Gen {dg}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
