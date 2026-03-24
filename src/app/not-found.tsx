'use client'

import { ArrowLeft, HelpCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <div className="w-40 h-40 md:w-56 md:h-56 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-2xl">
            <HelpCircle className="w-20 h-20 md:w-28 md:h-28 text-primary-600" />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 md:w-64 md:h-64 bg-primary-200/30 rounded-full -z-10 animate-pulse" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-4 tracking-tight">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
          Page Not Found
        </h2>

        <p className="text-slate-600 text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            <Home size={20} />
            Back to Home
          </Link>

          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4 font-medium">
            Popular Pages
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              href="/videos"
              className="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              Video Guides
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
