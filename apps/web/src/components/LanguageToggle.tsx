'use client'

import { useLanguage } from '@/providers/LanguageProvider'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
      title={lang === 'en' ? 'Switch to Nepali' : 'Switch to English'}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-full text-label-md font-sans text-on-surface-variant hover:text-primary hover:border-secondary transition-all duration-200 select-none"
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇳🇵' : '🇬🇧'}</span>
      <span className="font-semibold tracking-wide hidden sm:inline">
        {lang === 'en' ? 'नेपाली' : 'English'}
      </span>
    </button>
  )
}
