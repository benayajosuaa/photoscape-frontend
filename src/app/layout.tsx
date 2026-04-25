import type { Metadata } from 'next'
import { Geist, Geist_Mono } from '@/lib/font-fallback'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteTitle = 'Photoscape - Booking Photostudio untuk mu'
const siteDescription =
  'Photoscape memudahkan booking photostudio dengan jadwal fleksibel, paket lengkap, dan proses reservasi cepat.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: 'Photoscape',
  keywords: [
    'Photoscape',
    'booking photostudio',
    'sewa studio foto',
    'reservasi photostudio',
    'studio foto',
    'foto keluarga',
    'photobox',
  ],
  category: 'photography',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Photoscape',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/logowok.png',
        width: 512,
        height: 512,
        alt: 'Logo Photoscape',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/logowok.png'],
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: ['/icon.png'],
    apple: [{ url: '/icon.png', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-gray-900">{children}</body>
    </html>
  )
}
