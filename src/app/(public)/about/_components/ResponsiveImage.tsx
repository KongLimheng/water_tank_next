// components/ResponsiveImage.tsx
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
}: ResponsiveImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        className={cn('rounded-md object-contain')}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        quality={90}
        unoptimized={true}
        fill
        loading="eager"
      />
    </div>
  )
}
