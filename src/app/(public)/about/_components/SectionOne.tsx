// components/about/HeroSection.tsx
import HtmlContent from '@/components/ui/HtmlContent'
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
          <img
            alt="Fa De Manufacture Banner"
            className="w-full h-full object-contain"
            src={data.image}
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
        <HtmlContent
          html={data.content}
          className="text-lg md:text-xl text-gray-800 space-y-4"
        />
      </motion.div>
    </section>
  )
}
