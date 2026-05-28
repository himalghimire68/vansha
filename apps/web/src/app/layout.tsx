import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vansha Lineage — The Living Archive',
  description: "Preserve your ancestral heritage. Discover distant relatives. Connect generations through the living archive of your family's story.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
