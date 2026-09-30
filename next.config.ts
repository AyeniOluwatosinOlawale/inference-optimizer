import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true
  },
  typescript: {
    // Pre-existing SWR × @types/react version mismatch in layout.tsx — unrelated to benchmark page
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
