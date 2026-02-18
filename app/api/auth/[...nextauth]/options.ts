import CredentialsProvider from "next-auth/providers/credentials";
// import axios from "@/app/lib/axios/axios";
import type { NextAuthOptions } from "next-auth";
import axios from "axios";
import config from "@/config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "username-login",
      name: "Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          let response;
          try {
            // 1. ลองยิงผ่าน Internal URL (Docker Network)
            response = await axios.post(`${config.internalUrl}/auth/login`, {
              username: credentials.username,
              password: credentials.password,
            });
          } catch (internalError) {
            // 2. ถ้า Internal พัง ให้ลองยิงผ่าน Backend URL (Public IP)
            response = await axios.post(`${config.backendUrl}/auth/login`, {
              username: credentials.username,
              password: credentials.password,
            });
          }

          if (!response?.data) return null;

          const user = response.data;
          // ตรวจสอบให้แน่ใจว่า user มี role
          if (!user.role) user.role = "user";

          return user;
        } catch (error: any) {
          console.error(
            "Login error log:",
            error.response?.data || error.message,
          );

          const status = error.response?.status;
          let backendMessage = error.response?.data?.message;

          // ✅ ปรับปรุง: ถ้า Backend ส่งข้อความมา (ภาษาไทย) ให้ใช้เลย
          if (backendMessage) {
            // บางที NestJS ส่ง Validation Error เป็น Array เราต้องแปลงเป็น String
            if (Array.isArray(backendMessage)) {
              backendMessage = backendMessage.join(", ");
            }
            throw new Error(backendMessage);
          }

          // ✅ ปรับปรุง: ถ้า Backend ไม่ส่ง Message มา (เช่น Nginx ตัดบท) ให้ใช้ข้อความสำรองที่เป็นไทย
          if (status === 404) {
            throw new Error("ไม่พบชื่อผู้ใช้งาน");
          } else if (status === 401) {
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          throw new Error("เข้าสู่ระบบไม่สำเร็จ หรือ เชื่อมต่อ Server ไม่ได้");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 วัน
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // ถ้ามี user จาก authorize ให้ merge เข้ากับ token
      if (user) {
        token = { ...token, ...user };
        token.role = user.role ?? "user";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // รวม token เข้า session.user
      session.user = { ...session.user, ...token };
      session.user.role = token.role ?? "user"; // fallback
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl; // redirect หลัง login
    },
  },
  secret: process.env.AUTH_SECRET_KEY,
  pages: {
    signIn: "/signin",
  },
};
