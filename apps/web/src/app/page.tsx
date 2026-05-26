'use client'

import Link from 'next/link'

const FEATURES = [
  {
    icon: '🌳',
    title: 'Build Your Lineage',
    desc: 'Construct comprehensive family trees tracing both maternal and paternal ancestry across generations.',
  },
  {
    icon: '🔍',
    title: 'Discover Connections',
    desc: 'Uncover distant relatives and shared ancestry through intelligent relationship mapping.',
  },
  {
    icon: '🔒',
    title: 'Private by Default',
    desc: 'Your family\'s history belongs to your family. Control every permission with archival precision.',
  },
  {
    icon: '📜',
    title: 'Preserve Heritage',
    desc: 'Store photographs, documents, stories, and oral histories for generations yet unborn.',
  },
  {
    icon: '🌏',
    title: 'Global Reach',
    desc: 'Connect families across continents. Heritage knows no borders.',
  },
  {
    icon: '✦',
    title: 'Gotra & Lineage',
    desc: 'Track gotra systems, caste lineages, and cultural heritage unique to South Asian traditions.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-header bg-surface/90 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <span className="font-serif text-xl text-primary tracking-tight">Vansha Lineage</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-label-md font-sans text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#heritage" className="hover:text-primary transition-colors">Our Philosophy</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-label-md font-sans text-secondary hover:text-primary transition-colors hidden md:block"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-primary text-on-primary text-label-md font-sans px-5 py-2.5 rounded-brand hover:opacity-90 transition-opacity"
            >
              Enter the Archive
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 px-6 md:px-16">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary-container/40 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tertiary-fixed/30 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-8 px-5 py-2 bg-secondary-container/60 rounded-full border border-secondary-fixed">
            <span className="text-label-md font-sans text-on-secondary-container tracking-wider uppercase">
              The Living Archive
            </span>
          </div>

          <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-primary mb-6 leading-tight">
            Every Family Has<br />
            <em className="text-secondary not-italic">A Story Worth Telling</em>
          </h1>

          <p className="text-body-lg font-sans text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
            Vansha Lineage is a private-by-default ancestral intelligence platform. Preserve your
            family's heritage, trace your lineage across generations, and discover the living threads
            that connect you to your ancestors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 bg-primary text-on-primary text-label-md font-sans px-8 py-4 rounded-brand hover:opacity-90 transition-all active:scale-[0.98] archival-shadow-lg"
            >
              <span>🗝</span>
              Enter the Archive
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-outline text-on-surface-variant text-label-md font-sans px-8 py-4 rounded-brand hover:border-secondary hover:text-secondary transition-all"
            >
              Discover More
            </a>
          </div>

          {/* Hero visual — parchment card */}
          <div className="mt-20 max-w-3xl mx-auto bg-surface-container-low border border-outline-variant rounded-2xl p-10 archival-shadow-lg">
            <div className="flex items-center justify-center gap-8 opacity-60">
              {['1820', '1865', '1902', '1947', '1983', '2024'].map((year, i) => (
                <div key={year} className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${i === 5 ? 'bg-secondary' : 'bg-outline-variant'}`} />
                  <span className="font-serif text-caption text-on-surface-variant hidden sm:block">{year}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="font-serif text-headline-md text-primary">The Ghimire Lineage</p>
              <p className="text-caption font-sans text-on-surface-variant mt-1">Six generations · Gorkha, Nepal · Est. 1820</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-16 bg-surface-container-low/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-headline-lg text-primary mb-4">
              Built for Those Who Value Legacy
            </h2>
            <p className="text-body-lg font-sans text-on-surface-variant max-w-2xl mx-auto">
              A curated set of tools designed with the gravitas that ancestral history deserves.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant archival-shadow hover:border-secondary transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-headline-md text-primary mb-2">{f.title}</h3>
                <p className="text-caption font-sans text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="heritage" className="py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary-container rounded-3xl p-12 md:p-16 text-center">
            <p className="font-serif text-display-lg-mobile text-on-primary-container leading-snug mb-6">
              "A people without the knowledge of their past history, origin and culture is like a tree without roots."
            </p>
            <p className="font-sans text-label-md text-on-primary-container/60 tracking-wider uppercase">
              — Marcus Garvey
            </p>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 px-6 md:px-16 bg-surface-container-low/50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-headline-lg text-primary mb-4">
              Privacy as an Heirloom
            </h2>
            <p className="text-body-md font-sans text-on-surface-variant mb-6 leading-relaxed">
              Living individuals are protected by default. Every permission is explicit.
              Your family's most intimate stories remain within your family's walls.
            </p>
            <ul className="space-y-3">
              {[
                'Family trees are private by default',
                'Living members require explicit consent',
                'Granular permission controls per family',
                'End-to-end encrypted sensitive records',
                'No advertisements, no data selling',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-body-md font-sans text-on-surface-variant">
                  <span className="w-5 h-5 bg-secondary-container rounded-full flex items-center justify-center text-xs text-on-secondary-container flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 archival-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-serif text-headline-md text-primary mb-2">Archival Integrity</h3>
            <p className="text-body-md font-sans text-on-surface-variant">
              We treat your family history with the same reverence a museum curator applies to irreplaceable artefacts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-24 px-6 md:px-16 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-headline-lg text-on-primary mb-4">
            Begin Your Family's Archive Today
          </h2>
          <p className="text-body-lg font-sans text-on-primary-container mb-10">
            Join families across the world who are preserving their heritage for generations yet to come.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-surface text-primary text-label-md font-sans px-8 py-4 rounded-brand hover:bg-primary-fixed transition-all archival-shadow-lg font-semibold"
            >
              🗝 Enter the Archive
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-on-primary-container text-on-primary-container text-label-md font-sans px-8 py-4 rounded-brand hover:bg-primary-container/50 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-container-low/50 py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-serif text-lg text-primary">Vansha Lineage</span>
          </div>
          <p className="text-caption font-sans text-on-surface-variant text-center">
            © 2024 Vansha Lineage. Preserving history for the next generation.
          </p>
          <div className="flex gap-6 text-caption font-sans text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
