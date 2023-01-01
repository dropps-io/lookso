require('dotenv').config({ path: `./.env.${process.env.ENVIRONMENT}` });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  env: {
    // Reference a variable that was defined in the .env.* file and make it available at Build Time
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  },
}

module.exports = nextConfig
