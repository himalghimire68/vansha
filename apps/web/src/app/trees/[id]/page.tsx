'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api, ApiFamily, ApiPerson } from '@/lib/api'

// ─── Assign-parents modal ──────────────────────────────────────────────────
function AssignParentsModal({
  person,
  people,
  onClose,
  onSaved,
}: {
  person: ApiPerson
  people: ApiPerson[]
  onClose: () => void
  onSaved: (updated: ApiPerson) => void
}) {
  const [fatherId, setFatherId] = useState(person.fatherId ?? '')
  const [motherId, setMotherId] = useState(person.motherId ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const others = people.filter(p => p.id !== person.id)

  const handleSave = async () => {
    setSaving(true)
    setErr('')
    try {
      const updated = await api.updatePerson(person.familyId, person.id, {
        fatherId: fatherId || null,
        motherId: motherId || null,
      })
      onSaved(updated)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(13,34,24,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 w-full max-w-md archival-shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-serif text-headline-md text-primary mb-1">
          Link Parents
        </h3>
        <p className="font-sans text-caption text-on-surface-variant mb-6">
          Assigning parents for <strong>{person.firstName} {person.lastName}</strong>
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-caption font-sans text-on-surface-variant mb-1 block">Father</label>
            <select
              value={fatherId}
              onChange={e => setFatherId(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary bg-surface-container transition-colors"
            >
              <option value="">— None —</option>
              {others.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                  {p.birthDate ? ` (b. ${new Date(p.birthDate).getFullYear()})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-caption font-sans text-on-surface-variant mb-1 block">Mother</label>
            <select
              value={motherId}
              onChange={e => setMotherId(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary bg-surface-container transition-colors"
            >
              <option value="">— None —</option>
              {others.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                  {p.birthDate ? ` (b. ${new Date(p.birthDate).getFullYear()})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err && <p className="text-v-error text-caption font-sans mt-4">{err}</p>}

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-on-primary text-label-md font-sans py-3 rounded-brand hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Saving…</>
            ) : 'Save Links'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 border border-outline-variant text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Generation colours ────────────────────────────────────────────────────
const GEN_PALETTE = [
  { bg: '#1b4332', text: '#ffffff', light: '#d8f3dc', border: '#40916c', label: 'Deep Green'  },
  { bg: '#1e3a5f', text: '#ffffff', light: '#d6eaf8', border: '#2e86c1', label: 'Ocean Blue'  },
  { bg: '#0f766e', text: '#ffffff', light: '#ccfbf1', border: '#0d9488', label: 'Teal'         },
  { bg: '#92400e', text: '#ffffff', light: '#fef3c7', border: '#d97706', label: 'Amber'        },
  { bg: '#4a1d96', text: '#ffffff', light: '#ede9fe', border: '#7c3aed', label: 'Violet'       },
  { bg: '#065f46', text: '#ffffff', light: '#d1fae5', border: '#059669', label: 'Emerald'      },
]
const genColor = (i: number) => GEN_PALETTE[i % GEN_PALETTE.length]

// ─── Build generation rows via BFS ────────────────────────────────────────
interface GenRow { gen: number; people: ApiPerson[] }

function buildGenerations(people: ApiPerson[]): GenRow[] {
  if (people.length === 0) return []
  const map = new Map(people.map(p => [p.id, p]))
  const genMap = new Map<string, number>()

  const roots = people.filter(
    p => (!p.fatherId || !map.has(p.fatherId)) && (!p.motherId || !map.has(p.motherId))
  )
  const starts = roots.length > 0 ? roots : [people[0]]
  const queue: { id: string; gen: number }[] = starts.map(p => ({ id: p.id, gen: 0 }))

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    if (genMap.has(id)) continue
    genMap.set(id, gen)
    for (const p of people) {
      if (!genMap.has(p.id) && (p.fatherId === id || p.motherId === id)) {
        queue.push({ id: p.id, gen: gen + 1 })
      }
    }
  }
  for (const p of people) { if (!genMap.has(p.id)) genMap.set(p.id, 0) }

  const maxGen = Math.max(0, ...Array.from(genMap.values()))
  const rows: GenRow[] = []
  for (let i = 0; i <= maxGen; i++) {
    const row = people
      .filter(p => genMap.get(p.id) === i)
      .sort((a, b) =>
        `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
      )
    if (row.length) rows.push({ gen: i, people: row })
  }
  return rows
}

// ─── Describe relationship between two people ─────────────────────────────
function describeRelationship(a: ApiPerson, b: ApiPerson, people: ApiPerson[]): string | null {
  if (a.id === b.id) return null
  if (b.fatherId === a.id || b.motherId === a.id) return 'Parent → Child'
  if (a.fatherId === b.id || a.motherId === b.id) return 'Child → Parent'
  if (
    a.fatherId && b.fatherId && a.fatherId === b.fatherId ||
    a.motherId && b.motherId && a.motherId === b.motherId ||
    a.fatherId && b.motherId && a.fatherId === b.motherId ||
    a.motherId && b.fatherId && a.motherId === b.fatherId
  ) return 'Siblings'
  return null
}

// ─── Person card component ─────────────────────────────────────────────────
function PersonCard({
  person,
  genIndex,
  selected,
  onSelect,
  nodeRef,
}: {
  person: ApiPerson
  genIndex: number
  selected: boolean
  onSelect: (p: ApiPerson) => void
  nodeRef: (el: HTMLDivElement | null) => void
}) {
  const c = genColor(genIndex)
  return (
    <div
      ref={nodeRef}
      onClick={() => onSelect(person)}
      className="flex flex-col items-center cursor-pointer group select-none"
      style={{ minWidth: 100 }}
    >
      {/* Photo / initials circle */}
      <div
        className="relative"
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          border: selected ? `3px solid ${c.border}` : `2px solid ${c.border}`,
          boxShadow: selected ? `0 0 0 4px ${c.light}` : undefined,
          overflow: 'hidden',
          background: c.light,
          transition: 'box-shadow 0.2s',
        }}
      >
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.firstName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-serif text-xl font-bold"
            style={{ color: c.bg }}
          >
            {person.firstName[0]}{person.lastName[0]}
          </div>
        )}
        {/* Living dot */}
        <span
          className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{ background: person.isLiving ? '#40916c' : '#6b7280' }}
        />
      </div>

      {/* Name */}
      <p className="mt-2 text-center font-sans font-semibold text-on-surface"
         style={{ fontSize: 12, lineHeight: '16px', maxWidth: 90 }}>
        {person.firstName} {person.lastName}
      </p>

      {/* Birth / death */}
      {(person.birthDate || person.deathDate) && (
        <p className="text-center font-sans text-on-surface-variant" style={{ fontSize: 10 }}>
          {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
          {person.deathDate ? ` – ${new Date(person.deathDate).getFullYear()}` : ''}
        </p>
      )}

      {/* Gotra badge (yellow) */}
      {person.gotra && (
        <span
          className="mt-1 px-2 py-0.5 rounded-full font-sans font-semibold"
          style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          {person.gotra}
        </span>
      )}
    </div>
  )
}

// ─── SVG connector layer ───────────────────────────────────────────────────
interface Line { x1: number; y1: number; x2: number; y2: number; color: string }

function ConnectorSVG({
  lines,
  width,
  height,
}: {
  lines: Line[]
  width: number
  height: number
}) {
  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
      width={width}
      height={height}
    >
      {lines.map((l, i) => {
        const midY = (l.y1 + l.y2) / 2
        return (
          <path
            key={i}
            d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
            fill="none"
            stroke={l.color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.6}
          />
        )
      })}
    </svg>
  )
}

// ─── Main family tree view ─────────────────────────────────────────────────
function FamilyTreeView({
  people: initialPeople,
  treeId,
}: {
  people: ApiPerson[]
  treeId: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [lines, setLines] = useState<Line[]>([])
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })
  const [selected, setSelected] = useState<ApiPerson | null>(null)
  const [relationship, setRelationship] = useState<string | null>(null)
  const [people, setPeople] = useState<ApiPerson[]>(initialPeople)
  const [assignTarget, setAssignTarget] = useState<ApiPerson | null>(null)
  const rows = buildGenerations(people)
  const personMap = new Map(people.map(p => [p.id, p]))

  useEffect(() => { setPeople(initialPeople) }, [initialPeople])

  const setRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }, [])

  // Draw connector lines after layout
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const newLines: Line[] = []

    for (const person of people) {
      const childEl = nodeRefs.current.get(person.id)
      if (!childEl) continue

      for (const parentId of [person.fatherId, person.motherId]) {
        if (!parentId || !personMap.has(parentId)) continue
        const parentEl = nodeRefs.current.get(parentId)
        if (!parentEl) continue

        const cR = childEl.getBoundingClientRect()
        const pR = parentEl.getBoundingClientRect()

        const parentGen = rows.find(r => r.people.some(p => p.id === parentId))?.gen ?? 0
        const c = genColor(parentGen)

        newLines.push({
          x1: pR.left + pR.width / 2 - rect.left,
          y1: pR.bottom - rect.top,
          x2: cR.left + cR.width / 2 - rect.left,
          y2: cR.top - rect.top,
          color: c.border,
        })
      }
    }

    setSvgSize({ w: rect.width, h: rect.height })
    setLines(newLines)
  }, [people, rows])

  const handleSelect = (p: ApiPerson) => {
    if (selected && selected.id !== p.id) {
      const rel = describeRelationship(selected, p, people)
      setRelationship(rel)
      if (rel) return
    }
    setSelected(prev => prev?.id === p.id ? null : p)
    setRelationship(null)
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">🌿</span>
        <h3 className="font-serif text-headline-md text-primary mb-2">No ancestors recorded yet</h3>
        <p className="font-sans text-body-md text-on-surface-variant mb-6">
          Begin adding members to build your family tree.
        </p>
        <Link
          href={`/trees/${treeId}/add-person`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity"
        >
          + Add First Ancestor
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-2">
        {rows.map(row => {
          const c = genColor(row.gen)
          return (
            <div
              key={row.gen}
              className="flex items-center gap-2 px-3 py-1 rounded-full font-sans font-semibold"
              style={{ fontSize: 12, background: c.light, color: c.bg, border: `1px solid ${c.border}` }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.bg, display: 'inline-block' }} />
              Generation {row.gen + 1}
              <span className="opacity-60">({row.people.length})</span>
            </div>
          )
        })}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full font-sans"
             style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
          ✦ Gotra shown in gold
        </div>
      </div>

      {/* Click tip */}
      <p className="text-caption font-sans text-on-surface-variant">
        Click a person to select • Click two different people to see their relationship
      </p>

      {/* Relationship result */}
      {relationship && (
        <div
          className="px-4 py-3 rounded-xl font-sans font-semibold"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          ✦ {relationship}
          <button
            onClick={() => { setSelected(null); setRelationship(null) }}
            className="ml-4 text-xs underline opacity-60 hover:opacity-100"
          >
            Clear
          </button>
        </div>
      )}

      {/* Selected person info */}
      {selected && !relationship && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-sans"
          style={{ background: genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).light, border: `1px solid ${genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).border}` }}
        >
          <span className="font-semibold text-on-surface">
            {selected.firstName} {selected.lastName} selected
          </span>
          <span className="text-on-surface-variant text-caption">— Click another person to see their relationship</span>
          <button onClick={() => setSelected(null)} className="ml-auto text-xs underline opacity-60 hover:opacity-100">Clear</button>
        </div>
      )}

      {/* Tree */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ minHeight: rows.length * 200 }}
      >
        <ConnectorSVG lines={lines} width={svgSize.w} height={svgSize.h} />

        <div className="relative z-10 space-y-10 py-4">
          {rows.map(row => {
            const c = genColor(row.gen)
            return (
              <div key={row.gen} className="relative">
                {/* Generation header */}
                <div
                  className="flex items-center gap-3 mb-6 px-4 py-2 rounded-xl"
                  style={{ background: c.light, borderLeft: `4px solid ${c.bg}` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {row.gen + 1}
                  </div>
                  <div>
                    <span className="font-serif text-on-surface font-medium" style={{ fontSize: 15 }}>
                      Generation {row.gen + 1}
                    </span>
                    <span className="ml-2 font-sans text-on-surface-variant" style={{ fontSize: 12 }}>
                      {row.gen === 0 ? 'Founding ancestors' : row.gen === 1 ? 'Parents / grandparents' : `${row.people.length} member${row.people.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <span
                      className="px-3 py-1 rounded-full font-sans font-semibold"
                      style={{ fontSize: 11, background: c.bg, color: c.text }}
                    >
                      {row.people.length} member{row.people.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Person cards */}
                <div className="flex flex-wrap gap-6 px-4">
                  {row.people.map(person => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      genIndex={row.gen}
                      selected={selected?.id === person.id}
                      onSelect={handleSelect}
                      nodeRef={setRef(person.id)}
                    />
                  ))}
                  {/* Add member card inline */}
                  <Link href={`/trees/${treeId}/add-person`}>
                    <div
                      className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
                      style={{ minWidth: 100 }}
                    >
                      <div
                        className="w-[72px] h-[72px] rounded-full border-2 border-dashed flex items-center justify-center group-hover:opacity-80 transition-opacity"
                        style={{ borderColor: c.border, background: c.light, color: c.bg }}
                      >
                        <span style={{ fontSize: 24 }}>+</span>
                      </div>
                      <p className="font-sans text-on-surface-variant text-center" style={{ fontSize: 11 }}>
                        Add to Gen {row.gen + 1}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Person detail panel */}
      {selected && (
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).light,
            borderColor: genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).border,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: `3px solid ${genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).border}` }}
            >
              {selected.photoUrl ? (
                <img src={selected.photoUrl} alt={selected.firstName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-serif text-xl font-bold"
                  style={{
                    background: genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).bg,
                    color: '#fff',
                  }}
                >
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-headline-md text-primary">
                {selected.firstName} {selected.middleName ? `${selected.middleName} ` : ''}{selected.lastName}
              </h4>
              {selected.nepaliName && (
                <p className="font-sans text-body-md text-on-surface-variant">{selected.nepaliName}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className="px-3 py-1 rounded-full font-sans font-semibold"
                  style={{ fontSize: 11, background: selected.isLiving ? '#d8f3dc' : '#e5e7eb', color: selected.isLiving ? '#1b4332' : '#6b7280' }}
                >
                  {selected.isLiving ? '● Living' : '● Ancestor'}
                </span>
                {selected.gender && (
                  <span className="px-3 py-1 rounded-full font-sans" style={{ fontSize: 11, background: '#d6eaf8', color: '#1e3a5f' }}>
                    {selected.gender}
                  </span>
                )}
                {selected.gotra && (
                  <span className="px-3 py-1 rounded-full font-sans font-semibold" style={{ fontSize: 11, background: '#fef3c7', color: '#92400e' }}>
                    Gotra: {selected.gotra}
                  </span>
                )}
                {selected.caste && (
                  <span className="px-3 py-1 rounded-full font-sans" style={{ fontSize: 11, background: '#ede9fe', color: '#4a1d96' }}>
                    {selected.caste}
                  </span>
                )}
              </div>
              {(selected.birthDate || selected.ancestralVillage) && (
                <div className="mt-3 flex flex-wrap gap-4 text-caption font-sans text-on-surface-variant">
                  {selected.birthDate && <span>Born: {new Date(selected.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                  {selected.deathDate && <span>Died: {new Date(selected.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                  {selected.ancestralVillage && <span>📍 {selected.ancestralVillage}{selected.ancestralDistrict ? `, ${selected.ancestralDistrict}` : ''}</span>}
                </div>
              )}
              {selected.biography && (
                <p className="mt-3 font-sans text-body-md text-on-surface-variant line-clamp-2">{selected.biography}</p>
              )}
              {/* Parent links */}
              {(selected.fatherId || selected.motherId) && (
                <div className="mt-3 flex flex-wrap gap-2 text-caption font-sans">
                  {[selected.fatherId, selected.motherId].map((pid, i) => {
                    if (!pid) return null
                    const parent = personMap.get(pid)
                    if (!parent) return null
                    return (
                      <span
                        key={pid}
                        className="px-2 py-1 rounded-lg"
                        style={{ background: '#e3f0e8', color: '#1b4332', fontSize: 11 }}
                      >
                        {i === 0 ? '👨' : '👩'} {parent.firstName} {parent.lastName}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href={`/person-profile/${selected.id}?familyId=${selected.familyId}`}
                className="px-4 py-2 rounded-brand font-sans font-semibold text-label-md hover:opacity-90 transition-opacity text-center"
                style={{ background: genColor(rows.find(r => r.people.some(p => p.id === selected.id))?.gen ?? 0).bg, color: '#fff' }}
              >
                View Profile
              </Link>
              <button
                onClick={() => setAssignTarget(selected)}
                className="px-4 py-2 rounded-brand font-sans font-semibold text-label-md border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-all"
              >
                Link Parents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign parents modal */}
      {assignTarget && (
        <AssignParentsModal
          person={assignTarget}
          people={people}
          onClose={() => setAssignTarget(null)}
          onSaved={(updated) => {
            setPeople(prev => prev.map(p => p.id === updated.id ? updated : p))
            setSelected(updated)
            setAssignTarget(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function TreePage() {
  const params = useParams()
  const treeId = params?.id as string
  const [family, setFamily] = useState<ApiFamily | null>(null)
  const [people, setPeople] = useState<ApiPerson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!treeId) return
    Promise.all([api.getFamily(treeId), api.getPeople(treeId)])
      .then(([f, p]) => { setFamily(f); setPeople(p) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [treeId])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-primary">{family?.name || 'Family Tree'}</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />)}
            </div>
          </div>
        ) : !family ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📜</span>
            <h2 className="font-serif text-headline-md text-primary mb-2">Archive Not Found</h2>
            <p className="font-sans text-body-md text-on-surface-variant mb-6">This family tree could not be located.</p>
            <Link href="/dashboard" className="bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity inline-block">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Family header */}
            <div
              className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              style={{ background: 'linear-gradient(135deg, #1b4332 0%, #1e3a5f 100%)', color: '#fff' }}
            >
              <div>
                <h1 className="font-serif text-headline-lg mb-1" style={{ color: '#fff' }}>{family.name}</h1>
                {family.description && (
                  <p className="font-sans text-body-md mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>{family.description}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {family.ancestralVillage && (
                    <span className="px-3 py-1 rounded-full text-caption font-sans font-semibold"
                          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                      📍 {family.ancestralVillage}{family.ancestralDistrict ? `, ${family.ancestralDistrict}` : ''}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-caption font-sans font-semibold"
                        style={{ background: '#fef3c7', color: '#92400e' }}>
                    👥 {people.length} member{people.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Link
                href={`/trees/${treeId}/add-person`}
                className="px-6 py-3 rounded-brand font-sans font-semibold text-label-md flex items-center gap-2 hover:opacity-90 transition-all whitespace-nowrap"
                style={{ background: '#fef3c7', color: '#92400e' }}
              >
                + Add Ancestor
              </Link>
            </div>

            {/* Tree view */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 archival-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-headline-md text-primary">Family Lineage Tree</h2>
                <span className="text-caption font-sans text-on-surface-variant">
                  {buildGenerations(people).length} generation{buildGenerations(people).length !== 1 ? 's' : ''}
                </span>
              </div>
              <FamilyTreeView people={people} treeId={treeId} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
