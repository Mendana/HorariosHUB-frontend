import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Necesario para el Dockerfile multi-stage (genera server.js standalone)
  output: 'standalone',
};

export default withNextIntl(nextConfig);
