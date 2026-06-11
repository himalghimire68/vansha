'use client'

import React, { useState, useEffect } from 'react'
import { api, ApiPerson, ApiRelationship } from '@/lib/api'
import { useLanguage } from '@/providers/LanguageProvider'

interface Person {
  id: string
  name: string
  familyId: string
}

interface RelResult {
  person1: Person
  person2: Person
  relationship: string
  distance: number
}

function describeRelationship(rel: ApiRelationship): string {
  if (rel.type === 'SELF') return 'Same Person'
  if (rel.type === 'PARENT_CHILD') return rel.description || 'Parent / Child'
  if (rel.type === 'RELATED') {
    const dist = rel.distance ?? rel.sharedAncestors ?? '?'
    return `Related (${dist} step${dist !== 1 ? 's' : ''} apart)`
  }
  if (rel.type === 'NO_DIRECT_LINK') return 'No direct relationship found in current data'
  return rel.description || rel.type
}

function toEntry(p: ApiPerson): Person {
  const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  return { id: p.id, name, familyId: p.familyId }
}

export default function ExploreRelationshipsPage() {
  const { t } = useLanguage()
  const [allPeople, setAllPeople] = useState<Person[]>([])
  const [person1, setPerson1] = useState<Person | null>(null)
  const [person2, setPerson2] = useState<Person | null>(null)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RelResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const families = await api.getFamilies()
        const batches = await Promise.all(
          families.map(f => api.getPeople(f.id).catch(() => [] as ApiPerson[]))
        )
        setAllPeople(batches.flat().map(toEntry))
      } catch {}
    }
    load()
  }, [])

  const filter = (q: string) =>
    q.trim()
      ? allPeople.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      : []

  const sug1 = filter(search1)
  const sug2 = filter(search2)

  const handleExplore = async () => {
    if (!person1 || !person2) { setError(t('explore.errSelectBoth')); return }
    if (person1.id === person2.id) { setError(t('explore.errDifferent')); return }
    setError('')
    setIsLoading(true)
    try {
      const rel = await api.findRelationship(person1.familyId, person1.id, person2.id)
      setResult({ person1, person2, relationship: describeRelationship(rel), distance: rel.distance ?? 0 })
    } catch {
      setError(t('explore.errFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-headline-lg text-primary mb-2">{t('explore.heading')}</h1>
        <p className="font-sans text-body-md text-on-surface-variant">{t('explore.subtext')}</p>
      </div>

      {/* Selector Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 archival-shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Person 1 */}
          <div className="relative">
            <label className="text-label-md font-sans text-on-surface-variant mb-3 block flex items-center gap-2">
              <span className="w-5 h-5 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container text-xs font-bold">1</span>
              {t('explore.person1')}
            </label>
            <div className="relative group">
              <input
                type="text"
                value={search1}
                onChange={(e) => { setSearch1(e.target.value); setShow1(true) }}
                onFocus={() => setShow1(true)}
                placeholder={t('explore.searchHolder')}
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
            </div>
            {show1 && search1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl archival-shadow-lg z-20 overflow-hidden">
                {sug1.length > 0 ? sug1.map((p) => (
                  <button key={p.id} onClick={() => { setPerson1(p); setSearch1(''); setShow1(false) }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container font-sans text-body-md text-primary border-b last:border-0 border-outline-variant/30 transition-colors">
                    {p.name}
                  </button>
                )) : (
                  <div className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{t('explore.noMatches')}</div>
                )}
              </div>
            )}
            {person1 && (
              <div className="mt-3 px-4 py-3 bg-secondary-container/40 border border-secondary-fixed/50 rounded-xl flex items-center justify-between">
                <span className="font-sans text-body-md text-primary font-semibold">{person1.name}</span>
                <button onClick={() => { setPerson1(null); setSearch1('') }} className="text-on-surface-variant hover:text-primary transition-colors text-sm">✕</button>
              </div>
            )}
          </div>

          {/* Person 2 */}
          <div className="relative">
            <label className="text-label-md font-sans text-on-surface-variant mb-3 block flex items-center gap-2">
              <span className="w-5 h-5 bg-tertiary-fixed rounded-full flex items-center justify-center text-on-tertiary-fixed text-xs font-bold">2</span>
              {t('explore.person2')}
            </label>
            <div className="relative group">
              <input
                type="text"
                value={search2}
                onChange={(e) => { setSearch2(e.target.value); setShow2(true) }}
                onFocus={() => setShow2(true)}
                placeholder={t('explore.searchHolder')}
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
            </div>
            {show2 && search2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl archival-shadow-lg z-20 overflow-hidden">
                {sug2.length > 0 ? sug2.map((p) => (
                  <button key={p.id} onClick={() => { setPerson2(p); setSearch2(''); setShow2(false) }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container font-sans text-body-md text-primary border-b last:border-0 border-outline-variant/30 transition-colors">
                    {p.name}
                  </button>
                )) : (
                  <div className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{t('explore.noMatches')}</div>
                )}
              </div>
            )}
            {person2 && (
              <div className="mt-3 px-4 py-3 bg-tertiary-fixed/40 border border-tertiary-fixed-dim/50 rounded-xl flex items-center justify-between">
                <span className="font-sans text-body-md text-primary font-semibold">{person2.name}</span>
                <button onClick={() => { setPerson2(null); setSearch2('') }} className="text-on-surface-variant hover:text-primary transition-colors text-sm">✕</button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-error-container border border-on-error-container/20 rounded-xl font-sans text-body-md text-on-error-container">
            {error}
          </div>
        )}

        <button
          onClick={handleExplore}
          disabled={!person1 || !person2 || isLoading}
          className="w-full bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin-slow" />
              {t('explore.tracing')}
            </>
          ) : (
            <>{t('explore.trace')}</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 archival-shadow-lg animate-slide-up">
          <h2 className="font-serif text-headline-md text-primary mb-8">{t('explore.found')}</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center font-serif text-2xl text-on-secondary-container mb-2">
                {result.person1.name.charAt(0)}
              </div>
              <p className="font-serif text-body-lg text-primary">{result.person1.name}</p>
            </div>
            <div className="flex-1 text-center px-4">
              <p className="font-serif text-headline-md text-secondary mb-1">{result.relationship}</p>
              {result.distance > 0 && (
                <p className="font-sans text-caption text-on-surface-variant">{result.distance} {t('explore.generations')}</p>
              )}
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-tertiary-fixed flex items-center justify-center font-serif text-2xl text-on-tertiary-fixed mb-2">
                {result.person2.name.charAt(0)}
              </div>
              <p className="font-serif text-body-lg text-primary">{result.person2.name}</p>
            </div>
          </div>
          <button
            onClick={() => { setResult(null); setPerson1(null); setPerson2(null) }}
            className="w-full py-3 border border-outline text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary hover:text-secondary transition-all"
          >
            {t('explore.searchAgain')}
          </button>
        </div>
      )}

      {/* Guide */}
      {!result && (
        <div className="bg-secondary-container/30 border border-secondary-fixed/40 rounded-2xl p-8 text-center">
          <span className="text-4xl block mb-4">🌳</span>
          <h3 className="font-serif text-headline-md text-primary mb-2">{t('explore.howTitle')}</h3>
          <p className="font-sans text-body-md text-on-surface-variant max-w-lg mx-auto">{t('explore.howDesc')}</p>
        </div>
      )}
    </div>
  )
}
