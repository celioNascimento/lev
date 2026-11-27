import type { MetadataRoute } from 'next'

// Torna o site instalável no celular (PWA), sem passar por loja de apps.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lev',
    short_name: 'Lev',
    description: 'Gestão da casa, de um jeito simples.',
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#0f766e',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
