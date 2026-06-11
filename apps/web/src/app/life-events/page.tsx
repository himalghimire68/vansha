'use client'

import DashboardLayout from '@/app/dashboard-layout'
import { useLanguage } from '@/providers/LanguageProvider'

export default function LifeEventsPage() {
  const { t } = useLanguage()

  const ITEMS = [
    { icon: '🌱', title: t('events.births'),       desc: t('events.birthsDesc') },
    { icon: '💍', title: t('events.marriages'),    desc: t('events.marriagesDesc') },
    { icon: '🚢', title: t('events.migrations'),   desc: t('events.migrationsDesc') },
    { icon: '⭐', title: t('events.achievements'), desc: t('events.achievementsDesc') },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-serif text-headline-lg text-primary mb-2">{t('events.heading')}</h1>
          <p className="font-sans text-body-md text-on-surface-variant">{t('events.subtext')}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
          <span className="text-5xl block mb-4">📅</span>
          <h2 className="font-serif text-headline-md text-primary mb-3">{t('events.comingSoonTitle')}</h2>
          <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">{t('events.comingSoonDesc')}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {ITEMS.map(item => (
            <div key={item.title} className="bg-surface-container-low border border-outline-variant rounded-xl p-5">
              <span className="text-2xl block mb-2">{item.icon}</span>
              <h3 className="font-serif text-body-md text-primary mb-1">{item.title}</h3>
              <p className="font-sans text-caption text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
