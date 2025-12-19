import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compressão habilitada
  compress: true,

  // Remover header X-Powered-By por segurança
  poweredByHeader: false,

  // React Strict Mode
  reactStrictMode: true,

  // Configuração de imagens
  images: {
    domains: ['portal.logsmart.com.br'],
    unoptimized: false,
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
