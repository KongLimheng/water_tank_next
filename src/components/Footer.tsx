'use client';

import { useQuery } from '@tanstack/react-query';
import { Facebook } from 'lucide-react';
import { getSettings } from '../services/settingsService';

export default function Footer() {
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <footer className="pt-10 pb-8 text-black font-sans">
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
            <div className="mb-8 ">
              <h3 className="text-xl md:text-2xl xl:text-4xl font-bold mb-6 font-khmer">
                លោកអ្នកអាចទំនាក់ទំនងយើងតាមរយៈ៖
              </h3>
              <div className="space-y-4 ">
                <div className="text-sm md:text-lg xl:text-2xl flex items-start gap-2">
                  <span className="font-bold text-black min-w-[120px]">
                    ទូរស័ព្ទលេខ:
                  </span>
                  <span className="tracking-wide">{settings.phone}</span>
                </div>
                <div className="text-sm md:text-lg xl:text-2xl flex items-start gap-2">
                  <span className="font-bold min-w-[120px]">
                    សារអេឡិចត្រូនិច:
                  </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className=" md:text-base text-blue-500 hover:text-blue-400 underline decoration-blue-500/50"
                  >
                    {settings.email}
                  </a>
                </div>
                <div className="text-sm md:text-lg xl:text-2xl flex items-start gap-2">
                  <span className="font-bold min-w-[120px]">អាស័យដ្ឋាន:</span>
                  <span className='' >{settings.address}</span>
                </div>
              </div>
            </div>

            {/* Map Section */}
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

            {/* Bottom Section */}
            <div className="flex flex-col items-center gap-6 mt-8">
              {/* Social Icons */}
              <div className="flex gap-4">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    className="bg-[#1877F2] p-2 rounded text-white hover:opacity-90 transition-opacity transform hover:scale-105"
                  >
                    <Facebook
                      size={24}
                      fill="white"
                      className="stroke-none"
                    />
                  </a>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-slate-300 font-medium text-sm md:text-base">
                  {settings.address}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </footer>
  );
}
