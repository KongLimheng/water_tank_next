'use client'

import { Hero } from '@/components/Hero'
import { useSettings } from '@/contexts/SettingsContext'

export default function HomePage() {
  const { settings, isLoading } = useSettings()

  return (
    <>
      <Hero />
    </>
  )
}
