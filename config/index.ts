const config = {
  // ฝั่ง Server ให้คุยผ่านวงแลน Docker โดยตรง (ไม่ผ่าน Nginx)
  // ฝั่ง Client (Browser) ให้วิ่งผ่าน IP จริง
  backendUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://onm.arxencore.com/api",

  // ตัวนี้สำคัญที่สุด: ต้องเป็นชื่อ Container และพอร์ตที่ Backend รันอยู่
  internalUrl: "http://my-backend:4000/api",

  refreshTokenIntervalInSeconds: 1000 * 60 * 60 * 23,
};

export default config;
