import AdminDashboard from '@/components/AdminDashboard'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role.toLowerCase() !== 'admin') {
    redirect('/login')
  }

  return <AdminDashboard user={user} />
}
