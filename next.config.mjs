/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/search-hub-',
  reactStrictMode: true,
  trailingSlash: true,

  images: {
    unoptimized: true
  }
};

export default nextConfig;
