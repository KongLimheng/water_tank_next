'use client'

import { useQuery } from '@tanstack/react-query'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { getSettings } from '../services/settingsService'
import { BannerItem } from '../types'

export const Hero: React.FC = () => {
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
  })

  if (isSettingsLoading) return <HomeSkeleton />
  if (!settings || settings.banners.length === 0) return null

  const [mainBanner, ...gridBanners] = settings.banners

  return (
    <div className="flex flex-col gap-8 px-5 xl:px-40 mt-4">
      <AnimatedBanner banner={mainBanner} index={0} isMainHero />

      {gridBanners.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {gridBanners.map((banner, index) => (
            <AnimatedBanner banner={banner} index={index + 1} key={index} />
          ))}
        </div>
      )}
    </div>
  )
}

interface BannerProps {
  banner: BannerItem
  index: number
  isMainHero?: boolean
}

const AnimatedBanner = ({ banner, index, isMainHero = false }: BannerProps) => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 })

  const waveDelay = isMainHero ? (index % 4) * 150 : (index % 3) * 150

  return (
    <div
      ref={ref}
      style={{ transitionDelay: isVisible ? `${waveDelay}ms` : '0ms' }}
      className={`
        transform transition-all ${isMainHero ? 'duration-[1200ms]' : 'duration-[1000ms]'} 
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : `opacity-0 ${isMainHero ? 'translate-y-32' : 'translate-y-20'}`
        }
      `}
    >
      <BannerContent banner={banner} isMainHero={isMainHero} />
    </div>
  )
}

const BannerContent = ({
  banner,
  isMainHero,
}: {
  banner: BannerItem
  isMainHero: boolean
}) => {
  return (
    <div
      className={`
      group relative w-full overflow-hidden shadow-lg
      transition-all duration-500 hover:shadow-primary-500/20
      ${
        isMainHero
          ? 'md:rounded-2xl rounded-lg'
          : 'aspect-square rounded md:rounded-md'
      }
    `}
    >
      <img
        src={banner.banner_image}
        alt={banner.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div
        className={`
        absolute inset-0 opacity-90
        ${
          isMainHero
            ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
            : 'bg-gradient-to-t from-black/50 via-black/10 to-transparent'
        }
      `}
      />

      <div
        className={`
        absolute bottom-0 left-0 w-full
        ${isMainHero ? 'p-8' : 'p-6'}
      `}
      >
        {/* <h1
          className={`
          font-bold text-white leading-tight
          ${
            isMainHero
              ? 'text-3xl md:text-5xl xl:text-6xl'
              : 'text-xl md:text-2xl'
          }
        `}
        >
          {banner.name}
        </h1> */}
      </div>
    </div>
  )
}

const HomeSkeleton = () => (
  <div className="space-y-8 p-4 px-5 xl:px-40 mt-4">
    <div className="w-full h-[60vh] md:h-[70vh] bg-slate-200 animate-pulse rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-64 md:h-80 bg-slate-200 animate-pulse rounded-xl"
        />
      ))}
    </div>
  </div>
)
