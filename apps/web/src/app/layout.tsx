import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zorabase — Developer-First Backend as a Service',
  description: 'Ship backends in minutes. PostgreSQL, Auth, Storage, Realtime WebSockets — all in one platform built for developers and AI agents.',
  keywords: ['backend as a service', 'BaaS', 'PostgreSQL', 'authentication', 'realtime', 'storage', 'developer tools'],
  openGraph: {
    title: 'Zorabase',
    description: 'Ship backends in minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
