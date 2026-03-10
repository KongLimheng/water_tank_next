import { signIn, signOut } from 'next-auth/react'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export const login = async (email: string, password: string) => {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (result?.error) {
    throw new Error(result.error)
  }

  return result
}

export const logout = async (callbackUrl?: string) => {
  await signOut({ redirect: true, callbackUrl: callbackUrl || '/login' })
}

export const isAuthenticated = async () => {
  const response = await fetch('/api/auth/session')
  const session = await response.json()
  return !!session?.user
}
