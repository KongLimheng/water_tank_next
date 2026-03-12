// components/about/CertificatesSection.tsx
import HtmlContent from '@/components/ui/HtmlContent'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { AboutUsSection3Item } from '@/types'
import { motion } from 'motion/react'
import Image from 'next/image'

export default function CertificatesSection({
  data,
}: {
  data: { items: AboutUsSection3Item[]; description?: string }
}) {
  return (
    <section className="py-4">
      {/* Header & Mission Text */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <HtmlContent
          html={data.description || ''}
          className="text-gray-700 space-y-4"
        />
      </div>

      <div className="text-center text-[14px] lg:text-2xl font-bold text-gray-800 mb-8 border-rose-500 border-2 p-1 lg:p-2 rounded lg:rounded-md">
        Quality & Certification
      </div>

      {/* Certificate Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {data.items.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border overflow-hidden border-slate-200 shadow-sm rounded-lg flex flex-col items-center"
            key={index}
          >
            <div className="w-full aspect-[1/1.4142] p-2 bg-white relative">
              <Image
                src={item.image || generatePlaceholderImage('Certificate')}
                alt={item.title || 'Certificate'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 33vw"
                // unoptimized={item.image?.startsWith('http')}
              />
            </div>
            <p className="text-center font-bold text-blue-900 py-2">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
