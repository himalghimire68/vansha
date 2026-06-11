'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api, ApiFamily, ApiPerson } from '@/lib/api'
import { CrossFamilyPicker, PickedPerson } from '@/components/CrossFamilyPicker'
import { useLanguage } from '@/providers/LanguageProvider'
import dynamic from 'next/dynamic'
import type { ViewMode } from '@/components/PedigreeTree'

// Lazy-load PedigreeTree (uses ReactFlow which is client-only)
const PedigreeTree = dynamic(() => import('@/components/PedigreeTree'), { ssr: false })

// ─── Assign relations modal (parents + offspring, cross-family) ────────────
function AssignRelationsModal({
  person,
  allPeople,
  onClose,
  onSaved,
}: {
  person: ApiPerson
  allPeople: ApiPerson[]
  onClose: () => void
  onSaved: (updates: ApiPerson[]) => void
}) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'parents' | 'children'>('parents')
  const [father, setFather] = useState<ApiPerson | null>(
    allPeople.find(p => p.id === person.fatherId) ?? null
  )
  const [mother, setMother] = useState<ApiPerson | null>(
    allPeople.find(p => p.id === person.motherId) ?? null
  )
  // Children to link: array of { person, role: 'father'|'mother' }
  const [childLinks, setChildLinks] = useState<{ person: ApiPerson; role: 'father' | 'mother' }[]>([])
  const [pendingChild, setPendingChild] = useState<ApiPerson | null>(null)
  const [pendingRole, setPendingRole] = useState<'father' | 'mother'>('father')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handlePickFather = (picked: PickedPerson | null) => {
    setFather(picked ? { ...picked.person, _familyName: picked.familyName } : null)
  }
  const handlePickMother = (picked: PickedPerson | null) => {
    setMother(picked ? { ...picked.person, _familyName: picked.familyName } : null)
  }
  const handlePickChild = (picked: PickedPerson | null) => {
    if (picked) setPendingChild({ ...picked.person, _familyName: picked.familyName })
    else setPendingChild(null)
  }
  const addChildLink = () => {
    if (!pendingChild) return
    if (childLinks.some(l => l.person.id === pendingChild.id)) return
    setChildLinks(prev => [...prev, { person: pendingChild, role: pendingRole }])
    setPendingChild(null)
  }
  const removeChildLink = (id: string) => setChildLinks(prev => prev.filter(l => l.person.id !== id))

  const handleSave = async () => {
    setSaving(true); setErr('')
    try {
      const results: ApiPerson[] = []
      // Update this person's parents
      const updated = await api.updatePerson(person.familyId, person.id, {
        fatherId: father?.id ?? null,
        motherId: mother?.id ?? null,
      })
      results.push(updated)
      // Link each child: PATCH the child to set their fatherId or motherId
      for (const { person: child, role } of childLinks) {
        const childUpdate = await api.updatePerson(child.familyId, child.id, {
          [role === 'father' ? 'fatherId' : 'motherId']: person.id,
        })
        results.push(childUpdate)
      }
      onSaved(results)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13,34,24,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg archival-shadow-lg overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-4 border-b border-outline-variant flex-shrink-0">
          <h3 className="font-serif text-headline-md text-primary mb-0.5">{t('modal.linkRelations')}</h3>
          <p className="font-sans text-caption text-on-surface-variant">
            For <strong>{person.firstName} {person.lastName}</strong>
          </p>
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['parents', 'children'] as const).map(tabKey => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setTab(tabKey)}
                className={`px-4 py-2 rounded-xl text-label-md font-sans transition-all capitalize ${
                  tab === tabKey
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tabKey === 'parents' ? t('modal.parents') : t('modal.offspring')}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
          {tab === 'parents' && (
            <>
              <CrossFamilyPicker
                label={t('modal.fatherLabel')}
                currentValue={father}
                excludeId={person.id}
                onPick={handlePickFather}
              />
              <CrossFamilyPicker
                label={t('modal.motherLabel')}
                currentValue={mother}
                excludeId={person.id}
                onPick={handlePickMother}
              />
            </>
          )}

          {tab === 'children' && (
            <div className="space-y-5">
              <p className="text-caption font-sans text-on-surface-variant">
                Select an existing person from any family and mark them as the
                son/daughter of <strong>{person.firstName} {person.lastName}</strong>.
              </p>

              {/* Pending child picker */}
              <CrossFamilyPicker
                label={t('modal.offspring')}
                currentValue={pendingChild}
                excludeId={person.id}
                onPick={handlePickChild}
              />
              {pendingChild && (
                <div className="flex items-center gap-3">
                  <span className="text-caption font-sans text-on-surface-variant">
                    {person.firstName} is this child&apos;s:
                  </span>
                  <label className="flex items-center gap-1 text-caption font-sans text-primary cursor-pointer">
                    <input type="radio" value="father" checked={pendingRole === 'father'}
                           onChange={() => setPendingRole('father')} /> {t('modal.father')}
                  </label>
                  <label className="flex items-center gap-1 text-caption font-sans text-primary cursor-pointer">
                    <input type="radio" value="mother" checked={pendingRole === 'mother'}
                           onChange={() => setPendingRole('mother')} /> {t('modal.mother')}
                  </label>
                  <button
                    type="button"
                    onClick={addChildLink}
                    className="ml-auto px-4 py-1.5 bg-secondary text-on-secondary text-label-md font-sans rounded-xl hover:opacity-90 transition-all"
                  >
                    + Add
                  </button>
                </div>
              )}

              {/* Queued child links */}
              {childLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-label-md font-sans text-on-surface-variant">{t('modal.toBeLinked')}</p>
                  {childLinks.map(({ person: child, role }) => (
                    <div key={child.id}
                         className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container">
                      <span className="flex-1 font-sans text-body-md text-primary font-medium">
                        {child.firstName} {child.lastName}
                      </span>
                      {child._familyName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-sans"
                              style={{ background: '#fef3c7', color: '#92400e' }}>
                          {child._familyName}
                        </span>
                      )}
                      <span className="text-caption font-sans text-on-surface-variant">
                        ← {role}
                      </span>
                      <button type="button" onClick={() => removeChildLink(child.id)}
                              className="text-v-error hover:opacity-70 transition-opacity text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {err && <p className="text-v-error text-caption font-sans px-8 pb-2">{err}</p>}
        <div className="flex gap-3 px-8 py-5 border-t border-outline-variant flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-on-primary text-label-md font-sans py-3 rounded-brand hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> {t('person.inscribing')}</>
              : t('modal.saveLinks')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 border border-outline-variant text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary transition-all"
          >
            {t('modal.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Tree container with cross-family loading, Me anchor, view toggle ────
function FamilyTreeView({
  people: initialPeople,
  treeId,
}: {
  people: ApiPerson[]
  treeId: string
}) {
  const { t } = useLanguage()
  const [people, setPeople] = useState<ApiPerson[]>(initialPeople)
  const [assignTarget, setAssignTarget] = useState<ApiPerson | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('pedigree')

  // "Me" anchor — persisted per tree in localStorage
  const lsKey = `vansha-me-${treeId}`
  const [mePersonId, setMePersonIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(lsKey)
  })
  const setMe = (id: string) => {
    localStorage.setItem(lsKey, id)
    setMePersonIdState(id)
  }

  useEffect(() => { setPeople(initialPeople) }, [initialPeople])

  // Default "Me" to founder / first person if nothing stored
  useEffect(() => {
    if (!mePersonId && initialPeople.length > 0) {
      const stored = localStorage.getItem(lsKey)
      if (!stored) {
        // Pick the youngest (most recently added) non-cross-family person
        const candidate = [...initialPeople].reverse().find(p => !p._crossFamily)
        if (candidate) setMe(candidate.id)
      } else {
        setMePersonIdState(stored)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPeople])

  // Load cross-family parents referenced by fatherId/motherId.
  // Depends on `people` (local state) so it also fires after the AssignRelationsModal
  // saves a new cross-family parent link, not just on initial prop load.
  // Only scans non-cross-family people to avoid infinite chaining.
  useEffect(() => {
    const knownIds = new Set(people.map(p => p.id))
    const missing = new Set<string>()
    for (const p of people) {
      if (p._crossFamily) continue   // don't chain into grandparents of external nodes
      if (p.fatherId && !knownIds.has(p.fatherId)) missing.add(p.fatherId)
      if (p.motherId && !knownIds.has(p.motherId)) missing.add(p.motherId)
    }
    if (missing.size === 0) return
    api.resolvePeople([...missing])
      .then(resolved => {
        if (!resolved.length) return
        api.getFamilies().then(families => {
          const famMap = new Map(families.map(f => [f.id, f.name]))
          const marked = resolved.map(p => ({
            ...p,
            _crossFamily: true,
            _familyName: famMap.get(p.familyId) ?? 'Other family',
          }))
          setPeople(prev => {
            const existingIds = new Set(prev.map(x => x.id))
            const toAdd = marked.filter(p => !existingIds.has(p.id))
            if (toAdd.length === 0) return prev   // no change → no re-render
            return [...prev, ...toAdd]
          })
        }).catch(() => {})
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people])

  const mePerson = people.find(p => p.id === mePersonId)

  if (people.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">🌿</span>
        <h3 className="font-serif text-headline-md text-primary mb-2">{t('tree.noAncestors')}</h3>
        <p className="font-sans text-body-md text-on-surface-variant mb-6">{t('tree.noAncestorsMsg')}</p>
        <Link href={`/trees/${treeId}/add-person`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity">
          {t('tree.addFirst')}
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Me indicator */}
        <div className="flex items-center gap-2">
          {mePerson ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-caption font-semibold"
              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              👑 Me: {mePerson.firstName} {mePerson.lastName}
              <button onClick={() => { localStorage.removeItem(lsKey); setMePersonIdState(null) }}
                className="opacity-50 hover:opacity-100 transition-opacity text-xs ml-1">✕</button>
            </span>
          ) : (
            <span className="text-caption font-sans text-on-surface-variant">
              {t('tree.meHint')}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
          {(['pedigree', 'full'] as ViewMode[]).map(mode => (
            <button key={mode} type="button" onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-caption font-sans font-semibold transition-all capitalize ${
                viewMode === mode
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              {mode === 'pedigree' ? t('tree.pedigree') : t('tree.fullGraph')}
            </button>
          ))}
        </div>
      </div>

      <p className="text-caption font-sans text-on-surface-variant mb-3">
        {viewMode === 'pedigree' ? t('tree.pedigreeHint') : t('tree.fullGraphHint')}
      </p>

      <div style={{ height: 620, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <PedigreeTree
          people={people}
          treeId={treeId}
          mePersonId={mePersonId}
          viewMode={viewMode}
          onAssignRelations={(p) => setAssignTarget(p)}
          onSetMe={setMe}
        />
      </div>

      {assignTarget && (
        <AssignRelationsModal
          person={assignTarget}
          allPeople={people}
          onClose={() => setAssignTarget(null)}
          onSaved={(updates) => {
            setPeople(prev => {
              const map = new Map(prev.map(p => [p.id, p]))
              for (const u of updates) map.set(u.id, u)
              return [...map.values()]
            })
            setAssignTarget(null)
          }}
        />
      )}
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function TreePage() {
  const { t } = useLanguage()
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
          <Link href="/dashboard" className="hover:text-primary transition-colors">{t('common.dashboard')}</Link>
          <span>›</span>
          <span className="text-primary">{family?.name || t('tree.heading')}</span>
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
            <h2 className="font-serif text-headline-md text-primary mb-2">{t('tree.notFound')}</h2>
            <p className="font-sans text-body-md text-on-surface-variant mb-6">{t('tree.notFoundMsg')}</p>
            <Link href="/dashboard" className="bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity inline-block">
              {t('tree.backToDash')}
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
                    👥 {people.length} {people.length !== 1 ? t('tree.members') : t('tree.member')}
                  </span>
                </div>
              </div>
              <Link
                href={`/trees/${treeId}/add-person`}
                className="px-6 py-3 rounded-brand font-sans font-semibold text-label-md flex items-center gap-2 hover:opacity-90 transition-all whitespace-nowrap"
                style={{ background: '#fef3c7', color: '#92400e' }}
              >
                {t('tree.addAncestor')}
              </Link>
            </div>

            {/* Tree view */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 archival-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-headline-md text-primary">{t('tree.heading')}</h2>
                <span className="text-caption font-sans text-on-surface-variant">
                  {people.length} {people.length !== 1 ? t('tree.members') : t('tree.member')}
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
