
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
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/content/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/content/**',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/publisher/content/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/publisher/content/**',
      }
    ],
  },
};

export default nextConfig;
