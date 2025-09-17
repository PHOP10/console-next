import axios from "@/app/lib/axios/axios";
import { AxiosInstance } from "axios";

export const indexService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiNotifications = "/notifications";
  return {
    getNotifications: async () => {
      return await axiosInstance
        .get(`${baseUrlApiNotifications}/counts/`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getNotificationsUserId: async (userId: string) => {
      return await axiosInstance
        .get(`${baseUrlApiNotifications}/userCounts/${userId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export const getCounts = (userId: string) =>
  axios
    .get(`${API_BASE}/notifications/user/${userId}/counts`)
    .then((r) => r.data);
export const markMenuRead = (userId: string, menuKey?: string) =>
  axios
    .patch(`${API_BASE}/notifications/user/${userId}/mark-read`, { menuKey })
    .then((r) => r.data);
export const getUserNotifications = (userId: string) =>
  axios.get(`${API_BASE}/notifications/user/${userId}`).then((r) => r.data);
