import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.56.1', 
    'localhost:4400', 
    'lvh.me:4400',
    '*.lvh.me:4400',
    'deployhq.host',
    '*.deployhq.host'
  ],
};

export default nextConfig;
