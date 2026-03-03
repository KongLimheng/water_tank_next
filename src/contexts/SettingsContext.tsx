'use client'

import { getSettings } from '@/services/settingsService'
import { SiteSettings } from '@/types'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface SettingsContextType {
  settings: SiteSettings | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch settings'),
      )
      console.error('Failed to fetch settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
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
