const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3', 'argon2'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
