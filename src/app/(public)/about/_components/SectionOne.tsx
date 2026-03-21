// components/about/HeroSection.tsx
import HtmlContent from '@/components/ui/HtmlContent'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { Section1 } from '@/types'
import { motion } from 'framer-motion'

export default function HeroSection({ data }: { data: Section1 }) {
  return (
    <section className="py-4">
      {/* Banner Image */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.3 }}
      >
        <div className="group relative w-full overflow-hidden rounded duration-500 transition-all">
          {/* <Image
            alt="Fa De Manufacture Banner"
            className="w-full h-full object-contain"
            src={data.image}
          /> */}

          <OptimizedImage
            src={data.image}
            alt="Fa De Manufacture Banner"
            className="size-full object-contain"
            width={1920}
          />
        </div>
      </motion.div>

      {/* Content Below Banner */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 max-w-4xl text-center"
      >
        <HtmlContent html={data.content} className="text-gray-800" />
      </motion.div>
    </section>
  )
}
