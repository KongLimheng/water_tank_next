'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/contexts/SettingsContext'
import { AboutUsData } from '@/types'
import HeroSection from './_components/SectionOne'
import FeaturesSection from './_components/SectionTwo'
import CertificatesSection from './_components/Sectionthree'

export default function AboutUsPage() {
  const { settings, isLoading } = useSettings()

  const aboutUs = settings?.aboutUs as AboutUsData

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-16">
        <div className="space-y-8 py-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!aboutUs) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">About Us</h2>
          <p className="text-slate-600">No content available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white px-8 lg:px-16 py-4">
      {/* 1. Banner & Intro */}
      <HeroSection data={aboutUs.section1} />

      {/* 2. Products (Zig-Zag Layout) */}
      <FeaturesSection data={aboutUs.section2} />

      {/* 3. Certificates Grid */}
      <CertificatesSection data={aboutUs.section3} />
    </main>
  )
}
