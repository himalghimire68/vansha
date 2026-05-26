'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Edit3, Share2 } from 'lucide-react'
import { Button } from '@/app/ui'
import { api, ApiPerson } from '@/lib/api'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '👤' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  { id: 'ancestors', label: 'Ancestors', icon: '🌳' },
  { id: 'documents', label: 'Documents', icon: '📄' },
]

interface PersonProfileLayoutProps {
  children: React.ReactNode
}

export default function PersonProfileLayout({ children }: PersonProfileLayoutProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const personId = params?.personId as string
  const familyId = searchParams?.get('familyId') || ''
  const [activeTab, setActiveTab] = useState('overview')
  const [person, setPerson] = useState<ApiPerson | null>(null)

  useEffect(() => {
    if (!personId || !familyId) return
    api.getPerson(familyId, personId).then(setPerson).catch(() => {})
  }, [personId, familyId])

  const displayName = person
    ? `${person.firstName}${person.middleName ? ` ${person.middleName}` : ''} ${person.lastName}`
    : 'Loading...'
  const initials = person
    ? `${person.firstName[0]}${person.lastName[0]}`
    : '?'
  const birthYear = person?.birthDate ? new Date(person.birthDate).getFullYear() : null
  const deathYear = person?.deathDate ? new Date(person.deathDate).getFullYear() : null
  const location = person
    ? [person.ancestralVillage, person.ancestralDistrict, person.ancestralProvince].filter(Boolean).join(', ')
    : ''

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Back Button */}
      <div className="sticky top-0 z-30 bg-white border-b border-primary-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-700 font-medium">
            <ArrowLeft size={20} />
            Back
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-forest-50 to-primary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-forest-300 to-forest-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary-950 break-words">
                  {displayName}
                </h1>
                {person?.nepaliName && (
                  <p className="text-primary-600 mt-1">{person.nepaliName}</p>
                )}
                {(birthYear || deathYear) && (
                  <p className="text-primary-500 text-sm mt-1">
                    {birthYear ?? '?'}{deathYear ? ` – ${deathYear}` : ''}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {person?.isLiving && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    ✓ Living
                  </div>
                )}
                {person?.gender && (
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium border border-primary-200 capitalize">
                    {person.gender}
                  </div>
                )}
              </div>

              {location && (
                <div className="flex items-center gap-2 mt-4 text-sm text-primary-600">
                  <MapPin size={16} />
                  <span>{location}</span>
                </div>
              )}
              {birthYear && !location && (
                <div className="flex items-center gap-2 mt-4 text-sm text-primary-600">
                  <Calendar size={16} />
                  <span>Born {birthYear}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/person-edit/${personId}?familyId=${familyId}`}>
                <Button variant="outline" size="md" className="flex items-center gap-2">
                  <Edit3 size={18} />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={`/person-profile/${personId}?familyId=${familyId}&tab=${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-forest-600 text-forest-600'
                    : 'border-transparent text-primary-600 hover:text-primary-900'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </div>
    </div>
  )
}
