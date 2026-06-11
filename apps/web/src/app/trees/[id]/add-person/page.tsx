'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api, ApiPerson } from '@/lib/api'
import { GotraSelect, SurnameSelect, CasteSelect } from '@/components/GotraSelect'
import { useLanguage } from '@/providers/LanguageProvider'

const NEPAL_PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
]

// BFS from a root person; returns map of personId → generation relative to root (0 = same gen)
function buildRelativeGenMap(rootId: string, people: ApiPerson[]): Map<string, number> {
  const byId = new Map(people.map(p => [p.id, p]))
  const map = new Map<string, number>([[rootId, 0]])
  const queue: { id: string; gen: number }[] = [{ id: rootId, gen: 0 }]

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    const p = byId.get(id)
    if (!p) continue
    for (const pid of [p.fatherId, p.motherId]) {
      if (pid && !map.has(pid)) {
        map.set(pid, gen - 1)
        queue.push({ id: pid, gen: gen - 1 })
      }
    }
    for (const child of people) {
      if ((child.fatherId === id || child.motherId === id) && !map.has(child.id)) {
        map.set(child.id, gen + 1)
        queue.push({ id: child.id, gen: gen + 1 })
      }
    }
  }

  return map
}

export default function AddPersonPage() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const treeId = params?.id as string

  // Pre-fill context from "Add Child" popup link
  const prefilledParentId = searchParams?.get('parentId') ?? ''
  const prefilledParentRole = (searchParams?.get('parentRole') ?? '') as 'father' | 'mother' | ''

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [existingPeople, setExistingPeople] = useState<ApiPerson[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!treeId) return
    const load = async () => {
      try {
        // Load current family first so the form is usable immediately
        const current = await api.getPeople(treeId)
        setExistingPeople(current)
        // Then load other families and merge in, labelled with family name
        const families = await api.getFamilies()
        const others = families.filter(f => f.id !== treeId)
        const batches = await Promise.all(others.map(f => api.getPeople(f.id).catch(() => [] as ApiPerson[])))
        const crossFamilyPeople = batches.flatMap((people, i) =>
          people.map(p => ({ ...p, _crossFamily: true as const, _familyName: others[i].name }))
        )
        if (crossFamilyPeople.length > 0) {
          setExistingPeople(prev => {
            const existingIds = new Set(prev.map(x => x.id))
            return [...prev, ...crossFamilyPeople.filter(p => !existingIds.has(p.id))]
          })
        }
      } catch {}
    }
    load()
  }, [treeId])

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nepaliName: '',
    gender: 'male',
    birthDate: '',
    deathDate: '',
    isLiving: true,
    gotra: '',
    caste: '',
    ancestralVillage: '',
    ancestralDistrict: '',
    ancestralProvince: '',
    biography: '',
    occupation: '',
    photoUrl: '',
    fatherId: prefilledParentRole === 'father' ? prefilledParentId : '',
    motherId: prefilledParentRole === 'mother' ? prefilledParentId : '',
    birthOrder: '',
  })

  // Generation map relative to the pre-filled parent (0 = same generation)
  const genMap = useMemo(
    () => prefilledParentId && existingPeople.length > 0
      ? buildRelativeGenMap(prefilledParentId, existingPeople)
      : new Map<string, number>(),
    [prefilledParentId, existingPeople],
  )

  const prefilledPerson = existingPeople.find(p => p.id === prefilledParentId)

  // When adding from "Add Child" context, filter the co-parent to same generation only
  const isSameGen = (p: ApiPerson) => {
    if (!prefilledParentId) return true
    const g = genMap.get(p.id)
    return g === 0 || g === undefined // same gen or not yet connected to tree
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be smaller than 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPhotoPreview(dataUrl)
      setForm(prev => ({ ...prev, photoUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setForm(prev => ({ ...prev, photoUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const payload: Record<string, unknown> = {
        ...form,
        isLiving: form.isLiving,
        birthDate: form.birthDate || undefined,
        deathDate: form.deathDate || undefined,
        photoUrl: form.photoUrl || undefined,
        fatherId: form.fatherId || undefined,
        motherId: form.motherId || undefined,
        birthOrder: form.birthOrder ? Number(form.birthOrder) : undefined,
      }
      await api.createPerson(treeId, payload)
      router.refresh()
      router.push(`/trees/${treeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person. Please try again.')
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-outline-variant/60'

  const selectClass =
    'w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors'

  const isAddingChild = !!prefilledParentId && !!prefilledParentRole

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">{t('common.dashboard')}</Link>
          <span>›</span>
          <Link href={`/trees/${treeId}`} className="hover:text-primary transition-colors">{t('tree.heading')}</Link>
          <span>›</span>
          <span className="text-primary">{isAddingChild ? t('person.addChild') : t('person.addAncestor')}</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-10 archival-shadow">
          <div className="mb-8">
            {isAddingChild && prefilledPerson ? (
              <>
                <h1 className="font-serif text-headline-lg text-primary mb-2">
                  {t('person.addChild')} — {prefilledPerson.firstName} {prefilledPerson.lastName}
                </h1>
                <p className="font-sans text-body-md text-on-surface-variant">
                  {t('person.parentsDesc')}
                </p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-headline-lg text-primary mb-2">{t('person.addAncestor')}</h1>
                <p className="font-sans text-body-md text-on-surface-variant">
                  {t('person.archivalTip')}
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative w-28 h-28 rounded-full border-2 border-dashed border-outline-variant hover:border-secondary transition-colors cursor-pointer overflow-hidden bg-surface-container"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-on-surface-variant">
                    <span className="text-3xl">📷</span>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wide">{t('person.photo')}</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-label-md font-sans text-secondary hover:underline transition-colors">
                  {photoPreview ? t('person.changePhoto') : t('person.uploadPhoto')}
                </button>
                {photoPreview && (
                  <button type="button" onClick={removePhoto}
                    className="text-label-md font-sans text-v-error hover:underline transition-colors">
                    {t('person.removePhoto')}
                  </button>
                )}
              </div>
              <p className="text-caption font-sans text-on-surface-variant/60">{t('person.photoHint')}</p>
            </div>

            {/* Name */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">{t('person.fullName')}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.firstName')} *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')}
                    placeholder={t('person.firstHolder')} required className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.middleName')}</label>
                  <input type="text" value={form.middleName} onChange={set('middleName')}
                    placeholder={t('person.middleHolder')} className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">
                    {t('person.lastName')} *
                    {form.gotra && <span className="ml-2 text-[10px] text-tertiary-container opacity-80">{t('person.casteHelper')}</span>}
                  </label>
                  <SurnameSelect value={form.lastName} gotra={form.gotra}
                    onChange={(s) => setForm(prev => ({ ...prev, lastName: s }))} placeholder={t('person.lastHolder')} />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.nepaliName')}</label>
                  <input type="text" value={form.nepaliName} onChange={set('nepaliName')}
                    placeholder="नेपाली नाम" className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
            </fieldset>

            {/* Vital Details */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">{t('person.vitalDetails')}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.gender')}</label>
                  <select value={form.gender} onChange={set('gender')} className={selectClass}>
                    <option value="male">{t('person.male')}</option>
                    <option value="female">{t('person.female')}</option>
                    <option value="other">{t('person.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.status')}</label>
                  <select value={form.isLiving ? 'living' : 'ancestor'}
                    onChange={(e) => setForm(prev => ({ ...prev, isLiving: e.target.value === 'living' }))}
                    className={selectClass}>
                    <option value="living">{t('person.living')}</option>
                    <option value="ancestor">{t('person.deceased')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.birthDate')}</label>
                  <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                {!form.isLiving && (
                  <div className="relative group">
                    <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.deathDate')}</label>
                    <input type="date" value={form.deathDate} onChange={set('deathDate')} className={inputClass} />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                )}
              </div>
              <div className="relative group" style={{ maxWidth: 180 }}>
                <label className="text-caption font-sans text-on-surface-variant mb-1 block">
                  {t('person.birthOrder')}
                </label>
                <input type="number" min="1" max="20" value={form.birthOrder} onChange={set('birthOrder')}
                  placeholder={t('person.birthOrderHolder')} className={inputClass} />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
            </fieldset>

            {/* Heritage */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">{t('person.heritageSection')}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">
                    {t('person.gotra')}
                    <span className="ml-2 text-[10px] text-on-surface-variant/50">{t('person.gotraHelper')}</span>
                  </label>
                  <GotraSelect value={form.gotra} onChange={(g) => setForm(prev => ({ ...prev, gotra: g }))} />
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">
                    {t('person.caste')}
                    {form.gotra && (
                      <span className="ml-2 text-[10px] text-tertiary-container opacity-80">{t('person.casteHelper')}</span>
                    )}
                  </label>
                  <CasteSelect value={form.caste}
                    onChangeValue={(v) => setForm(prev => ({ ...prev, caste: v }))}
                    onGotraDetected={(g) => setForm(prev => ({ ...prev, gotra: g }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.village')}</label>
                  <input type="text" value={form.ancestralVillage} onChange={set('ancestralVillage')}
                    placeholder={t('person.villageHolder')} className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.district')}</label>
                  <input type="text" value={form.ancestralDistrict} onChange={set('ancestralDistrict')}
                    placeholder={t('person.districtHolder')} className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('person.province')}</label>
                  <select value={form.ancestralProvince} onChange={set('ancestralProvince')} className={selectClass}>
                    <option value="">{t('newTree.selectProvince')}</option>
                    {NEPAL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Parent Links */}
            {(existingPeople.length > 0 || isAddingChild) && (
              <fieldset className="space-y-5">
                <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">{t('person.parentsSection')}</legend>
                <p className="text-caption font-sans text-on-surface-variant -mt-2">
                  {isAddingChild && prefilledPerson
                    ? <>
                        <span className="font-semibold text-primary">{prefilledPerson.firstName} {prefilledPerson.lastName}</span>
                        {' '}{t('person.parentsDesc')}
                      </>
                    : t('person.parentsDesc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Father field */}
                  <div>
                    <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('modal.father')}</label>
                    {prefilledParentRole === 'father' && prefilledParentId ? (
                      // Locked chip — this person is pre-selected as father
                      <div className="flex items-center gap-2 py-3 px-3 rounded-xl border border-secondary/40 bg-secondary-container/30">
                        <span className="text-sm">👤</span>
                        <span className="flex-1 font-sans text-body-md text-primary font-semibold">
                          {prefilledPerson
                            ? `${prefilledPerson.firstName} ${prefilledPerson.lastName}`
                            : prefilledParentId}
                        </span>
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: '#d8f3dc', color: '#1b4332' }}>
                          {t('person.preset')}
                        </span>
                      </div>
                    ) : (
                      <select value={form.fatherId} onChange={set('fatherId')} className={selectClass}>
                        <option value="">{t('person.selectParent')}</option>
                        {existingPeople
                          .filter(p => (p.gender === 'male' || p.gender === 'other') && isSameGen(p))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.firstName} {p.lastName}
                              {p._crossFamily && p._familyName ? ` [${p._familyName}]` : ''}
                              {p.birthDate ? ` (b. ${new Date(p.birthDate).getFullYear()})` : ''}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Mother field */}
                  <div>
                    <label className="text-caption font-sans text-on-surface-variant mb-1 block">{t('modal.mother')}</label>
                    {prefilledParentRole === 'mother' && prefilledParentId ? (
                      // Locked chip — this person is pre-selected as mother
                      <div className="flex items-center gap-2 py-3 px-3 rounded-xl border border-secondary/40 bg-secondary-container/30">
                        <span className="text-sm">👤</span>
                        <span className="flex-1 font-sans text-body-md text-primary font-semibold">
                          {prefilledPerson
                            ? `${prefilledPerson.firstName} ${prefilledPerson.lastName}`
                            : prefilledParentId}
                        </span>
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: '#d8f3dc', color: '#1b4332' }}>
                          {t('person.preset')}
                        </span>
                      </div>
                    ) : (
                      <select value={form.motherId} onChange={set('motherId')} className={selectClass}>
                        <option value="">{t('person.selectParent')}</option>
                        {existingPeople
                          .filter(p => (p.gender === 'female' || p.gender === 'other') && isSameGen(p))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.firstName} {p.lastName}
                              {p._crossFamily && p._familyName ? ` [${p._familyName}]` : ''}
                              {p.birthDate ? ` (b. ${new Date(p.birthDate).getFullYear()})` : ''}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              </fieldset>
            )}

            {/* Biography */}
            <div className="space-y-2">
              <label className="text-caption font-sans text-on-surface-variant block">{t('person.biography')}</label>
              <textarea value={form.biography} onChange={set('biography')}
                placeholder={t('person.bioHolder')}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors resize-none placeholder:text-outline-variant/60"
              />
            </div>

            {error && <p className="text-v-error text-caption font-sans font-medium italic">{error}</p>}

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={isLoading}
                className="flex-1 bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow disabled:opacity-70">
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    {t('person.inscribing')}
                  </>
                ) : (
                  <><span>📜</span>{isAddingChild ? t('person.addChild') : t('person.recordAncestor')}</>
                )}
              </button>
              <Link href={`/trees/${treeId}`}
                className="px-6 py-4 border border-outline-variant text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary hover:text-primary transition-all">
                {t('person.cancel')}
              </Link>
            </div>
          </form>
        </div>

        {/* Tip */}
        <div className="bg-secondary-container/40 border border-secondary-fixed/30 rounded-xl p-5 flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-sans text-label-md text-on-secondary-container mb-1">{t('person.archivalGuide')}</p>
            <p className="font-sans text-caption text-on-secondary-container/80">{t('person.archivalTip')}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
