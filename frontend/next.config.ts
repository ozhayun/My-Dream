import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove standalone for Netlify/Vercel deployment
  // output: 'standalone', // Only use for Docker/self-hosted
  
  // Add empty turbopack config to silence the warning
  // Using webpack for dev mode compatibility
  turbopack: {},
};

export default nextConfig;
