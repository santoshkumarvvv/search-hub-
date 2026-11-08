/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  ...(isStaticExport
    ? { output: 'export', basePath: '/search-hub-', trailingSlash: true }
    : {
        async headers() {
          return [
            {
              source: '/embed.js',
              headers: [
                { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
                { key: 'Access-Control-Allow-Origin', value: '*' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
              ],
            },
            {
              source: '/workers/:path*',
              headers: [
                { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
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
