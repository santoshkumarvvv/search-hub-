/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  ...(isStaticExport
    ? { output: 'export', basePath: '/search-hub-', trailingSlash: true }
    : {
        async headers() {
          return [
            {
              source: '/workers/:path*',
              headers: [
                { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
              ],
            },
            {
              source: '/sw.js',
              headers: [
                { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
                { key: 'Clear-Site-Data', value: '"cache", "storage"' },
              ],
            },
          ];
        },
      }),
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
