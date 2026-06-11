'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface SiteConfig {
  // appearance
  theme: string
  fontHeading: string
  fontBody: string
  // tree defaults
  treeDefaultView: string
  treeShowRelations: boolean
  treeShowBirthYear: boolean
  treeShowPhoto: boolean
  // content
  siteName: string
  heroBadge: string
  heroTitle: string
  heroSubtitle: string
  showcaseName: string
  showcaseDetail: string
  quote: string
  quoteAuthor: string
  ctaTitle: string
  ctaSubtitle: string
  dashboardGreeting: string
  footerCopyright: string
}

const defaults: SiteConfig = {
  theme: 'forest',
  fontHeading: 'libre-caslon',
  fontBody: 'inter',
  treeDefaultView: 'standard',
  treeShowRelations: true,
  treeShowBirthYear: true,
  treeShowPhoto: true,
  siteName: 'Vansha Lineage',
  heroBadge: 'The Living Archive',
  heroTitle: 'Every Family Has A Story Worth Telling',
  heroSubtitle: "Vansha Lineage is a private-by-default ancestral intelligence platform. Preserve your family's heritage, trace your lineage across generations, and discover the living threads that connect you to your ancestors.",
  showcaseName: 'The Ghimire Lineage',
  showcaseDetail: 'Six generations · Gorkha, Nepal · Est. 1820',
  quote: 'A people without the knowledge of their past history, origin and culture is like a tree without roots.',
  quoteAuthor: 'Marcus Garvey',
  ctaTitle: "Begin Your Family's Archive Today",
  ctaSubtitle: 'Join families across the world who are preserving their heritage for generations yet to come.',
  dashboardGreeting: 'Welcome back, Curator',
  footerCopyright: '© 2024 Vansha Lineage. Preserving history for the next generation.',
}

const SiteConfigContext = createContext<SiteConfig>(defaults)
export const useSiteConfig = () => useContext(SiteConfigContext)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function parseRaw(raw: Record<string, string>): SiteConfig {
  const g = (key: string, fallback: string) => raw[key] ?? fallback
  return {
    theme:              g('theme',               defaults.theme),
    fontHeading:        g('font.heading',         defaults.fontHeading),
    fontBody:           g('font.body',            defaults.fontBody),
    treeDefaultView:    g('tree.defaultView',      defaults.treeDefaultView),
    treeShowRelations:  raw['tree.showRelations'] !== 'false',
    treeShowBirthYear:  raw['tree.showBirthYear'] !== 'false',
    treeShowPhoto:      raw['tree.showPhoto']     !== 'false',
    siteName:           g('content.site.name',              defaults.siteName),
    heroBadge:          g('content.homepage.hero.badge',    defaults.heroBadge),
    heroTitle:          g('content.homepage.hero.title',    defaults.heroTitle),
    heroSubtitle:       g('content.homepage.hero.subtitle', defaults.heroSubtitle),
    showcaseName:       g('content.homepage.showcase.name',   defaults.showcaseName),
    showcaseDetail:     g('content.homepage.showcase.detail', defaults.showcaseDetail),
    quote:              g('content.homepage.quote',        defaults.quote),
    quoteAuthor:        g('content.homepage.quote.author', defaults.quoteAuthor),
    ctaTitle:           g('content.homepage.cta.title',    defaults.ctaTitle),
    ctaSubtitle:        g('content.homepage.cta.subtitle', defaults.ctaSubtitle),
    dashboardGreeting:  g('content.dashboard.greeting',    defaults.dashboardGreeting),
    footerCopyright:    g('content.footer.copyright',      defaults.footerCopyright),
  }
}

function applyToDOM(config: SiteConfig) {
  const html = document.documentElement
  html.setAttribute('data-theme', config.theme)
  html.setAttribute('data-font-heading', config.fontHeading)
  html.setAttribute('data-font-body', config.fontBody)
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaults)

  useEffect(() => {
    fetch(`${API_URL}/site-config`)
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        if (!raw) return
        const parsed = parseRaw(raw as Record<string, string>)
        setConfig(parsed)
        applyToDOM(parsed)
      })
      .catch(() => {})
  }, [])

  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
}
