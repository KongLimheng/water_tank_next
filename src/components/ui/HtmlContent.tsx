import DOMPurify from 'dompurify'

export default function HtmlContent({
  html,
  className = '',
}: {
  html: string
  className?: string
}) {
  const cleanHtml = DOMPurify.sanitize(html)

  return (
    <div
      className={`prose-sm leading-relaxed text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
