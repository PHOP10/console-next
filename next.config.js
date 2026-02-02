const nextConfig = {
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
