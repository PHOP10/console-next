const nextConfig = {
  env: {
    // dev
    BACKEND_URL: "http://localhost:4000/api",
    NEXTAUTH_URL: "http://localhost:3000",
    AUTH_SECRET_KEY: "secretkeyveryverystrong",
  },
  webpack: (config) => {
    config.externals = [...config.externals, "jsdom"];
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    return config;
  },
  reactStrictMode: false,
  output: "standalone",
  images: {
    unoptimized: true,
  },
};
module.exports = nextConfig;
