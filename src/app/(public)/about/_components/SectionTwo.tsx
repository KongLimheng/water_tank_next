// components/about/FeaturesSection.tsx

import HtmlContent from '@/components/ui/HtmlContent'
import { AboutUsItem } from '@/types'
import ResponsiveImage from './ResponsiveImage'

export default function FeaturesSection({ data }: { data: AboutUsItem[] }) {
  return (
    <section className="py-4">
      <div className="flex flex-col gap-8">
        {data.map((item, index) => {
          const isEven = index % 2 === 0
          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center justify-between gap-8 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Image Side */}
              {item.image && (
                <div className="relative flex-1 rounded overflow-hidden border-red-300 border-2">
                  <ResponsiveImage
                    src={item.image}
                    alt={`Product ${index}`}
                    className="object-contain aspect-square"
                  />
                </div>
              )}

              {/* Text Side */}
              <div className="w-full md:w-2/3">
                <div className="p-4">
                  <HtmlContent
                    html={item.content || ''}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
