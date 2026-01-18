import ShopProducts from '@/pages/ShopProducts'
import { Suspense } from 'react'

export default function ShopProductPage() {
  return (
    <Suspense fallback={<div />}>
      <ShopProducts />
    </Suspense>
  )
}
