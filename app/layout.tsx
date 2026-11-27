import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lev',
  description: 'Gestão da casa, de um jeito simples.',
  applicationName: 'Lev',
  // Nada de dados financeiros deve ser indexado por buscadores.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Lev', statusBarStyle: 'default' },
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        {children}
      </body>
    </html>
  )
}
