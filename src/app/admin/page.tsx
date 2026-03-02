'use client'
import { Loader2 } from 'lucide-react'
import AdminDashboard from '@/components/AdminDashboard'
import { getCurrentUser } from '@/services/authService'
import { getProducts } from '@/services/productService'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Protect route
  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.replace('/login')
    } else {
      setIsVerified(true)
    }
    setIsLoading(false)
  }, [router])

  const { data: products = [] } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: getProducts,
    enabled: isVerified,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin w-8 h-8" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  return <AdminDashboard products={products} />
}
