'use client'

import { useDealer } from '@/contexts/DealerContext'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Lock, MenuIcon, UserCheck, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../public/logo.jpg' // Check path
import SearchBox from './SearchBox'

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dealerDropdownOpen, setDealerDropdownOpen] = useState(false)
  const [dealerPassword, setDealerPassword] = useState('')
  const pathname = usePathname()
  const { isAuthenticated, isLoading, verifyPassword, logout } = useDealer()
  const dealerDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDealerRef = useRef<HTMLDivElement>(null)

  // Show dealer dropdown only on /products or /shop routes
  const showDealerDropdown =
    pathname === '/products' || pathname?.startsWith('/shop')

  // Close dealer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dealerDropdownOpen) return

      const isOutsideDesktop = dealerDropdownRef.current
        ? !dealerDropdownRef.current.contains(event.target as Node)
        : true
      const isOutsideMobile = mobileDealerRef.current
        ? !mobileDealerRef.current.contains(event.target as Node)
        : true

      // Close if click is outside the currently visible dropdown
      if (isOutsideDesktop && isOutsideMobile) {
        setDealerDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dealerDropdownOpen])

  const handleDealerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dealerPassword.trim()) {
      const success = await verifyPassword(dealerPassword)
      if (success) {
        setDealerPassword('')
        setDealerDropdownOpen(false)
      }
    }
  }

  const navLinks = [
    { href: '/', label: 'Home', exact: true },
    { href: '/products', label: 'Product', exact: false },
    { href: '/about', label: 'About Us', exact: true },
    { href: '/videos', label: 'Video Guide', exact: true },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 886) {
        setMobileMenuOpen(false) // Close mobile menu on desktop
      }
      // Don't auto-close on mobile resize (keyboard open/close)
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
            <div className="size-8 lg:size-10 rounded-full flex items-center  justify-center shadow-primary-200 shadow-lg overflow-hidden">
              <Image
                src={Logo.src}
                className="rounded-full size-full"
                alt="Logo"
                loading="eager"
                width={40}
                height={40}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs lg:text-lg font-bold text-slate-900 tracking-tight truncate">
                Fa De Manufacture Co., LTD.
              </h1>
              <p className="text-[8px] lg:text-[10px] text-slate-500 font-medium khmer-text">
                ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអ៊ីណុក & ជ័រគ្រប់ប្រភេទ
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0 lg:gap-4">
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

            {/* Dealer Dropdown - Desktop */}
            {showDealerDropdown && (
              <div className="relative" ref={dealerDropdownRef}>
                <button
                  onClick={() => setDealerDropdownOpen(!dealerDropdownOpen)}
                  className={`flex items-center ml-1 gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all ${
                    isAuthenticated
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isAuthenticated ? (
                    <>
                      <UserCheck size={12} />
                      <span>Dealer</span>
                    </>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>Dealer</span>
                    </>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      dealerDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dealerDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isAuthenticated ? (
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-3">
                          <Check className="size-5" />
                          <span className="font-bold text-sm">
                            Dealer Authenticated
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          You can now view dealer prices
                        </p>
                        {/* <button
                          onClick={() => {
                            logout()
                            setDealerDropdownOpen(false)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <LogOut size={14} />
                          Logout
                        </button> */}
                      </div>
                    ) : (
                      <form onSubmit={handleDealerSubmit} className="p-4">
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Enter Dealer Password
                        </label>
                        <div className="relative mb-3">
                          <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={12}
                          />
                          <input
                            type="password"
                            value={dealerPassword}
                            onChange={(e) => setDealerPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            disabled={isLoading}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading || !dealerPassword.trim()}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          {isLoading ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                          ) : (
                            <Check size={12} />
                          )}
                          OK
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search Box */}
              <div className="pb-3 border-b border-slate-100 mb-3">
                <SearchBox
                  setMobileMenu={setMobileMenuOpen}
                  closeOnEscape={false}
                />
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

              {/* Mobile Dealer Section */}
              {showDealerDropdown && (
                <div
                  className={cn(
                    ' border-slate-100 my-2 pt-2',
                    !isAuthenticated ? 'border-t' : 'hidden',
                  )}
                  ref={mobileDealerRef}
                >
                  {!isAuthenticated && (
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setDealerDropdownOpen(!dealerDropdownOpen)
                        }
                        className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 text-amber-700 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Lock size={18} />
                          <span className="text-sm font-bold">
                            Dealer Login
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            dealerDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {dealerDropdownOpen && (
                        <form
                          onSubmit={handleDealerSubmit}
                          className="px-3 pb-3 space-y-2"
                        >
                          <div className="relative">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              size={14}
                            />
                            <input
                              type="password"
                              value={dealerPassword}
                              onChange={(e) =>
                                setDealerPassword(e.target.value)
                              }
                              placeholder="Enter password"
                              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                              disabled={isLoading}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isLoading || !dealerPassword.trim()}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            {isLoading ? (
                              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                            ) : (
                              <Check size={14} />
                            )}
                            OK
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
