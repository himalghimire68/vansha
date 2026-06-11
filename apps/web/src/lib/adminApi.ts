const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function adminFetch<T>(path: string, key: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key,
        ...options?.headers,
      },
    })
  } catch (networkErr: any) {
    throw new Error(`Cannot reach API at ${API_URL} — is the server running? (${networkErr.message})`)
  }
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let detail = text
    try { detail = JSON.parse(text)?.message || text } catch {}
    throw new Error(`Server error ${res.status}: ${detail}`)
  }
  return res.json()
}

export interface AdminStats {
  totalFamilies: number
  totalPeople: number
  totalApprovals: number
  pendingApprovals: number
  totalUsers: number
  activeUsers: number
  recentFamilies: AdminFamily[]
  recentPeople: AdminPerson[]
}

export interface AdminFamily {
  id: string
  name: string
  founderId: string
  ancestralVillage?: string
  ancestralDistrict?: string
  ancestralProvince?: string
  isActive: boolean
  peopleCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminPerson {
  id: string
  familyId: string
  familyName: string
  firstName: string
  middleName?: string
  lastName: string
  gender: string
  isLiving: boolean
  gotra?: string
  caste?: string
  birthDate?: string
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export const adminApi = {
  stats: (key: string) =>
    adminFetch<AdminStats>('/admin/stats', key),

  getFamilies: (key: string, params: { page?: number; search?: string } = {}) =>
    adminFetch<Paginated<AdminFamily>>(
      `/admin/families?page=${params.page || 1}&search=${encodeURIComponent(params.search || '')}`,
      key,
    ),

  patchFamily: (key: string, id: string, data: { isActive?: boolean; name?: string }) =>
    adminFetch<AdminFamily>(`/admin/families/${id}`, key, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteFamily: (key: string, id: string) =>
    adminFetch<{ success: boolean }>(`/admin/families/${id}`, key, { method: 'DELETE' }),

  getPeople: (key: string, params: { page?: number; familyId?: string; search?: string } = {}) =>
    adminFetch<Paginated<AdminPerson>>(
      `/admin/people?page=${params.page || 1}&familyId=${params.familyId || ''}&search=${encodeURIComponent(params.search || '')}`,
      key,
    ),

  deletePerson: (key: string, id: string) =>
    adminFetch<{ success: boolean }>(`/admin/people/${id}`, key, { method: 'DELETE' }),

  // ── Gotras ─────────────────────────────────────────────────────────────────
  getGotras: (key: string, params: { page?: number; search?: string; limit?: number } = {}) =>
    adminFetch<Paginated<AdminGotra>>(
      `/admin/gotras?page=${params.page || 1}&limit=${params.limit || 50}&search=${encodeURIComponent(params.search || '')}`,
      key,
    ),

  createGotra: (key: string, data: { gotra: string; nepali: string; surnames: string[]; sortOrder?: number }) =>
    adminFetch<AdminGotra>('/admin/gotras', key, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGotra: (key: string, id: string, data: Partial<{ gotra: string; nepali: string; surnames: string[]; sortOrder: number }>) =>
    adminFetch<AdminGotra>(`/admin/gotras/${id}`, key, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGotra: (key: string, id: string) =>
    adminFetch<{ success: boolean }>(`/admin/gotras/${id}`, key, { method: 'DELETE' }),

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers: (key: string, params: { page?: number; search?: string; status?: string; role?: string } = {}) =>
    adminFetch<Paginated<AdminUser>>(
      `/admin/users?page=${params.page || 1}&search=${encodeURIComponent(params.search || '')}&status=${params.status || ''}&role=${params.role || ''}`,
      key,
    ),

  createUser: (key: string, data: { email: string; firstName?: string; lastName?: string; role?: string; status?: string; phone?: string }) =>
    adminFetch<AdminUser>('/admin/users', key, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (key: string, id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: string; status: string; phone: string }>) =>
    adminFetch<AdminUser>(`/admin/users/${id}`, key, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  resetUserSettings: (key: string, id: string) =>
    adminFetch<AdminUser>(`/admin/users/${id}/reset`, key, { method: 'POST' }),

  deleteUser: (key: string, id: string) =>
    adminFetch<{ success: boolean }>(`/admin/users/${id}`, key, { method: 'DELETE' }),

  // ── Site Config ────────────────────────────────────────────────────────────
  getConfig: (key: string) =>
    adminFetch<Record<string, string>>('/admin/config', key),

  updateConfig: (key: string, data: Record<string, string>) =>
    adminFetch<Record<string, string>>('/admin/config', key, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

export interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  status: string
  phone?: string
  lastLoginAt?: string
  preferences?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface AdminGotra {
  id: string
  gotra: string
  nepali: string
  surnames: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}
