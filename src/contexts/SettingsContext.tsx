'use client'

import { getSettings } from '@/services/settingsService'
import { SiteSettings } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { createContext, ReactNode, useContext } from 'react'

interface SettingsContextType {
  settings: SiteSettings | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const value: SettingsContextType = {
    settings: settings ?? null,
    isLoading,
    error:
      error instanceof Error ? error : new Error('Failed to fetch settings'),
    refetch,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
