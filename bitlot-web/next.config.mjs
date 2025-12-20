/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stacks/connect', '@stacks/network', '@stacks/common', '@stacks/transactions'],
};

export default nextConfig;
