'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { cn } from '@/lib/utils'
import { OptimizedImage } from './ui/OptimizedImage'

export default function Footer() {
  const { settings, isLoading: isSettingsLoading } = useSettings()

  return (
    <footer className="pt-10 pb-8 font-sans">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Header Section */}
        {isSettingsLoading ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="bg-slate-200 rounded-lg h-full"></div>
          </div>
        ) : settings ? (
          <>
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl xl:text-4xl font-bold mb-6 font-sans">
                លោកអ្នកអាចទំនាក់ទំនងយើងតាមរយៈ៖
              </h3>
              <div className="space-y-4 ">
                <div className="text-sm md:text-lg xl:text-2xl flex items-center gap-2">
                  <span className="font-bold text-black min-w-[120px]">
                    ទូរស័ព្ទលេខ:
                  </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="md:text-base text-blue-500 hover:text-blue-400 underline decoration-blue-500/50"
                  >
                    {settings.phone}
                  </a>
                </div>
                <div className="text-sm md:text-lg xl:text-2xl flex items-center gap-2">
                  <span className="font-bold min-w-[120px]">
                    សារអេឡិចត្រូនិច:
                  </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="md:text-base text-blue-500 hover:text-blue-400 underline decoration-blue-500/50"
                  >
                    {settings.email}
                  </a>
                </div>
                <div className="text-sm md:text-lg xl:text-2xl flex items-center gap-2">
                  <span className="font-bold min-w-[120px]">អាស័យដ្ឋាន:</span>
                  <span className="md:text-base">{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 mt-4">
                {/* Social Icons */}
                {settings.socials &&
                  settings.socials.map((social, index) => {
                    const socialUrl = social.url
                      ? social.url.startsWith('http')
                        ? social.url
                        : `https://${social.url}`
                      : null

                    return (
                      <a
                        key={index}
                        href={socialUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'rounded-full overflow-hidden size-10 relative inline-block',
                          socialUrl
                            ? 'cursor-pointer'
                            : 'pointer-events-none opacity-50',
                        )}
                      >
                        <OptimizedImage
                          src={
                            social.image ||
                            generatePlaceholderImage(`Social ${index + 1}`)
                          }
                          alt={social.url || `Social Icon ${index + 1}`}
                          className="size-full object-contain"
                        />
                      </a>
                    )
                  })}
              </div>
            </div>

            {/* Map Section */}
            {settings.mapUrl && (
              <div className="w-full h-[350px] bg-slate-800 rounded-lg overflow-hidden border border-slate-800 mb-8 relative">
                <iframe
                  src={settings.mapUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: 'invert(90%) hue-rotate(180deg) contrast(90%)',
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  title="H2O Location"
                ></iframe>
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-overlay"></div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </footer>
  )
}
