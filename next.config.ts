
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
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  webpack: (config) => {
    // Avoid bundling optional tracing/exporter modules and firebase plugin that Genkit may optionally import
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      '@opentelemetry/exporter-jaeger': false,
      '@opentelemetry/exporter-zipkin': false,
      '@genkit-ai/firebase': false,
    };
    return config;
  },
};

export default nextConfig;
