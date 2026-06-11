'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { GOTRA_LIST, GotraEntry } from '@/lib/gotraData'
import { useGotraList } from '@/providers/GotraDataProvider'

interface SurnameEntry { surname: string; gotra: string; nepali: string }

interface Props {
  value: string
  onChange: (gotra: string) => void
  placeholder?: string
}

export function GotraSelect({ value, onChange, placeholder = 'Search gotra…' }: Props) {
  const gotraList = useGotraList()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = gotraList.find(g => g.gotra === value)
  const displayText = selected ? `${selected.gotra} (${selected.nepali})` : ''

  const filtered = query.trim()
    ? gotraList.filter(g =>
        g.gotra.toLowerCase().includes(query.toLowerCase()) ||
        g.nepali.includes(query) ||
        g.surnames.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )
    : gotraList

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div
        className="relative group cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <input
          type="text"
          readOnly
          value={displayText}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none cursor-pointer placeholder:text-outline-variant/60"
        />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs pointer-events-none">▾</span>
        <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-archival-lg z-30 overflow-hidden">
          <div className="p-2 border-b border-outline-variant">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by gotra or surname…"
              className="w-full text-body-md font-sans text-primary bg-surface-container rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary border border-outline-variant"
              onClick={e => e.stopPropagation()}
            />
          </div>

          <ul className="max-h-64 overflow-y-auto">
            <li>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-body-md font-sans text-on-surface-variant hover:bg-surface-container transition-colors"
                onClick={() => { onChange(''); setOpen(false); setQuery('') }}
              >
                — None —
              </button>
            </li>
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-caption font-sans text-on-surface-variant">No matches</li>
            )}
            {filtered.map(g => (
              <li key={g.gotra}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 font-sans hover:bg-surface-container transition-colors border-b border-outline-variant/30 last:border-0 ${
                    value === g.gotra ? 'bg-secondary-container/40 font-semibold' : ''
                  }`}
                  onClick={() => { onChange(g.gotra); setOpen(false); setQuery('') }}
                >
                  <span className="text-body-md text-primary">{g.gotra}</span>
                  <span className="ml-2 text-caption text-on-surface-variant">{g.nepali}</span>
                  <div className="text-[11px] text-on-surface-variant/70 mt-0.5 truncate">
                    {g.surnames.slice(0, 6).join(', ')}{g.surnames.length > 6 ? '…' : ''}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface SurnameProps {
  value: string
  gotra: string
  onChange: (surname: string) => void
  placeholder?: string
}

export function SurnameSelect({ value, gotra, onChange, placeholder = 'Enter or select surname…' }: SurnameProps) {
  const gotraList = useGotraList()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const gotraEntry: GotraEntry | undefined = gotraList.find(g => g.gotra === gotra)
  const allSurnames = gotraEntry?.surnames ?? []

  const filtered = query.trim()
    ? allSurnames.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : allSurnames

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative group">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-colors placeholder:text-outline-variant/60"
      />
      <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />

      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-archival-lg z-30 overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <li key={s}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-body-md font-sans text-primary hover:bg-surface-container transition-colors border-b border-outline-variant/20 last:border-0"
                onClick={() => { onChange(s); setQuery(s); setOpen(false) }}
              >
                {s}
                {gotraEntry && (
                  <span className="ml-2 text-[11px] text-on-surface-variant/60">
                    {gotraEntry.gotra}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── CasteSelect ───────────────────────────────────────────────────────────
interface CasteSelectProps {
  value: string
  onChangeValue: (surname: string) => void
  onGotraDetected: (gotra: string) => void
  placeholder?: string
}

export function CasteSelect({
  value,
  onChangeValue,
  onGotraDetected,
  placeholder = 'Type surname / caste to search…',
}: CasteSelectProps) {
  const gotraList = useGotraList()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  const surnameIndex = useMemo<SurnameEntry[]>(() => {
    const entries: SurnameEntry[] = []
    for (const g of gotraList) {
      for (const s of g.surnames) {
        entries.push({ surname: s, gotra: g.gotra, nepali: g.nepali })
      }
    }
    return entries.sort((a, b) => a.surname.localeCompare(b.surname))
  }, [gotraList])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return surnameIndex.slice(0, 40)
    return surnameIndex.filter(e =>
      e.surname.toLowerCase().includes(q) ||
      e.gotra.toLowerCase().includes(q) ||
      e.nepali.includes(query)
    ).slice(0, 60)
  }, [query, surnameIndex])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pick = (entry: SurnameEntry) => {
    setQuery(entry.surname)
    onChangeValue(entry.surname)
    onGotraDetected(entry.gotra)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative group">
      <input
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          onChangeValue(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-colors placeholder:text-outline-variant/60"
      />
      <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl z-30 overflow-hidden"
             style={{ boxShadow: '0 12px 40px rgba(27,67,50,0.12)' }}>
          <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low">
            <p className="text-[11px] font-sans text-on-surface-variant">
              {filtered.length} surname{filtered.length !== 1 ? 's' : ''} found
              {query.trim() === '' ? ' — type to filter' : ''}
              {' · '}Gotra auto-fills on selection
            </p>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.map(e => (
              <li key={`${e.gotra}-${e.surname}`}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2.5 font-sans hover:bg-surface-container transition-colors border-b border-outline-variant/20 last:border-0 flex items-center justify-between gap-3 ${
                    value === e.surname ? 'bg-secondary-container/30' : ''
                  }`}
                  onClick={() => pick(e)}
                >
                  <span className="text-body-md text-primary font-medium">{e.surname}</span>
                  <span
                    className="flex-shrink-0 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#fef3c7', color: '#92400e' }}
                  >
                    {e.gotra} · {e.nepali}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
