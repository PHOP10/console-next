// import CredentialsProvider from "next-auth/providers/credentials";
// import axios from "@/app/lib/axios/axios";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "username-login",
//       name: "Login",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) {
//           return null;
//         }
//         try {
//           // console.log("credentials", credentials);
//           const response = await axios.post("/auth/login", {
//             username: credentials?.username,
//             password: credentials?.password,
//           });
//           if (!response) {
//             return null;
//           }
//           let user = response.data;

//           return user;
//         } catch (error: any) {
//           throw new Error(error);
//         }
//       },
//     }),
//   ],
//   session: {
//     jwt: true,
//     maxAge: 60 * 60 * 24,
//   },
//   callbacks: {
//     async session({ session, token }: { session: any; token: any }) {
//       session.user = token;
//       return session;
//     },
//     async jwt({ token, user }: { token: any; user: any }) {
//       return { ...token, ...user };
//     },
//     async redirect({ url, baseUrl }: { url: any; baseUrl: string }) {
//       return baseUrl;
//     },
//   },
//   secret: process.env.AUTH_SECRET_KEY,
//   pages: {
//     signIn: "/signin",
//   },
// };

// app/lib/auth/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "@/app/lib/axios/axios";

export const authOptions = {
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
          const response = await axios.post("/auth/login", {
            username: credentials.username,
            password: credentials.password,
          });

          if (!response?.data) return null;

          const user = response.data;

          // ตรวจสอบให้แน่ใจว่า user มี role
          if (!user.role) user.role = "user";

          return user;
        } catch (error: any) {
          throw new Error(error.message || "Login failed");
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
