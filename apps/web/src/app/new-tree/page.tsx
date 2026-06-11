'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api } from '@/lib/api'
import { useLanguage } from '@/providers/LanguageProvider'

const PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
]

export default function NewTreePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('')
  const [province, setProvince] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError(t('newTree.nameRequired')); return }
    setError('')
    setIsLoading(true)
    try {
      const family = await api.createFamily({
        name: name.trim(),
        description: description.trim() || undefined,
        ancestralVillage: village.trim() || undefined,
        ancestralDistrict: district.trim() || undefined,
        ancestralProvince: province || undefined,
      } as any)
      router.push(`/trees/${family.id}`)
    } catch {
      setError(t('newTree.failed'))
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant mb-8">
          <Link href="/dashboard" className="hover:text-primary transition-colors">{t('common.dashboard')}</Link>
          <span>›</span>
          <span className="text-primary">{t('newTree.breadcrumb')}</span>
        </div>

        <div className="mb-10">
          <h1 className="font-serif text-headline-lg text-primary mb-2">{t('newTree.title')}</h1>
          <p className="font-sans text-body-md text-on-surface-variant">{t('newTree.subtitle')}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 archival-shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Family Name */}
            <div className="space-y-2">
              <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2">
                <span>📜</span> {t('newTree.nameLabel')} <span className="text-v-error">*</span>
              </label>
              <div className="relative group">
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t('newTree.namePlaceholder')} required
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2">
                <span>✍</span> {t('newTree.descLabel')} <span className="text-on-surface-variant/40 font-normal">{t('newTree.optional')}</span>
              </label>
              <div className="relative group">
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('newTree.descPlaceholder')} rows={3}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline resize-none"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Ancestral Origin */}
            <div>
              <h3 className="font-serif text-headline-md text-primary mb-4">{t('newTree.originTitle')}</h3>
              <p className="font-sans text-caption text-on-surface-variant mb-6">{t('newTree.originSubtitle')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2">
                    <span>🏡</span> {t('newTree.village')}
                  </label>
                  <div className="relative group">
                    <input type="text" value={village} onChange={(e) => setVillage(e.target.value)}
                      placeholder={t('newTree.villagePlaceholder')}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2">
                    <span>📍</span> {t('newTree.district')}
                  </label>
                  <div className="relative group">
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                      placeholder={t('newTree.villagePlaceholder')}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all placeholder:text-outline"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2">
                    <span>🗺</span> {t('newTree.province')}
                  </label>
                  <div className="relative group">
                    <select value={province} onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">{t('newTree.selectProvince')}</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      <option value="Other">{t('newTree.otherIntl')}</option>
                    </select>
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error-container border border-on-error-container/20 rounded-xl text-on-error-container font-sans text-body-md">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
              <Link href="/dashboard" className="flex-1 text-center py-4 border border-outline text-on-surface-variant text-label-md font-sans rounded-brand hover:border-secondary hover:text-secondary transition-all">
                {t('newTree.cancel')}
              </Link>
              <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow disabled:opacity-60">
                {isLoading ? (
                  <><span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin-slow" />{t('newTree.submitting')}</>
                ) : (
                  <><span>🌳</span>{t('newTree.submit')}</>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-5 bg-secondary-container/40 border border-secondary-fixed/50 rounded-xl">
          <p className="font-sans text-body-md text-on-secondary-container">
            <strong className="font-semibold">{t('newTree.tip')}</strong> {t('newTree.tipBody')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
