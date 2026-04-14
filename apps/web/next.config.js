/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
        },
      ],
    };
  },
  images: {
    domains: ['localhost', 'minio.predem.douala.cm'],
  },
};

module.exports = nextConfig;
