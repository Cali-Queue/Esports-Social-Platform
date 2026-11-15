/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/discover/:endpoint',
        destination: 'http://127.0.0.1:8000/api/discover/:endpoint/',
      },
    ];
  },
};

export default nextConfig;