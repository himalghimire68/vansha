'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { GOTRA_LIST, GotraEntry } from '@/lib/gotraData'

const GotraListContext = createContext<GotraEntry[]>(GOTRA_LIST)
export const useGotraList = () => useContext(GotraListContext)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function GotraDataProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<GotraEntry[]>(GOTRA_LIST)

  useEffect(() => {
    fetch(`${API_URL}/gotras`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setList(data)
      })
      .catch(() => {})
  }, [])

  return <GotraListContext.Provider value={list}>{children}</GotraListContext.Provider>
}
