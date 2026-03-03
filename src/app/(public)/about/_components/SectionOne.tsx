// components/about/HeroSection.tsx
import HtmlContent from '@/components/ui/HtmlContent'
import { Section1 } from '@/types'

export default function HeroSection({ data }: { data: Section1 }) {
  return (
    <section className="py-4">
      {/* Banner Image */}
      {/* <div className="w-full relative">
        <ResponsiveImage
          src={data.image}
          alt="Fa De Manufacture Banner"
          className="w-full h-full object-contain aspect-video"
          priority
        />
      </div> */}

      <div
        className="
        transform transition-all duration-[1200ms] 
        ease-[cubic-bezier(0.22,1,0.36,1)]
        opacity-100 translate-y-0 delay-0
      "
      >
        <div className="group relative w-full overflow-hidden rounded duration-500 transition-all">
          <img
            alt="Fa De Manufacture Banner"
            className="w-full h-full object-contain"
            src={data.image}
          />
        </div>
      </div>

      {/* Content Below Banner */}
      <div className="container mx-auto p-4 max-w-4xl text-center">
        <HtmlContent
          html={data.content}
          className="text-lg md:text-xl text-gray-800 space-y-4"
        />
      </div>
    </section>
  )
}
