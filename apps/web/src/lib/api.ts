const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ── Auth helpers ─────────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('vansha_token')
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('vansha_user_id')
}

export function storeAuth(userId: string, token: string) {
  localStorage.setItem('vansha_user_id', userId)
  localStorage.setItem('vansha_token', token)
}

export function clearAuth() {
  localStorage.removeItem('vansha_user_id')
  localStorage.removeItem('vansha_token')
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const userId = getStoredUserId()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Backward-compat header so controllers that still read x-user-id keep working
  if (userId) {
    headers['x-user-id'] = userId
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ userId: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    apiFetch<{ userId: string; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    }),
}

// ── Upload API ────────────────────────────────────────────────────────────────

export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const token = getStoredToken()
  const userId = getStoredUserId()
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (userId) headers['x-user-id'] = userId

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────

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
  birthOrder?: number
  createdAt: string
  updatedAt: string
  _crossFamily?: boolean
  _familyName?: string
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

export interface ApiCrossFamilyLink {
  id: string
  personId: string
  linkedParentId: string
  linkedFamilyId: string
  linkType: 'father' | 'mother'
  createdAt: string
}

export interface ApiFamilyMember {
  id: string
  familyId: string
  userId: string
  role: string
  isApproved: boolean
  createdAt: string
}

// ── Main API ──────────────────────────────────────────────────────────────────

export const api = {
  // Families
  getFamilies: () => apiFetch<ApiFamily[]>('/families'),
  getFamily: (id: string) => apiFetch<ApiFamily>(`/families/${id}`),
  createFamily: (data: {
    name: string
    description?: string
    ancestralVillage?: string
    ancestralDistrict?: string
    ancestralProvince?: string
  }) => apiFetch<ApiFamily>('/families', { method: 'POST', body: JSON.stringify(data) }),
  getFamilyMembers: (familyId: string) =>
    apiFetch<ApiFamilyMember[]>(`/families/${familyId}/members`),
  addFamilyMember: (familyId: string, userId: string, role?: string) =>
    apiFetch<ApiFamilyMember>(`/families/${familyId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),
  inviteMember: (familyId: string, email: string, role: string) =>
    apiFetch<{ invitationId: string }>(`/families/${familyId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  // People
  getPeople: (familyId: string) =>
    apiFetch<ApiPerson[]>(`/families/${familyId}/people`),
  getPerson: (familyId: string, personId: string) =>
    apiFetch<ApiPerson>(`/families/${familyId}/people/${personId}`),
  createPerson: (familyId: string, data: Record<string, unknown>) =>
    apiFetch<ApiPerson>(`/families/${familyId}/people`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePerson: (familyId: string, personId: string, data: Record<string, unknown>) =>
    apiFetch<ApiPerson>(`/families/${familyId}/people/${personId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  resolvePeople: (ids: string[]) =>
    apiFetch<ApiPerson[]>('/people/resolve', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  findRelationship: (familyId: string, personId1: string, personId2: string) =>
    apiFetch<ApiRelationship>(
      `/families/${familyId}/people/${personId1}/relationship/${personId2}`,
      { method: 'POST' },
    ),

  // Cross-family links
  getCrossFamilyLinks: (familyId: string, personId: string) =>
    apiFetch<ApiCrossFamilyLink[]>(`/families/${familyId}/people/${personId}/cross-family-links`),
  createCrossFamilyLink: (
    familyId: string,
    personId: string,
    data: { linkedParentId: string; linkedFamilyId: string; linkType: 'father' | 'mother' },
  ) =>
    apiFetch<ApiCrossFamilyLink>(`/families/${familyId}/people/${personId}/cross-family-links`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteCrossFamilyLink: (familyId: string, personId: string, linkId: string) =>
    apiFetch<{ ok: boolean }>(
      `/families/${familyId}/people/${personId}/cross-family-links/${linkId}`,
      { method: 'DELETE' },
    ),

  // Search
  searchPeople: (familyId: string, query: string) =>
    apiFetch<ApiSearchResult[]>(
      `/search/families/${familyId}/people?q=${encodeURIComponent(query)}`,
    ),

  // Notifications
  getNotifications: () => apiFetch<unknown[]>('/notifications/user'),
}
