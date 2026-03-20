'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { toast } from 'react-toastify'

const DEALER_AUTH_KEY = 'dealer_authenticated'

interface DealerContextType {
  isAuthenticated: boolean
  isLoading: boolean
  verifyPassword: (password: string) => Promise<boolean>
  logout: () => void
}

const DealerContext = createContext<DealerContextType | undefined>(undefined)

export const DealerProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check sessionStorage on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = sessionStorage.getItem(DEALER_AUTH_KEY)
        setIsAuthenticated(auth === 'true')
      } catch (error) {
        console.error('Error reading dealer auth from sessionStorage:', error)
        setIsAuthenticated(false)
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [])

  const verifyPassword = useCallback(
    async (password: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/settings/verify-dealer-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        })

        const data = await response.json()

        if (response.ok && data.valid) {
          setIsAuthenticated(true)
          sessionStorage.setItem(DEALER_AUTH_KEY, 'true')
          toast.success('Dealer authentication successful!')
          return true
        } else {
          toast.error(data.message || 'Invalid password')
          return false
        }
      } catch (error) {
        console.error('Dealer password verification failed:', error)
        toast.error('Verification failed. Please try again.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(DEALER_AUTH_KEY)
    toast.info('Dealer logged out')
  }, [])

  // Don't render children until we've checked sessionStorage
  if (!isInitialized) {
    return null
  }

  return (
    <DealerContext.Provider
      value={{ isAuthenticated, isLoading, verifyPassword, logout }}
    >
      {children}
    </DealerContext.Provider>
  )
}

export const useDealer = () => {
  const context = useContext(DealerContext)
  if (context === undefined) {
    throw new Error('useDealer must be used within a DealerProvider')
  }
  return context
}
