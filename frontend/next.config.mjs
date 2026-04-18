/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      { source: "/DynamicServicePage", destination: "/", permanent: false },
      { source: "/FaqHubPage", destination: "/ukk", permanent: false },
      { source: "/PriceCalculatorPage", destination: "/hintalaskuri", permanent: false },
      { source: "/ReferencesPage", destination: "/referenssit", permanent: false },
      { source: "/ServicePage", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
