/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'qrcode'],
  // ensure Next.js resolves absolute paths properly
}

export default nextConfig;
