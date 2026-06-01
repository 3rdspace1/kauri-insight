// Stub for fs module in edge runtime (used by @cloudflare/puppeteer desktop-only paths)
export default {
  readFileSync: () => Buffer.from(''),
  existsSync: () => false,
}
