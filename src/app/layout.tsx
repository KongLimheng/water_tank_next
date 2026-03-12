import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Battambang, Hanuman, Inter, Kantumruy_Pro } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const battambang = Battambang({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-battambang',
  display: 'swap',
})

const hanuman = Hanuman({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-hanuman',
  display: 'swap',
})
const kantumruy = Kantumruy_Pro({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-kantumruy_pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Water Tank Factory',
  description:
    'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
  icons: {
    icon: '/logo.jpg',
  },
  openGraph: {
    images: ['/cover.jpg'],
    description:
      'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    title:
      'Water Tank Factory. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    siteName: 'Water Tank Factory',
    type: 'website',
  },
  twitter: {
    images: ['/cover.jpg'],
    description:
      'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    title:
      'Water Tank Factory. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        ></link> */}
      </head>
      <body
        className={cn(
          inter.className,
          kantumruy.variable,
          battambang.variable,
          hanuman.variable,
        )}
        suppressHydrationWarning={true}
        style={{
          fontFamily:
            'var(--font-kantumruy_pro),var(--font-battambang), var(--font-hanuman), system-ui, sans-serif',
        }}
      >
        <Providers>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar
          />
        </Providers>
      </body>
    </html>
  )
}
