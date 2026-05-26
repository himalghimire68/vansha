'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api } from '@/lib/api'

const NEPAL_PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
]

export default function AddPersonPage() {
  const params = useParams()
  const router = useRouter()
  const treeId = params?.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
      }
      await api.createPerson(treeId, payload)
      router.push(`/trees/${treeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person. Please try again.')
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-outline-variant/60'

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <Link href={`/trees/${treeId}`} className="hover:text-primary transition-colors">Family Tree</Link>
          <span>›</span>
          <span className="text-primary">Add Ancestor</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-10 archival-shadow">
          <div className="mb-8">
            <h1 className="font-serif text-headline-lg text-primary mb-2">Add an Ancestor</h1>
            <p className="font-sans text-body-md text-on-surface-variant">
              Record a member of this family lineage. Every entry enriches the archive.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Full Name</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={set('firstName')}
                    placeholder="e.g. Ram"
                    required
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Middle Name</label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={set('middleName')}
                    placeholder="e.g. Prasad"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={set('lastName')}
                    placeholder="e.g. Ghimire"
                    required
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Nepali Name</label>
                  <input
                    type="text"
                    value={form.nepaliName}
                    onChange={set('nepaliName')}
                    placeholder="नेपाली नाम"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
            </fieldset>

            {/* Gender & Status */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Vital Details</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Gender</label>
                  <select
                    value={form.gender}
                    onChange={set('gender')}
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Status</label>
                  <select
                    value={form.isLiving ? 'living' : 'ancestor'}
                    onChange={(e) => setForm((prev) => ({ ...prev, isLiving: e.target.value === 'living' }))}
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors"
                  >
                    <option value="living">Living</option>
                    <option value="ancestor">Ancestor (Deceased)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Birth Date</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={set('birthDate')}
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                {!form.isLiving && (
                  <div className="relative group">
                    <label className="text-caption font-sans text-on-surface-variant mb-1 block">Death Date</label>
                    <input
                      type="date"
                      value={form.deathDate}
                      onChange={set('deathDate')}
                      className={inputClass}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Heritage */}
            <fieldset className="space-y-5">
              <legend className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Lineage & Heritage</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Gotra</label>
                  <input
                    type="text"
                    value={form.gotra}
                    onChange={set('gotra')}
                    placeholder="e.g. Kashyap"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Caste / Community</label>
                  <input
                    type="text"
                    value={form.caste}
                    onChange={set('caste')}
                    placeholder="e.g. Brahmin"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Ancestral Village</label>
                  <input
                    type="text"
                    value={form.ancestralVillage}
                    onChange={set('ancestralVillage')}
                    placeholder="e.g. Gorkha"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div className="relative group">
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">District</label>
                  <input
                    type="text"
                    value={form.ancestralDistrict}
                    onChange={set('ancestralDistrict')}
                    placeholder="e.g. Gorkha"
                    className={inputClass}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
                <div>
                  <label className="text-caption font-sans text-on-surface-variant mb-1 block">Province</label>
                  <select
                    value={form.ancestralProvince}
                    onChange={set('ancestralProvince')}
                    className="w-full bg-transparent border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors"
                  >
                    <option value="">Select province</option>
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Biography */}
            <div className="space-y-2">
              <label className="text-caption font-sans text-on-surface-variant block">Biography / Life Story</label>
              <textarea
                value={form.biography}
                onChange={set('biography')}
                placeholder="Share what is remembered of this ancestor's life, achievements, and character..."
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-colors resize-none placeholder:text-outline-variant/60"
              />
            </div>

            {error && (
              <p className="text-v-error text-caption font-sans font-medium italic">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Inscribing to Archive...
                  </>
                ) : (
                  <>
                    <span>📜</span>
                    Record This Ancestor
                  </>
                )}
              </button>
              <Link
                href={`/trees/${treeId}`}
                className="px-6 py-4 border border-outline-variant text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary hover:text-primary transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Tip */}
        <div className="bg-secondary-container/40 border border-secondary-fixed/30 rounded-xl p-5 flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-sans text-label-md text-on-secondary-container mb-1">Archival Guidance</p>
            <p className="font-sans text-caption text-on-secondary-container/80">
              For living individuals, only first and last name are required. Add as much or as little
              detail as the family is comfortable sharing — privacy settings can be adjusted later.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
