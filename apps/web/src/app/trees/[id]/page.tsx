'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard-layout'
import { api, ApiFamily, ApiPerson } from '@/lib/api'

export default function TreePage() {
  const params = useParams()
  const treeId = params?.id as string
  const [family, setFamily] = useState<ApiFamily | null>(null)
  const [people, setPeople] = useState<ApiPerson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!treeId) return
    Promise.all([api.getFamily(treeId), api.getPeople(treeId)])
      .then(([f, p]) => { setFamily(f); setPeople(p) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [treeId])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-caption font-sans text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-primary">{family?.name || 'Family Tree'}</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />)}
            </div>
          </div>
        ) : !family ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📜</span>
            <h2 className="font-serif text-headline-md text-primary mb-2">Archive Not Found</h2>
            <p className="font-sans text-body-md text-on-surface-variant mb-6">This family tree could not be located.</p>
            <Link href="/dashboard" className="bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity inline-block">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Family Header */}
            <div className="bg-primary-container rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="font-serif text-headline-lg text-on-primary-container mb-1">{family.name}</h1>
                {family.description && (
                  <p className="font-sans text-body-md text-on-primary-container/70 mb-3">{family.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-caption font-sans">
                  {family.ancestralVillage && (
                    <span className="px-3 py-1 bg-primary-container/50 text-on-primary-container/80 border border-on-primary-container/20 rounded-full">
                      📍 {family.ancestralVillage}{family.ancestralDistrict ? `, ${family.ancestralDistrict}` : ''}{family.ancestralProvince ? `, ${family.ancestralProvince}` : ''}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                    👥 {people.length} member{people.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Link
                href={`/trees/${treeId}/add-person`}
                className="bg-surface text-primary text-label-md font-sans px-6 py-3 rounded-brand hover:bg-primary-fixed transition-all archival-shadow flex items-center gap-2 whitespace-nowrap"
              >
                + Add Ancestor
              </Link>
            </div>

            {/* Members */}
            <div>
              <h2 className="font-serif text-headline-md text-primary mb-6">
                Family Members
              </h2>

              {people.length === 0 ? (
                <div className="bg-surface-container-lowest border border-dashed border-outline rounded-2xl p-12 text-center">
                  <span className="text-4xl block mb-4">🌿</span>
                  <h3 className="font-serif text-headline-md text-primary mb-2">No ancestors recorded yet</h3>
                  <p className="font-sans text-body-md text-on-surface-variant mb-6">
                    Begin adding members to build your family tree.
                  </p>
                  <Link
                    href={`/trees/${treeId}/add-person`}
                    className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-sans px-6 py-3 rounded-brand hover:opacity-90 transition-opacity"
                  >
                    + Add First Ancestor
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {people.map((person) => (
                    <Link
                      key={person.id}
                      href={`/person-profile/${person.id}?familyId=${person.familyId}`}
                    >
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 archival-shadow hover:border-secondary hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center font-serif text-lg text-on-primary-container flex-shrink-0">
                            {person.firstName[0]}{person.lastName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif text-body-lg text-primary group-hover:text-secondary transition-colors truncate">
                              {person.firstName} {person.lastName}
                            </h3>
                            {person.nepaliName && (
                              <p className="font-sans text-caption text-on-surface-variant truncate">{person.nepaliName}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`w-2 h-2 rounded-full ${person.isLiving ? 'bg-secondary' : 'bg-outline'}`} />
                              <span className="font-sans text-caption text-on-surface-variant">
                                {person.isLiving ? 'Living' : 'Ancestor'}
                                {person.gotra ? ` · ${person.gotra}` : ''}
                              </span>
                            </div>
                            {(person.birthDate) && (
                              <p className="font-sans text-caption text-on-surface-variant mt-1">
                                b. {new Date(person.birthDate).getFullYear()}
                                {person.deathDate ? ` – ${new Date(person.deathDate).getFullYear()}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Add member card */}
                  <Link href={`/trees/${treeId}/add-person`}>
                    <div className="bg-surface border border-dashed border-outline rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[100px] hover:border-secondary hover:bg-surface-container-low transition-all group">
                      <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-all text-xl">+</span>
                      <p className="font-sans text-label-md text-on-surface-variant group-hover:text-primary transition-colors">Add Ancestor</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
