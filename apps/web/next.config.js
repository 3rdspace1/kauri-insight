/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@kauri/db',
    '@kauri/ai',
    '@kauri/visuals',
    '@kauri/graphics',
    '@kauri/integrations',
    '@kauri/domain-packs',
    '@kauri/shared',
  ],
  experimental: {
    serverComponentsExternalPackages: ['drizzle-orm', '@neondatabase/serverless'],
  },
}

module.exports = nextConfig
