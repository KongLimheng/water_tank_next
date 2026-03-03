export default function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold text-[#E60012] text-center mb-8 uppercase tracking-wide">
      {title}
    </h2>
  )
}
