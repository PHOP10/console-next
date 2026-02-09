"use client";

import { axiosAuth } from "../axios";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRefreshToken } from "./useRefreshToken";

const useAxiosAuth = () => {
  const { data: session } = useSession();
  const refreshToken = useRefreshToken(); // ✅ เรียก hook refresh token มาเตรียมไว้

  useEffect(() => {
    // 1. Request Interceptor: แนบ Token
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          if (session?.user && (session.user as any).accessToken) {
            config.headers["Authorization"] = `Bearer ${
              (session.user as any).accessToken
            }`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 2. Response Interceptor: จัดการ Error และ Refresh Token
    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error.config;

        // ✅ จุดที่แก้ 1: ใส่ ?. (Optional Chaining) ป้องกัน App Crash ถ้า response ไม่มีค่า
        // เช็คว่า error.response มีค่าก่อนค่อยเช็ค status
        if (error.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          try {
            // ✅ จุดที่แก้ 2: พยายาม Refresh Token ก่อน (ของเดิมสั่ง signOut เลย)
            await refreshToken();

            // หมายเหตุ: เนื่องจาก refreshToken ของคุณไปอัปเดต session object โดยตรง
            // เราจึงดึงค่าจาก session ปัจจุบัน (ที่หวังว่าจะถูกอัปเดตแล้ว) หรือคุณอาจต้องแก้ useRefreshToken ให้ return token ใหม่มาด้วย
            // แต่เบื้องต้นลองยิงซ้ำดูครับ
            prevRequest.headers["Authorization"] = `Bearer ${
              (session?.user as any).accessToken
            }`;

            return axiosAuth(prevRequest);
          } catch (refreshError) {
            // ถ้า Refresh ไม่ผ่านจริงๆ ค่อยดีดออก
            signOut();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
    };
  }, [session, refreshToken]); // ✅ ใส่ dependency ให้ครบ

  return axiosAuth;
};

export default useAxiosAuth;
