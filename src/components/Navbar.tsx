'use client'

import { MenuIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Logo from '../../public/logo.jpg' // Check path
import SearchBox from './SearchBox'

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home', exact: true },
    { href: '/products', label: 'Product', exact: false },
    { href: '/about', label: 'About Us', exact: true },
    { href: '/videos', label: 'Video Guide', exact: true },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 886) {
        setMobileMenuOpen(false) // Mobile: Auto close
      } else {
        setMobileMenuOpen(true) // Desktop: Auto open
      }
    }

    // Set initial state on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActiveExact = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-2">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center  justify-center shadow-primary-200 shadow-lg overflow-hidden">
              <Image
                src={Logo.src}
                className="rounded-full shadow-2xl"
                alt="Logo"
                loading="lazy"
                width={40}
                height={40}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs lg:text-lg font-bold text-slate-900 tracking-tight truncate">
                Fa De Manufacture Co., LTD.
              </h1>
              <p className="text-[8px] lg:text-[10px] text-slate-500 font-medium">
                ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0 lg:gap-6">
            {/* Home Link */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all hover:bg-primary-50 hover:text-primary-600 ${
                  isActiveExact(link.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Desktop Search Box */}
            <div className="hidden md:block w-48 lg:w-56">
              <SearchBox />
            </div>
          </div>

          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search Box */}
            <div className="pb-3 border-b border-slate-100 mb-3">
              <SearchBox setMobileMenu={setMobileMenuOpen} />
            </div>

            <Link
              href="/"
              className={`block text-sm font-medium transition-colors hover:text-primary-600 ${
                isActiveExact('/') ? 'text-primary-600 ' : 'text-slate-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/products"
              className={`block text-sm font-medium transition-colors hover:text-primary-600 ${
                isActiveExact('/products')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>

            <Link
              href="/about"
              className={`block text-sm font-medium transition-colors hover:text-primary-600 ${
                pathname === '/about' ? 'text-primary-600 ' : 'text-slate-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <div className="border-t border-slate-100 my-2"></div>
            <Link
              href="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-sm text-left py-2 rounded-lg flex items-center gap-2 ${
                isActiveExact('/videos')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
            >
              Video Guides
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
