/** @type {import('next').NextConfig} */

module.exports = {
    reactStrictMode: true,
    compiler: {
      styledComponents: true
    },
    env: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
    reactStrictMode: true,
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/detalpricing.appspot.com/o/**',
        },
      ],
    },
  }