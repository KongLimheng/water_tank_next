'use client'

import SearchResults from '@/pages/SearchResults'
import { Suspense } from 'react'

export default function SearchPage() {
  return (
    <Suspense fallback={<div></div>}>
      <SearchResults />
    </Suspense>
  )
}
