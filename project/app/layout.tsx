import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinanceTracker - Premium Financial Management',
  description: 'Enterprise-level financial tracking and analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}