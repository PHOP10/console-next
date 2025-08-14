const config = {
  backendUrl: process.env.BACKEND_URL || "localhost:4000/api",
  refreshTokenIntervalInSeconds: 1000 * 60 * 60 * 23,
};
export default config;
