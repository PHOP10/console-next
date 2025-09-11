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
