// const nextConfig = {
//   webpack: (config) => {
//     config.externals = [...config.externals, "jsdom"];
//     config.module.rules.push({
//       test: /\.node/,
//       use: "raw-loader",
//     });
//     return config;
//   },
//   reactStrictMode: false,
//   output: "standalone",
//   images: {
//     unoptimized: true,
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      jsdom: "jsdom",
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
