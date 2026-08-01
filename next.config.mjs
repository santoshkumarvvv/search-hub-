/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  // Default build = server mode so the live API monitors
  // (/api/status, /api/github-stats) stay dynamic and real-time.
  // For a GitHub Pages static export, build with STATIC_EXPORT=true
  // (e.g. `npm run build:static`).
  ...(isStaticExport
    ? { output: 'export', basePath: '/search-hub-', trailingSlash: true }
    : {}),
  reactStrictMode: true,

  images: {
    unoptimized: true
  }
};

export default nextConfig;
