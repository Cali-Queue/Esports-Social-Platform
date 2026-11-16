// Django runs separately (python manage.py runserver). Proxying /api through Next
// keeps the browser on one origin, so Django's session + CSRF cookies just work.
const DJANGO_URL = process.env.DJANGO_URL || 'http://127.0.0.1:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Next strips trailing slashes, Django's URLs need them, so add it back here.
      // Call these without the slash from the frontend: fetch('/api/auth/signup')
      { source: '/api/:path*', destination: `${DJANGO_URL}/api/:path*/` },
    ];
  },
};

export default nextConfig;
