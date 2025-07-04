const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for path aliases
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  
  // ESLint configuration
  eslint: {
    dirs: ['src/pages', 'src/components', 'src/utils', 'src/hooks', 'src/types'],
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig
