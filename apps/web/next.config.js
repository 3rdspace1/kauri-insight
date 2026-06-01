const path = require('path')
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev')

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
  serverExternalPackages: ['@cloudflare/puppeteer'],
  webpack(config, { nextRuntime }) {
    if (nextRuntime === 'edge') {
      // @cloudflare/puppeteer contains internal references to Node.js built-in
      // modules (path, fs, fs/promises) that are only used in desktop-Chrome
      // code paths, not in the Cloudflare Workers path.  Provide empty stubs so
      // webpack can trace through the module graph without errors.
      config.resolve.alias = {
        ...config.resolve.alias,
        path: path.resolve(__dirname, 'src/lib/stubs/path.js'),
        fs: path.resolve(__dirname, 'src/lib/stubs/fs.js'),
        'fs/promises': path.resolve(__dirname, 'src/lib/stubs/fs-promises.js'),
      }
    }
    return config
  },
}

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error)
}

module.exports = nextConfig
