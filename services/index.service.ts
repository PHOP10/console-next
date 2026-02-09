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
    getNotificationCounts: async (userId: string) => {
      return await axiosInstance
        .get(`${baseUrlApiNotifications}/user/${userId}/counts`) // ตรงกับ Backend
        .then((res) => res.data) // คาดหวัง: { unread: 5, menuCounts: { maCar: 2 } }
        .catch((err) => {
          console.error("Error getting notification counts:", err);
          return { unread: 0, menuCounts: {} }; // Return ค่ากันตาย กันหน้าเว็บพัง
        });
    },

    // ✅ 2. ฟังก์ชันกดอ่านแล้วเคลียร์เลข (ใช้ตอนคลิกเมนู)
    markMenuRead: async (userId: string, menuKey: string) => {
      return await axiosInstance
        .patch(`${baseUrlApiNotifications}/user/${userId}/mark-read`, {
          menuKey,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error("Error marking menu read:", err);
        });
    },

    // ✅ 3. (เผื่อใช้) ดึงรายการแจ้งเตือนทั้งหมดมาแสดงเป็น List
    getUserNotifications: async (userId: string) => {
      return await axiosInstance
        .get(`${baseUrlApiNotifications}/user/${userId}`)
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
