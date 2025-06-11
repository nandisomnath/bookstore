
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Open Library covers are typically served over HTTPS
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/b/**', // Covers path: /b/id/{cover_id}-S|M|L.jpg or /b/isbn/{isbn}-S|M|L.jpg
      },
    ],
  },
};

export default nextConfig;
