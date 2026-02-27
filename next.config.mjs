import withPayload from '@payloadcms/next/withPayload';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /\/api\/game-data/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'game-data-cache',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 300,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPayload(withPWA(nextConfig));
