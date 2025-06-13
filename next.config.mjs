/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour la production
  compress: true,
  poweredByHeader: false,

  // Configuration des images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configuration pour Replit
  allowedDevOrigins: ['.replit.dev'],
}