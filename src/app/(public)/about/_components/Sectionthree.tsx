// components/about/CertificatesSection.tsx
import HtmlContent from '@/components/ui/HtmlContent'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { AboutUsSection3Item } from '@/types'
import ResponsiveImage from './ResponsiveImage'

export default function CertificatesSection({
  data,
}: {
  data: { items: AboutUsSection3Item[]; description?: string }
}) {
  return (
    <section className="py-4">
      {/* Header & Mission Text */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        {/* If your API sends the title "Quality and Certification" in HTML, it renders here */}
        <HtmlContent
          html={data.description || ''}
          className="text-gray-700 space-y-4"
        />
      </div>

      <div className="text-center text-lg lg:text-2xl font-bold text-gray-800 mb-8 border-rose-500 border-2  p-2 rounded-md">
        Quality & Certification
      </div>

      {/* Certificate Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
        {data.items.map((item, index) => (
          <div key={index} className="group overflow-hidden rounded border ">
            <ResponsiveImage
              src={item.image || generatePlaceholderImage('Certificate')}
              alt={item.title || `Certificate ${index + 1}`}
              className="object-contain aspect-[3/4]"
            />
            <p className="text-center my-2 font-bold text-lg lg:text-2xl text-blue-400">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
