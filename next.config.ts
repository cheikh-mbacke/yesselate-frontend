import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.nicerenovation.sn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Rewrites pour proxy API si nécessaire
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/:path*`,
      },
    ];
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Activation du mode React strict
  reactStrictMode: true,

  // Configuration Turbopack (Next.js 16+)
  turbopack: {
    // Root directory explicite pour éviter le warning
    root: process.cwd(),
  },

  // Fallback webpack pour compatibilité (si besoin de revenir à webpack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }
    return config;
  },

  // Configuration i18n si nécessaire (français par défaut)
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
};

export default nextConfig;
