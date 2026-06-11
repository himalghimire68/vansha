'use client'

import { useEffect, useState, useRef } from 'react'
import { useAdmin } from '../admin-context'
import { adminApi } from '@/lib/adminApi'

// â”€â”€ Editable field types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FieldDef {
  key: string
  label: string
  hint?: string
  multiline?: boolean
}

const SECTIONS: { heading: string; fields: FieldDef[] }[] = [
  {
    heading: 'Site Identity',
    fields: [
      { key: 'content.site.name', label: 'Site Name', hint: 'Shown in nav, page title, footer' },
      { key: 'content.footer.copyright', label: 'Footer Copyright Text' },
    ],
  },
  {
    heading: 'Homepage â€” Hero',
    fields: [
      { key: 'content.homepage.hero.badge',    label: 'Badge Text',          hint: 'Small tag above the headline, e.g. "The Living Archive"' },
      { key: 'content.homepage.hero.title',    label: 'Hero Headline',        hint: 'Main headline on the landing page', multiline: true },
      { key: 'content.homepage.hero.subtitle', label: 'Hero Subtitle',        hint: 'Paragraph below the headline', multiline: true },
    ],
  },
  {
    heading: 'Homepage â€” Showcase Card',
    fields: [
      { key: 'content.homepage.showcase.name',   label: 'Lineage Name',   hint: 'e.g. "The Ghimire Lineage"' },
      { key: 'content.homepage.showcase.detail', label: 'Lineage Detail',  hint: 'e.g. "Six generations Â· Gorkha, Nepal Â· Est. 1820"' },
    ],
  },
  {
    heading: 'Homepage â€” Philosophy Quote',
    fields: [
      { key: 'content.homepage.quote',        label: 'Quote Text',   multiline: true },
      { key: 'content.homepage.quote.author', label: 'Attribution',  hint: 'Author name without the dash, e.g. "Marcus Garvey"' },
    ],
  },
  {
    heading: 'Homepage â€” CTA Section',
    fields: [
      { key: 'content.homepage.cta.title',    label: 'CTA Headline', multiline: false },
      { key: 'content.homepage.cta.subtitle', label: 'CTA Subtext',  multiline: true },
    ],
  },
  {
    heading: 'User Dashboard',
    fields: [
      { key: 'content.dashboard.greeting', label: 'Dashboard Greeting', hint: 'The "Welcome back, â€¦" headline shown on the user dashboard' },
    ],
  },
]

// â”€â”€ Single field row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FieldRow({
  def,
  value,
  onSave,
}: {
  def: FieldDef
  value: string
  onSave: (key: string, value: string) => Promise<void>
}) {
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const dirty = draft !== value

  // Sync when parent value changes (e.g. after initial load)
  const prevValue = useRef(value)
  if (prevValue.current !== value) {
    prevValue.current = value
    setDraft(value)
  }

  const save = async () => {
    setSaving(true)
    setErr('')
    try {
      await onSave(def.key, draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <div>
          <label className="text-sm font-semibold text-slate-700">{def.label}</label>
          {def.hint && <p className="text-xs text-slate-400 mt-0.5">{def.hint}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {saved && <span className="text-xs text-emerald-600 font-semibold">Saved</span>}
          {err && <span className="text-xs text-red-500 max-w-[180px] truncate" title={err}>Error</span>}
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Savingâ€¦' : 'Save'}
            </button>
          )}
          {dirty && !saving && (
            <button
              onClick={() => setDraft(value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {def.multiline ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 resize-y transition-colors"
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 transition-colors"
        />
      )}
    </div>
  )
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminContentPage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!adminKey) return
    adminApi.getConfig(adminKey)
      .then(setConfig)
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr(e.message)
      })
      .finally(() => setLoading(false))
  }, [adminKey])

  const handleSave = async (key: string, value: string) => {
    try {
      const updated = await adminApi.updateConfig(adminKey, { [key]: value })
      setConfig(updated)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      throw e
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse mb-4" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Edit the text shown to users across the site. Changes apply immediately.</p>
      </div>

      {err && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono break-all">{err}</div>
      )}

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <section key={section.heading} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.heading}</h2>
            </div>
            <div className="px-6">
              {section.fields.map(def => (
                <FieldRow
                  key={def.key}
                  def={def}
                  value={config[def.key] ?? ''}
                  onSave={handleSave}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
