'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils'
import { useLanguage } from '@/providers/LanguageProvider'
import { LanguageToggle } from '@/components/LanguageToggle'
import { clearAuth } from '@/lib/api'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { href: '/dashboard',             label: t('nav.ancestryTree'),     icon: '🌳' },
    { href: '/explore-relationships', label: t('nav.exploreRelations'), icon: '🔍' },
    { href: '/family-stories',        label: t('nav.familyStories'),    icon: '📖' },
    { href: '/document-archive',      label: t('nav.documentArchive'),  icon: '📦' },
    { href: '/life-events',           label: t('nav.lifeEvents'),       icon: '📅' },
  ]

  const BOTTOM_NAV = [
    { href: '/dashboard',             icon: '🏠', label: t('nav.home')    },
    { href: '/family-stories',        icon: '📖', label: t('nav.stories') },
    { href: '/new-tree',              icon: '＋', label: t('nav.new')     },
    { href: '/explore-relationships', icon: '🔍', label: t('nav.explore') },
    { href: '/life-events',           icon: '📅', label: t('nav.events')  },
  ]

  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 w-64 bg-surface-container-low border-r border-outline-variant z-50 p-6 gap-4 flex-shrink-0">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌿</span>
            <h1 className="font-serif text-headline-md text-primary tracking-tight">{t('site.name')}</h1>
          </Link>
          <p className="text-caption font-sans text-on-surface-variant opacity-70 pl-8">{t('site.tagline')}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-label-md font-sans',
                  active
                    ? 'bg-secondary-container text-on-secondary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-outline-variant space-y-2">
          <Link
            href="/new-tree"
            className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-label-md font-sans"
          >
            <span>+</span>
            <span>{t('dash.newTree')}</span>
          </Link>
          <button
            onClick={() => { clearAuth(); window.location.href = '/login' }}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-label-md font-sans"
          >
            <span>🚪</span>
            <span>{t('nav.signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-10 py-4 glass-header bg-surface/90 border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <span className="md:hidden font-serif text-headline-md text-primary tracking-tight">{t('site.name')}</span>
            <div className="hidden md:flex bg-surface-container rounded-full px-4 py-1.5 items-center gap-2 border border-outline-variant focus-within:border-secondary transition-colors">
              <span className="text-on-surface-variant text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-body-md font-sans p-0 w-48 text-on-surface placeholder:text-outline"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
              <span className="text-xl">⚙️</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-container border-2 border-secondary-container flex items-center justify-center text-on-primary-container font-serif text-sm font-semibold">
              V
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container-low border-b border-outline-variant px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high text-label-md font-sans"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/new-tree"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-on-primary text-label-md font-sans mt-2"
            >
              <span>+</span>
              <span>{t('dash.newTree')}</span>
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-center px-4 py-3 pb-safe bg-surface border-t border-outline-variant">
        {BOTTOM_NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all',
                active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant',
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-sans font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
