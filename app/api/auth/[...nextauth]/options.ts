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
            // console.log("Attempting login via Internal URL...");
            response = await axios.post(`${config.internalUrl}/auth/login`, {
              username: credentials.username,
              password: credentials.password,
            });
          } catch (internalError) {
            // 2. ถ้า Internal พัง ให้ลองยิงผ่าน Backend URL (Public IP)
            // console.log("Internal login failed, trying via Backend URL...");
            response = await axios.post(`${config.backendUrl}/auth/login`, {
              username: credentials.username,
              password: credentials.password,
            });
          }

          // console.log("Login response:", response);

          if (!response?.data) return null;

          const user = response.data;

          // ตรวจสอบให้แน่ใจว่า user มี role
          if (!user.role) user.role = "user";

          return user;
        } catch (error: any) {
          console.error("Login error:", error.response?.data || error.message);

          const status = error.response?.status;
          const backendMessage = error.response?.data?.message;

          if (backendMessage) {
            throw new Error(backendMessage);
          }

          if (status === 404) {
            throw new Error("User not found");
          } else if (status === 401) {
            throw new Error("Password incorrect");
          }

          throw new Error(
            "Login failed: Invalid credentials or server unreachable",
          );
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
