'use client';
import AdminDashboard from '@/components/AdminDashboard';
import { getCurrentUser } from '@/services/authService';
import { getProducts } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  
  // Protect route
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.replace('/login');
    }
  }, [router]);

  const { data: products = [] } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: getProducts,
  });

  return (
      <AdminDashboard products={products} />
  );
}
