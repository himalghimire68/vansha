const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DEV_USER_ID = 'dev_user_123'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEV_USER_ID,
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

export interface ApiFamily {
  id: string
  name: string
  description?: string
  founderId: string
  ancestralVillage?: string
  ancestralDistrict?: string
  ancestralProvince?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiPerson {
  id: string
  familyId: string
  firstName: string
  middleName?: string
  lastName: string
  nepaliName?: string
  gender: string
  birthDate?: string
  deathDate?: string
  isLiving: boolean
  biography?: string
  gotra?: string
  caste?: string
  ancestralVillage?: string
  ancestralDistrict?: string
  ancestralProvince?: string
  fatherId?: string
  motherId?: string
  photoUrl?: string
  occupation?: string
  createdAt: string
  updatedAt: string
}

export interface ApiSearchResult {
  id: string
  firstName: string
  lastName: string
  nepaliName?: string
  gotra?: string
  ancestralVillage?: string
  familyId: string
  type: string
}

export interface ApiRelationship {
  type: string
  distance?: number
  description?: string
  sharedAncestors?: number
}

export const api = {
  getFamilies: () => apiFetch<ApiFamily[]>('/families'),
  getFamily: (id: string) => apiFetch<ApiFamily>(`/families/${id}`),
  createFamily: (data: { name: string; description?: string; ancestralVillage?: string; ancestralDistrict?: string; ancestralProvince?: string }) =>
    apiFetch<ApiFamily>('/families', { method: 'POST', body: JSON.stringify(data) }),

  getPeople: (familyId: string) =>
    apiFetch<ApiPerson[]>(`/families/${familyId}/people`),
  getPerson: (familyId: string, personId: string) =>
    apiFetch<ApiPerson>(`/families/${familyId}/people/${personId}`),
  createPerson: (familyId: string, data: Record<string, unknown>) =>
    apiFetch<ApiPerson>(`/families/${familyId}/people`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  findRelationship: (familyId: string, personId1: string, personId2: string) =>
    apiFetch<ApiRelationship>(
      `/families/${familyId}/people/${personId1}/relationship/${personId2}`,
      { method: 'POST' },
    ),

  searchPeople: (familyId: string, query: string) =>
    apiFetch<ApiSearchResult[]>(
      `/search/families/${familyId}/people?q=${encodeURIComponent(query)}`,
    ),

  getNotifications: () => apiFetch<unknown[]>('/notifications/user'),
}
