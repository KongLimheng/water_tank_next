import { sanitizeKhmerText } from '@/lib/utils'
import DOMPurify from 'dompurify'

export default function HtmlContent({
  html,
  className = '',
}: {
  html: string
  className?: string
}) {
  const cleanHtml = DOMPurify.sanitize(sanitizeKhmerText(html), {
    ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['style', 'class'],
  }).replace(/<p([^>]*)><\/p>/g, '<p$1><br></p>')

  return (
    <div
      className={`khmer-text prose-sm font-sans leading-relaxed text-gray-700 ${className} whitespace-pre-wrap`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
      style={{
        // Critical for Khmer on iOS
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        // Disable font features that break Khmer ligatures on iOS Safari
        WebkitFontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0, "clig" 0',
        fontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0, "clig" 0',
        // Prevent iOS from auto-adjusting text size
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        // Ensure proper Khmer text direction
      }}
    />
  )
}
