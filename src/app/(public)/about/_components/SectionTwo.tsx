// components/about/FeaturesSection.tsx

import HtmlContent from '@/components/ui/HtmlContent'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { cn } from '@/lib/utils'
import { AboutUsItem } from '@/types'
import { motion } from 'motion/react'

export default function FeaturesSection({ data }: { data: AboutUsItem[] }) {
  return (
    <section className="py-4">
      <div className="flex flex-col gap-8">
        {data.map((item, index) => {
          const isEven = index % 2 === 0
          return (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className={cn(
                'flex flex-col md:flex-row items-center gap-12',
                isEven ? 'md:flex-row' : 'md:flex-row-reverse',
              )}
              key={index}
            >
              <div className="sm:w-[40%] w-1/2 md:w-1/3">
                <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 relative">
                  <img
                    src={
                      item.image ??
                      generatePlaceholderImage(`Product ${index + 1}`)
                    }
                    alt={`Product ${index}`}
                    className="w-full h-auto rounded-lg object-cover aspect-square"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <HtmlContent
                  html={item.content || ''}
                  className="text-gray-700"
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
