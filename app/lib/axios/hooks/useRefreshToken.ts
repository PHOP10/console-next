"use client";

import axios from "@/app/lib/axios/axios";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export const useRefreshToken = () => {
  const { data: session } = useSession();

  const refreshToken = async () => {
    if (session && session.user) {
      const res = axios.post("/auth/refresh", {
        refreshToken: (session?.user as any).refreshToken,
      });
      res
        .then((response) => {
          if (session) {
            (session?.user as any).accessToken = response.data.accessToken;
            (session?.user as any).refreshToken = response.data.refreshToken;
          }
        })
        .catch((error) => {
          signOut();
        });
    }
  };

  return refreshToken;
};
