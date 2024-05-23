/** @type {import('next').NextConfig} */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fukutotojido.s-ul.eu",
      }
    ]
  }
};
