'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { api, ApiFamily } from '@/lib/api'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const [families, setFamilies] = useState<ApiFamily[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getFamilies()
      .then(setFamilies)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Hero */}
      <section className="relative rounded-3xl overflow-hidden archival-shadow-lg">
        <div className="absolute inset-0 bg-primary-container/95 z-10" />
        <div className="relative z-20 p-8 md:p-14 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-headline-lg text-on-primary-container mb-3">
              Welcome back, Curator
            </h2>
            <p className="font-sans text-body-lg text-on-primary-container/80 leading-relaxed">
              {isLoading
                ? 'Loading your ancestral records...'
                : families.length === 0
                ? 'Your archive awaits. Begin by creating your first family tree.'
                : `You are preserving ${families.length} family line${families.length !== 1 ? 's' : ''}. Your heritage grows with every entry.`}
            </p>
          </div>
          <Link
            href="/new-tree"
            className="bg-surface text-primary py-4 px-8 rounded-brand font-sans font-semibold flex items-center gap-3 hover:bg-primary-fixed transition-all archival-shadow-xl whitespace-nowrap text-label-md"
          >
            🌳 New Family Tree
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="font-serif text-headline-md text-primary mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              href: '/new-tree',
              icon: '📂',
              bg: 'bg-secondary-container',
              text: 'text-on-secondary-container',
              title: 'Create Family Tree',
              desc: 'Start a new branch of your ancestral history from scratch.',
            },
            {
              href: '/explore-relationships',
              icon: '🔍',
              bg: 'bg-tertiary-fixed',
              text: 'text-on-tertiary-fixed',
              title: 'Explore Relationships',
              desc: 'Discover potential links between different lineages.',
            },
            {
              href: '#',
              icon: '👥',
              bg: 'bg-primary-fixed',
              text: 'text-on-primary-fixed',
              title: 'Invite Family Members',
              desc: 'Collaborate with living relatives to fill in missing pieces.',
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant archival-shadow hover:border-secondary transition-all"
            >
              <div className={`w-12 h-12 ${action.bg} ${action.text} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-xl`}>
                {action.icon}
              </div>
              <h4 className="font-sans text-label-md text-primary mb-2">{action.title}</h4>
              <p className="font-sans text-caption text-on-surface-variant">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Split: Trees + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Trees */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-headline-md text-primary">Your Family Trees</h3>
            {families.length > 0 && (
              <span className="text-label-md font-sans text-secondary hover:underline cursor-pointer">
                View All
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : families.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center archival-shadow">
              <span className="text-5xl block mb-4">🌿</span>
              <h4 className="font-serif text-headline-md text-primary mb-2">No archives yet</h4>
              <p className="font-sans text-body-md text-on-surface-variant mb-6">
                Every great lineage begins with a single entry.
              </p>
              <Link
                href="/new-tree"
                className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity"
              >
                + Create Your First Tree
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {families.map((family) => (
                <Link key={family.id} href={`/trees/${family.id}`}>
                  <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden archival-shadow group hover:border-secondary transition-all hover:-translate-y-0.5">
                    <div className="h-28 bg-surface-container-low flex items-center justify-center relative">
                      <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">🌳</span>
                      <div className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-caption font-sans font-semibold">
                        Active
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-serif text-headline-md text-primary mb-2 group-hover:text-secondary transition-colors">
                        {family.name}
                      </h4>
                      {family.description && (
                        <p className="font-sans text-caption text-on-surface-variant mb-2 line-clamp-1">
                          {family.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-on-surface-variant font-sans text-caption">
                        {family.ancestralVillage && (
                          <span className="flex items-center gap-1">
                            📍 {family.ancestralVillage}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          🕐 {timeAgo(family.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Add Tree CTA Card */}
              <Link href="/new-tree">
                <div className="bg-surface border border-dashed border-outline rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center h-full min-h-[160px] hover:border-secondary hover:bg-surface-container-low transition-all group">
                  <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-all text-xl">
                    +
                  </span>
                  <p className="font-sans text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
                    Add Another Tree
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <aside className="space-y-6">
          <h3 className="font-serif text-headline-md text-primary">Recent Activity</h3>
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant archival-shadow space-y-5">
            {[
              { icon: '📖', bg: 'bg-secondary-container', text: 'text-on-secondary-container', msg: 'Your archive was last accessed today', time: 'Just now' },
              { icon: '✅', bg: 'bg-tertiary-fixed',      text: 'text-on-tertiary-fixed',      msg: 'Backend connected successfully',   time: 'Setup' },
              { icon: '🌿', bg: 'bg-primary-fixed',       text: 'text-on-primary-fixed',       msg: 'Vansha Lineage archive initialized', time: 'Recently' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 w-8 h-8 rounded-full ${item.bg} ${item.text} flex items-center justify-center shrink-0 text-sm`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-sans text-body-md text-primary leading-snug">{item.msg}</p>
                  <span className="font-sans text-caption text-on-surface-variant">{item.time}</span>
                </div>
              </div>
            ))}
            <button className="w-full text-center py-2 text-on-surface-variant hover:text-primary transition-colors font-sans text-label-md">
              View All Activity
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
