import { auth } from '@/lib/auth'
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
})

export const isAdmin = cache(async () => {
  const user = await getCurrentUser()
  return user?.role?.toLowerCase() === 'admin'
})
