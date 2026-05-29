'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api } from '@/lib/api'
import { GotraSelect, SurnameSelect, CasteSelect } from '@/components/GotraSelect'

const NEPAL_PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
]

export default function EditPersonPage() {
  const params = useParams()
  const router = useRouter()
  const treeId = params?.id as string
  const personId = params?.personId as string

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    birthOrder: '',
  })

  useEffect(() => {
    if (!treeId || !personId) return
    api.getPerson(treeId, personId)
      .then(p => {
        setForm({
          firstName: p.firstName ?? '',
          middleName: p.middleName ?? '',
          lastName: p.lastName ?? '',
          nepaliName: p.nepaliName ?? '',
          gender: p.gender ?? 'male',
          birthDate: p.birthDate ? p.birthDate.split('T')[0] : '',
          deathDate: p.deathDate ? p.deathDate.split('T')[0] : '',
          isLiving: p.isLiving,
          gotra: p.gotra ?? '',
          caste: p.caste ?? '',
          ancestralVillage: p.ancestralVillage ?? '',
          ancestralDistrict: p.ancestralDistrict ?? '',
          ancestralProvince: p.ancestralProvince ?? '',
          biography: p.biography ?? '',
          occupation: p.occupation ?? '',
          photoUrl: p.photoUrl ?? '',
          birthOrder: p.birthOrder != null ? String(p.birthOrder) : '',
        })
        if (p.photoUrl) setPhotoPreview(p.photoUrl)
      })
      .catch(() => setError('Could not load person data.'))
      .finally(() => setIsFetching(false))
  }, [treeId, personId])

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
      await api.updatePerson(treeId, personId, {
        ...form,
        birthDate: form.birthDate || undefined,
        deathDate: form.deathDate || undefined,
        photoUrl: form.photoUrl || undefined,
        occupation: form.occupation || undefined,
        birthOrder: form.birthOrder ? Number(form.birthOrder) : undefined,
      })
      router.refresh()
      router.push(`/trees/${treeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-outline-variant/60'

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-4 animate-pulse pt-10">
          <div className="h-8 bg-surface-container-low rounded-xl w-48" />
          <div className="h-64 bg-surface-container-low rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <Link href={`/trees/${treeId}`} className="hover:text-primary transition-colors">Family Tree</Link>
          <span>›</span>
          <span className="text-primary">Edit Member</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-10 archival-shadow">
          <div className="mb-8">
            <h1 className="font-serif text-headline-lg text-primary mb-2">Edit Member</h1>
            <p className="font-sans text-body-md text-on-surface-variant">
              Update the details for this family member.
            </p>
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
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wide">Add Photo</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-label-md font-sans text-secondary hover:underline transition-colors">
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button type="button" onClick={removePhoto}
                    className="text-label-md font-sans text-v-error hover:underline transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <p className="text-caption font-sans text-on-surface-variant/60">JPG, PNG or WEBP · max 5 MB</p>
            </div>

            {/* Name */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Full Name</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">First Name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')}
                    placeholder="e.g. Ram" required className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Middle Name</label>
                  <input type="text" value={form.middleName} onChange={set('middleName')}
                    placeholder="e.g. Prasad" className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Last Name *</label>
                  <SurnameSelect value={form.lastName} gotra={form.gotra}
                    onChange={(s) => setForm(prev => ({ ...prev, lastName: s }))} placeholder="e.g. Ghimire" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Nepali Name</label>
                  <input type="text" value={form.nepaliName} onChange={set('nepaliName')}
                    placeholder="नेपाली नाम" className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
            </fieldset>

            {/* Vital Details */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Vital Details</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Gender</label>
                  <select value={form.gender} onChange={set('gender')}
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Status</label>
                  <select value={form.isLiving ? 'living' : 'ancestor'}
                    onChange={(e) => setForm(prev => ({ ...prev, isLiving: e.target.value === 'living' }))}
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors">
                    <option value="living">Living</option>
                    <option value="ancestor">Ancestor (Deceased)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Birth Date</label>
                  <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                {!form.isLiving && (
                  <div className="relative group">
                    <label className="text-caption font-sans text-on-surface-variant mb-1 block">Death Date</label>
                    <input type="date" value={form.deathDate} onChange={set('deathDate')} className={inputClass} />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                )}
              </div>
              <div className="relative group" style={{ maxWidth: 180 }}>
                <label className="text-caption font-sans text-on-surface-variant mb-1 block">
                  Birth Order <span className="opacity-50">(1 = eldest)</span>
                </label>
                <input type="number" min="1" max="20" value={form.birthOrder}
                  onChange={set('birthOrder')} placeholder="e.g. 1" className={inputClass} />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
            </fieldset>

            {/* Heritage */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Lineage & Heritage</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Gotra</label>
                  <GotraSelect value={form.gotra} onChange={(g) => setForm(prev => ({ ...prev, gotra: g }))} />
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Surname / Caste</label>
                  <CasteSelect
                    value={form.caste}
                    onChangeValue={(caste) => setForm(prev => ({ ...prev, caste }))}
                    onGotraDetected={(gotra) => setForm(prev => ({ ...prev, gotra: gotra || prev.gotra }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Ancestral Village</label>
                  <input type="text" value={form.ancestralVillage} onChange={set('ancestralVillage')}
                    placeholder="e.g. Gorkha" className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">District</label>
                  <input type="text" value={form.ancestralDistrict} onChange={set('ancestralDistrict')}
                    placeholder="e.g. Gorkha" className={inputClass} />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
              <div>
                <label className="text-caption font-sans text-on-surface-variant mb-1 block">Province</label>
                <select value={form.ancestralProvince} onChange={set('ancestralProvince')}
                  className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors">
                  <option value="">— Select Province —</option>
                  {NEPAL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </fieldset>

            {/* Biography & Occupation */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Life Details</legend>
              <div className="relative group">
                <label className="text-caption font-sans text-on-surface-variant mb-1 block">Occupation</label>
                <input type="text" value={form.occupation} onChange={set('occupation')}
                  placeholder="e.g. Farmer, Teacher, Merchant" className={inputClass} />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
              <div>
                <label className="text-caption font-sans text-on-surface-variant mb-2 block">Biography</label>
                <textarea
                  value={form.biography}
                  onChange={set('biography')}
                  rows={4}
                  placeholder="A brief account of their life, contributions, and legacy…"
                  className="w-full bg-transparent border border-outline-variant rounded-xl p-3 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors resize-none placeholder:text-outline-variant/60"
                />
              </div>
            </fieldset>

            {error && (
              <p className="text-v-error font-sans text-caption px-1">{error}</p>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading
                  ? <><span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Saving…</>
                  : 'Save Changes'}
              </button>
              <Link
                href={`/trees/${treeId}`}
                className="px-6 py-4 border border-outline-variant text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
