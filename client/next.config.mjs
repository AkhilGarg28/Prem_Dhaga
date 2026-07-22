/** @type {import('next').NextConfig} */

// ─── Security Headers ─────────────────────────────────────────────────────────
// Applied to every response. CSP is intentionally permissive for Three.js
// ('unsafe-eval') — documented trade-off in Phase 0 plan.
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com")',
  },
  {
    // NOTE: 'unsafe-eval' required by Three.js GLSL shader compilation.
    // 'unsafe-inline' required by GSAP/Framer Motion style injection.
    // Scoped as tightly as possible given these library constraints.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com",
      "media-src 'self' blob: https://res.cloudinary.com",
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com http://localhost:5000 https://premdhaga.com",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  // ─── TypeScript / ESLint ────────────────────────────────────────────────────
  // Keep these enabled so CI catches regressions. They were disabled — re-enabled
  // as part of Phase 0 hardening. Fix any errors before marking phase done.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ─── Image Optimisation ──────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',  // Google profile photos
        pathname: '/**',
      },
    ],
  },

  // ─── Security Headers on All Routes ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // ─── Webpack: Prevent Browser-Only Packages from SSR Bundle ─────────────────
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'howler',
      ];
    }
    return config;
  },
};

export default nextConfig;
