'use client'

import { createContext, useContext } from 'react'

export interface AdminCtx {
  adminKey: string
  onUnauthorized: () => void
}

export const AdminContext = createContext<AdminCtx>({ adminKey: '', onUnauthorized: () => {} })
export const useAdmin = () => useContext(AdminContext)
