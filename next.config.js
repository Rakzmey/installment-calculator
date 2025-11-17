/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← This tells Next.js to export static HTML
  distDir: 'out',   // ← The output folder (not .next anymore)
  images: {
    unoptimized: true, // Cloudflare will handle images
  },
};

module.exports = nextConfig;
