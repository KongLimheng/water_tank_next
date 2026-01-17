import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Water Tank Shop',
  description: 'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
  icons: {
    icon: '/logo.jpg',
  },
  openGraph: {
    images: ['/cover.jpg'],
    description: 'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    title: 'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    siteName: 'Fa De Manufacture Co., LTD.',
    type: 'website',

  },
  twitter: {
    images: ['/cover.jpg'],
    description: 'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    title: 'Fa De Manufacture Co., LTD. ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Khmer&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        </Providers>
      </body>
    </html>
  );
}
