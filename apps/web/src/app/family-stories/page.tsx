'use client'

import DashboardLayout from '@/app/dashboard-layout'
import { useLanguage } from '@/providers/LanguageProvider'

export default function FamilyStoriesPage() {
  const { t } = useLanguage()

  const ITEMS = [
    { icon: '✍️', title: t('stories.write'), desc: t('stories.writeDesc') },
    { icon: '🎙️', title: t('stories.audio'), desc: t('stories.audioDesc') },
    { icon: '🔗', title: t('stories.link'),  desc: t('stories.linkDesc') },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-serif text-headline-lg text-primary mb-2">{t('stories.heading')}</h1>
          <p className="font-sans text-body-md text-on-surface-variant">{t('stories.subtext')}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
          <span className="text-5xl block mb-4">📖</span>
          <h2 className="font-serif text-headline-md text-primary mb-3">{t('stories.comingSoonTitle')}</h2>
          <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">{t('stories.comingSoonDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ITEMS.map(item => (
            <div key={item.title} className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <span className="text-3xl block mb-3">{item.icon}</span>
              <h3 className="font-serif text-body-lg text-primary mb-1">{item.title}</h3>
              <p className="font-sans text-caption text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
