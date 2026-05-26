'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { MapPin, Calendar, Users, Heart, Briefcase } from 'lucide-react'
import { Card, Button, Badge } from '@/app/ui'
import { api, ApiPerson } from '@/lib/api'

export default function PersonOverviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const personId = params?.personId as string
  const familyId = searchParams?.get('familyId') || ''
  const [person, setPerson] = useState<ApiPerson | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!personId || !familyId) { setIsLoading(false); return }
    api.getPerson(familyId, personId)
      .then(setPerson)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [personId, familyId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-primary-600">
        Loading person details...
      </div>
    )
  }

  if (!person) {
    return (
      <Card className="text-center py-12">
        <Heart className="mx-auto mb-4 text-primary-300" size={48} />
        <h3 className="font-semibold text-primary-950 mb-2">Person not found</h3>
        <p className="text-primary-600 mb-6">
          {!familyId ? 'Missing family context in URL.' : 'Could not load this person.'}
        </p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </Card>
    )
  }

  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null
  const location = [person.ancestralVillage, person.ancestralDistrict, person.ancestralProvince]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-8">
      {/* About Section */}
      {person.biography && (
        <section>
          <h2 className="text-2xl font-bold text-primary-950 mb-4">About</h2>
          <Card>
            <p className="text-primary-700 leading-relaxed">{person.biography}</p>
          </Card>
        </section>
      )}

      {/* Key Information */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-primary-950 mb-6 flex items-center gap-2">
            <Calendar className="text-forest-600" size={20} />
            Important Dates
          </h3>
          <div className="space-y-4">
            {birthYear && (
              <div>
                <p className="text-sm text-primary-600 mb-1">Year of Birth</p>
                <p className="font-semibold text-primary-950">{birthYear}</p>
              </div>
            )}
            {deathYear && (
              <div className="border-t border-primary-100 pt-4">
                <p className="text-sm text-primary-600 mb-1">Year of Death</p>
                <p className="font-semibold text-primary-950">{deathYear}</p>
              </div>
            )}
            {!birthYear && !deathYear && (
              <p className="text-primary-600 text-sm">No date information recorded</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-primary-950 mb-6 flex items-center gap-2">
            <Briefcase className="text-forest-600" size={20} />
            Heritage Details
          </h3>
          <div className="space-y-3">
            {person.gotra && (
              <div>
                <p className="text-sm text-primary-600">Gotra</p>
                <p className="font-semibold text-primary-950">{person.gotra}</p>
              </div>
            )}
            {person.caste && (
              <div>
                <p className="text-sm text-primary-600">Caste</p>
                <p className="font-semibold text-primary-950">{person.caste}</p>
              </div>
            )}
            {!person.gotra && !person.caste && (
              <p className="text-primary-600 text-sm">No heritage details recorded</p>
            )}
          </div>
        </Card>
      </section>

      {/* Ancestral Location */}
      {location && (
        <Card>
          <h3 className="font-semibold text-primary-950 mb-4 flex items-center gap-2">
            <MapPin className="text-forest-600" size={20} />
            Ancestral Location
          </h3>
          <p className="text-primary-700">{location}</p>
        </Card>
      )}

      {/* No info fallback */}
      {!person.biography && !birthYear && !location && !person.gotra && (
        <Card className="text-center py-12">
          <Heart className="mx-auto mb-4 text-primary-300" size={48} />
          <h3 className="font-semibold text-primary-950 mb-2">Limited information available</h3>
          <p className="text-primary-600 mb-6">No additional details have been recorded for this person yet.</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
