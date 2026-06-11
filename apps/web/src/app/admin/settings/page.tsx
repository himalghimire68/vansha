'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '../admin-context'
import { adminApi } from '@/lib/adminApi'

const THEMES = [
  { id: 'forest',  label: 'Forest',  bg: '#f0fdf4', accent: '#40916c', desc: 'Default green heritage tone' },
  { id: 'ocean',   label: 'Ocean',   bg: '#f0f7ff', accent: '#1d6fa4', desc: 'Cool blue ocean palette' },
  { id: 'heritage',label: 'Heritage',bg: '#fdf8f0', accent: '#92400e', desc: 'Warm amber archival feel' },
  { id: 'slate',   label: 'Slate',   bg: '#f8fafc', accent: '#475569', desc: 'Minimal cool grey' },
]

const HEADING_FONTS = [
  { id: 'libre-caslon',     label: 'Libre Caslon',      sample: 'Heritage Archive',  style: { fontFamily: "'Libre Caslon Text', Georgia, serif" } },
  { id: 'playfair-display', label: 'Playfair Display',  sample: 'Heritage Archive',  style: { fontFamily: "'Playfair Display', Georgia, serif" } },
  { id: 'eb-garamond',      label: 'EB Garamond',       sample: 'Heritage Archive',  style: { fontFamily: "'EB Garamond', Georgia, serif" } },
]

const BODY_FONTS = [
  { id: 'inter',       label: 'Inter',         sample: 'Clean and modern',        style: { fontFamily: "'Inter', system-ui, sans-serif" } },
  { id: 'nunito',      label: 'Nunito',        sample: 'Friendly and rounded',    style: { fontFamily: "'Nunito', system-ui, sans-serif" } },
  { id: 'source-sans', label: 'Source Sans 3', sample: 'Legible and neutral',     style: { fontFamily: "'Source Sans 3', system-ui, sans-serif" } },
]

interface Config {
  theme: string
  'font.heading': string
  'font.body': string
  'tree.defaultView': string
  'tree.showRelations': string
  'tree.showBirthYear': string
  'tree.showPhoto': string
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[19px]' : 'translate-x-0.5'}`}
          style={{ width: 18, height: 18, top: 2, left: 2, transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  )
}

export default function AdminSettingsPage() {
  const { adminKey, onUnauthorized } = useAdmin()
  const [config, setConfig] = useState<Config>({
    theme: 'forest',
    'font.heading': 'libre-caslon',
    'font.body': 'inter',
    'tree.defaultView': 'standard',
    'tree.showRelations': 'true',
    'tree.showBirthYear': 'true',
    'tree.showPhoto': 'true',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!adminKey) return
    adminApi.getConfig(adminKey)
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }) as Config)
        setLoading(false)
      })
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') onUnauthorized()
        else setErr('Failed to load settings.')
        setLoading(false)
      })
  }, [adminKey])

  const update = async (patch: Partial<Config>) => {
    const next = { ...config, ...patch }
    setConfig(next)
    setSaving(true)
    setSaved(false)
    try {
      await adminApi.updateConfig(adminKey, patch as Record<string, string>)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') onUnauthorized()
      else setErr('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse mb-4" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Theme, typography, and tree defaults</p>
        </div>
        {saved && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            Saved
          </span>
        )}
        {saving && (
          <span className="text-xs text-slate-400">Savingâ€¦</span>
        )}
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
      )}

      {/* Color Theme */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Color Theme</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => update({ theme: t.id })}
              className={`rounded-xl p-3 border-2 transition-all text-left ${
                config.theme === t.id
                  ? 'border-blue-500 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className="w-full h-8 rounded-lg mb-2"
                style={{ background: `linear-gradient(135deg, ${t.bg} 0%, ${t.accent}33 100%)`, border: `2px solid ${t.accent}40` }}
              />
              <div className="text-xs font-semibold text-slate-700">{t.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-5">Typography</h2>

        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Heading Font</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {HEADING_FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => update({ 'font.heading': f.id })}
                className={`rounded-xl p-4 border-2 transition-all text-left ${
                  config['font.heading'] === f.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1" style={f.style}>{f.sample}</div>
                <div className="text-[11px] text-slate-500 font-medium">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Body Font</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {BODY_FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => update({ 'font.body': f.id })}
                className={`rounded-xl p-4 border-2 transition-all text-left ${
                  config['font.body'] === f.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm mb-1" style={f.style}>{f.sample}</div>
                <div className="text-[11px] text-slate-500 font-medium">{f.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tree Defaults */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Tree Defaults</h2>
        <p className="text-xs text-slate-400 mb-4">Applied when members open a tree for the first time</p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Default View</p>
          <div className="flex gap-3">
            {['standard', 'pedigree'].map(v => (
              <button
                key={v}
                onClick={() => update({ 'tree.defaultView': v })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                  config['tree.defaultView'] === v
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {v === 'standard' ? 'Standard tree' : 'Pedigree view'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Visible Info on Nodes</p>
          <Toggle
            label="Show relationship label"
            checked={config['tree.showRelations'] !== 'false'}
            onChange={v => update({ 'tree.showRelations': v ? 'true' : 'false' })}
          />
          <Toggle
            label="Show birth year"
            checked={config['tree.showBirthYear'] !== 'false'}
            onChange={v => update({ 'tree.showBirthYear': v ? 'true' : 'false' })}
          />
          <Toggle
            label="Show profile photo"
            checked={config['tree.showPhoto'] !== 'false'}
            onChange={v => update({ 'tree.showPhoto': v ? 'true' : 'false' })}
          />
        </div>
      </section>
    </div>
  )
}
