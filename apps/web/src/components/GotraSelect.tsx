'use client'

import { useState, useRef, useEffect } from 'react'
import { GOTRA_LIST, GotraEntry } from '@/lib/gotraData'

interface Props {
  value: string
  onChange: (gotra: string) => void
  placeholder?: string
}

export function GotraSelect({ value, onChange, placeholder = 'Search gotra…' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = GOTRA_LIST.find(g => g.gotra === value)
  const displayText = selected ? `${selected.gotra} (${selected.nepali})` : ''

  const filtered = query.trim()
    ? GOTRA_LIST.filter(g =>
        g.gotra.toLowerCase().includes(query.toLowerCase()) ||
        g.nepali.includes(query) ||
        g.surnames.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )
    : GOTRA_LIST

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
          {/* Search box inside dropdown */}
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
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const gotraEntry: GotraEntry | undefined = GOTRA_LIST.find(g => g.gotra === gotra)
  const allSurnames = gotraEntry?.surnames ?? []

  const filtered = query.trim()
    ? allSurnames.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : allSurnames

  // Keep the query in sync with the external value
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
